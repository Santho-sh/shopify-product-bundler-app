import { GraphqlClient } from "@shopify/shopify-api/lib/clients/graphql/graphql_client";

export type GetBundleQuery = {
  data: {
    metaobject: {
      id: string;
      fields: Array<{
        key: string;
        value: string;
      }>;
    };
  };
};

export async function getBundle(client: GraphqlClient, collection: string) {
  const { body } = await client.query<GetBundleQuery>({
    data: {
      query: `query ($collection:String!){
        collections(first: 1, query: $collection) {
          edges {
            node {
              products(first: 200) {
                edges {
                  node {
                    title
                    tags
                    priceRangeV2 {
                      minVariantPrice {
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
  return body.data?.metaobject;
}
