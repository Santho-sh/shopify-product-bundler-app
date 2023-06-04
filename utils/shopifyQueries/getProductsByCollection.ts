import { GraphqlClient } from "@shopify/shopify-api/lib/clients/graphql/graphql_client";

export type GetByCollectionQuery = {
  data: {
    collections: {
      edges: Array<{
        node: {
          products: {
            edges: Array<{
              node: {
                id: string;
                tags: Array<string>;
                priceRangeV2: {
                  maxVariantPrice: {
                    amount: string;
                  };
                };
              };
            }>;
          };
        };
      }>;
    };
  };
};

export async function getProductsByCollection(
  client: GraphqlClient,
  collection: string
) {
  const { body } = await client.query<GetByCollectionQuery>({
    data: {
      query: `query ($collection:String!){
        collections(first: 1, query: $collection) {
          edges {
            node {
              products(first: 200) {
                edges {
                  node {
                    id
                    tags
                    priceRangeV2 {
                      maxVariantPrice {
                        amount
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }`,
      variables: {
        collection: collection,
      },
    },
  });
  return body.data?.collections.edges;
}
