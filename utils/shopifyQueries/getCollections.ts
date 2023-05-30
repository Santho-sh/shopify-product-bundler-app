import { GraphqlClient } from "@shopify/shopify-api/lib/clients/graphql/graphql_client";

export type GetCollectionsQuery = {
  data: {
    collections: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          handle: string;
          productsCount: number;
        };
      }>;
    };
  };
};

export async function getCollections(client: GraphqlClient) {
  const { body } = await client.query<GetCollectionsQuery>({
    data: {
      query: `query {
        collections(first: 250) {
          edges {
            node {
              id
              title
              handle
              productsCount
            }
          }
        }
      }`,
    },
  });
  return body.data.collections;
}
