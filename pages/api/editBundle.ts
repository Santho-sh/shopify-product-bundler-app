import withMiddleware from "@/utils/middleware/withMiddleware";
import clientProvider from "@/utils/clientProvider";
import { NextApiHandler } from "next";
import { editBundle } from "@/utils/shopifyQueries";
import { EditedBundleData } from "@/utils/shopifyQueries/editBundle";

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
    const data: EditedBundleData = JSON.parse(req.body);
    const resposne: boolean = await editBundle(client, data);
    if (resposne) {
      return res.status(200).send("message: Bundle saved successfully");
    }
    return res.status(400).send("message: Bad request");
  } catch (error) {
    console.error("Exception while saving edited bundle:", error);
    return res.status(500).send("message: Error while saving edited bundle");
  }
};

export const config = {
  api: {
    externalResolver: true,
  },
};

export default withMiddleware("verifyRequest")(handler);
