import withMiddleware from "@/utils/middleware/withMiddleware";
import clientProvider from "@/utils/clientProvider";
import { NextApiHandler } from "next";
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

  const data = JSON.parse(req.body);

  try {
    await prisma.auto_bundle_data.upsert({
      where: { shop: shop },
      update: {
        collections: data.collections,
        tags: data.tags,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        discount: data.discount,
      },
      create: {
        shop: shop,
        collections: data.collections,
        tags: data.tags,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        discount: data.discount,
      },
    });
    return res
      .status(200)
      .send("message: Automatic bundle generation data saved");
  } catch (error) {
    console.error("Exception while saving auto bundle data:", error);
    return res.status(500).send("message: Error while saving auto bundle data");
  }
};

export const config = {
  api: {
    externalResolver: true,
  },
};

export default withMiddleware("verifyRequest")(handler);
