import { GraphqlClient } from "@shopify/shopify-api/lib/clients/graphql/graphql_client";

export type GetTagsQuery = {
  data: {
    shop: {
      productTags: {
        edges: Array<{
          node: string;
        }>;
      };
    };
  };
};

export async function getProductTags(client: GraphqlClient) {
  const { body } = await client.query<GetTagsQuery>({
    data: {
      query: `query {
        shop {
          productTags(first: 100) {
            edges {
              node
            }
          }
        }
      }`,
    },
  });
  return body.data.shop.productTags;
}
