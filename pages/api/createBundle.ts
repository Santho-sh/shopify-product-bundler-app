import withMiddleware from "@/utils/middleware/withMiddleware";
import clientProvider from "@/utils/clientProvider";
import { createBundle } from "@/utils/productBundles";
import { NextApiHandler } from "next";

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
    const resposne: boolean = await createBundle(client, data);
    if (resposne) {
      return res.status(200).send("message: Bundle created successfully");
    }
    return res.status(500).send("message: Error while creating bundle");
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
