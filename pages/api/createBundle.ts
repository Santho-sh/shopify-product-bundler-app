import withMiddleware from "@/utils/middleware/withMiddleware";
import clientProvider from "@/utils/clientProvider";
import { NextApiHandler } from "next";
import { createBundle, discountCreate } from "@/utils/shopifyQueries";
import prisma from "@/utils/prisma";

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
    const data = JSON.parse(req.body);
    const response = await createBundle(client, data);
    if (response != null) {
      const discountId = await discountCreate(client, {
        title: response.discountTitle,
        discount: data.discount,
        products: data.products,
        minProducts: data.products.length.toString(),
      });

      await prisma.bundle_discount_id.create({
        data: {
          bundleId: response.bundleId,
          bundleName: data.bundleName,
          discountId: discountId,
          shop: shop,
        },
      });

      return res.status(200).send("message: Bundle created successfully");
    }
    return res.status(400).send("message: Bad request");
  } catch (error) {
    console.error("Exception while creating bundle:", error);
    return res.status(500).send("message: Error while creating bundle");
  }
};

export const config = {
  api: {
    externalResolver: true,
  },
};

export default withMiddleware("verifyRequest")(handler);
