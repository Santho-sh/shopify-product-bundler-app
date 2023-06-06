import withMiddleware from "@/utils/middleware/withMiddleware";
import clientProvider from "@/utils/clientProvider";
import { NextApiHandler } from "next";
import { getDiscountData } from "@/utils/shopifyQueries";
import prisma from "@/utils/prisma";

export type getDiscountData = {
  automaticDiscount: {
    title: string;
    shortSummary: string;
    asyncUsageCount: number;
    createdAt: string;
  };
};

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
    const bundles = await prisma.bundle_discount_id.findMany();
    let data = [];

    for (let bundle of bundles) {
      const response: getDiscountData | null = await getDiscountData(
        client,
        bundle.discountId
      );

      if (response !== null) {
        data.push({
          bundleName: bundle.bundleName,
          title: response.automaticDiscount.title,
          createdAt: response.automaticDiscount.createdAt,
          summary: response.automaticDiscount.shortSummary,
          sales: response.automaticDiscount.asyncUsageCount,
        });
      }
    }
    const discountData = JSON.stringify(data);
    return res.status(200).json(discountData);
  } catch (error) {
    console.error("Exception while getting collections:", error);
    return res.status(500).send("message: Error while getting collections");
  }
};

export const config = {
  api: {
    externalResolver: true,
  },
};

export default withMiddleware("verifyRequest")(handler);
