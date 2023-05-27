import { GraphqlClient } from "@shopify/shopify-api/lib/clients/graphql/graphql_client";

export type GetBundleQuery = {
  data: {
    metaobject: {
      fields: Array<{
        key: string;
        value: string;
      }>;
    };
  };
};

export async function getBundle(client: GraphqlClient, id: string) {
  const { body } = await client.query<GetBundleQuery>({
    data: {
      query: `{
          metaobject(id: ${id}) {
            id
            fields {
              key
              value
            }
          }
        }`,
    },
  });
  return body.data?.metaobject;
}
