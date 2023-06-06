import withMiddleware from "@/utils/middleware/withMiddleware";
import clientProvider from "@/utils/clientProvider";
import { NextApiHandler } from "next";
import prisma from "@/utils/prisma";
import {
  discountCreate,
  discountDelete,
  getProductsByCollection,
} from "@/utils/shopifyQueries";

export type GetByCollectionProducts = Array<{
  node: {
    products: {
      edges: Array<{
        node: {
          id: string;
          tags: Array<string>;
          priceRangeV2: {
            maxVariantPrice: {
              amount: string;
            };
          };
        };
      }>;
    };
  };
}>;

const handler: NextApiHandler = async (req, res) => {
  //Reject anything that's not a POST
  if (req.method !== "POST") {
    return res.status(400).send({ text: "We don't do that here." });
  }

  const { client, shop, session } = await clientProvider.graphqlClient({
    req,
    res,
    isOnline: true,
  });

  const data = JSON.parse(req.body);

  try {
    await prisma.auto_bundle_data.upsert({
      where: { shop: shop },
      update: {
        collections: data.collections,
        tags: data.tags,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        minProducts: data.minProducts,
        discount: data.discount,
      },
      create: {
        shop: shop,
        collections: data.collections,
        tags: data.tags,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        minProducts: data.minProducts,
        discount: data.discount,
      },
    });

    let collections = data.collections;
    // If user not selected any collection then loop through all collections
    if (collections.length == 0) {
      collections = data.allCollections;
    }

    let autoBundleProducts = [];

    // Filter through products and add products that matches the users requirement
    for (let collection of collections) {
      const response: GetByCollectionProducts = await getProductsByCollection(
        client,
        collection
      );

      if (response.length != 0) {
        let products = response[0]["node"]["products"]["edges"];
        for (let productNode of products) {
          let product = productNode["node"];
          // check for required tags
          if (isHaveRequiredTags(data.tags, product.tags)) {
            let price = parseFloat(
              product["priceRangeV2"]["maxVariantPrice"].amount
            );
            // check for required price
            if (
              isHaveRequiredPrice(
                price,
                parseFloat(data.minPrice),
                parseFloat(data.maxPrice)
              )
            ) {
              autoBundleProducts.push(product.id);
            }
          }
        }
      }
    }

    const discountData = await prisma.bundle_discount_id.findUnique({
      where: {
        bundleId: "Auto Generated Bundle",
      },
    });

    // Delete the old discount if exists
    if (discountData !== null) {
      let discountId = discountData.discountId;
      await discountDelete(client, [discountId]);
    }

    // If autobundle products is grater than 0 then create new discount and update database
    if (autoBundleProducts.length > 0) {
      const discountId = await discountCreate(client, {
        title: "Bundle Discount",
        discount: data.discount,
        products: autoBundleProducts,
        minProducts: data.minProducts,
      });

      await prisma.bundle_discount_id.upsert({
        where: {
          bundleId: "Auto Generated Bundle",
        },
        update: {
          discountId: discountId,
        },
        create: {
          bundleId: "Auto Generated Bundle",
          bundleName: "Auto Generated Bundle",
          discountId: discountId,
          shop: shop,
        },
      });
    }
    return res
      .status(200)
      .send("message: Automatic bundle generation data saved");
  } catch (error) {
    console.error("Exception while saving auto bundle data:", error);
    return res.status(500).send("message: Error while saving auto bundle data");
  }
};

// Is the product have the required tag or not
function isHaveRequiredTags(requiredTags: string[], productTags: string[]) {
  if (requiredTags.length == 0) {
    return true;
  }
  for (let requiredTag of requiredTags) {
    if (productTags.includes(requiredTag)) {
      return true;
    }
  }
  return false;
}

// Is the product have required price
function isHaveRequiredPrice(
  price: number,
  minPrice: number,
  maxPrice: number
) {
  if (price >= minPrice && price <= maxPrice) {
    return true;
  } else if (price >= minPrice && maxPrice == 0) {
    return true;
  } else if (minPrice == 0 && maxPrice == 0) {
    return true;
  }
  return false;
}

export const config = {
  api: {
    externalResolver: true,
  },
};

export default withMiddleware("verifyRequest")(handler);
