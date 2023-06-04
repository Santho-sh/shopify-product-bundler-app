import withMiddleware from "@/utils/middleware/withMiddleware";
import clientProvider from "@/utils/clientProvider";
import { NextApiHandler } from "next";
import prisma from "@/utils/prisma";
import { discountDelete } from "@/utils/shopifyQueries";

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

  try {
    // delete discount from database
    await prisma.auto_bundle_data.delete({
      where: {
        shop: shop,
      },
    });
    const discountData = await prisma.bundle_discount_id.delete({
      where: {
        bundleId: "Auto Generated Bundle",
      },
    });
    // Delete the discount
    if (discountData !== null) {
      let discountId = discountData.discountId;
      await discountDelete(client, [discountId]);
    }
    return res.status(200).send("message: Automatic bundle data deleted");
  } catch (error) {
    console.error("Exception while deleting auto bundle data:", error);
    return res
      .status(500)
      .send("message: Error while deleting auto bundle data");
  }
};

// Is the product have the required tag or not
function isHaveRequiredTags(requiredTags: string[], productTags: string[]) {
  if (requiredTags.length == 0) {
    return true;
  }
  for (let requiredTag in requiredTags) {
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
