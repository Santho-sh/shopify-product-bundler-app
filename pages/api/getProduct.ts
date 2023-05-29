import withMiddleware from "@/utils/middleware/withMiddleware";
import clientProvider from "@/utils/clientProvider";
import { NextApiHandler } from "next";
import { getProduct } from "@/utils/shopifyQueries";

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
    const response = await getProduct(client, data.id);
    const bundle = JSON.stringify(response);
    return res.status(200).json(bundle);
  } catch (error) {
    console.error("Exception while getting bundle:", error);
    return res.status(500).send("message: Error while getting bundle");
  }
};

export const config = {
  api: {
    externalResolver: true,
  },
};

export default withMiddleware("verifyRequest")(handler);
