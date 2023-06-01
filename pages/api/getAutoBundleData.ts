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

  try {
    const autoBundleData = await prisma.auto_bundle_data.findUnique({
      where: { shop },
    });

    if (autoBundleData === null) {
      return res.status(404).send("message: Automatic bundle data is empty");
    } else {
      const autoBundleDataObj = JSON.stringify(autoBundleData);
      return res.status(200).json(autoBundleDataObj);
    }
  } catch (error) {
    console.error("Exception while getting auto bundle data:", error);
    return res
      .status(500)
      .send("message: Error while getting auto bundle data");
  }
};

export const config = {
  api: {
    externalResolver: true,
  },
};

export default withMiddleware("verifyRequest")(handler);
