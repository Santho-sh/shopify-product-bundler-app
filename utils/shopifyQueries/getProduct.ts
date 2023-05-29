import { GraphqlClient } from "@shopify/shopify-api/lib/clients/graphql/graphql_client";

export type GetProductQuery = {
  data: {
    product: {
      id: string;
      priceRangeV2: {
        maxVariantPrice: {
          amount: string;
        };
      };
      title: string;
    };
  };
};

export async function getProduct(client: GraphqlClient, id: string) {
  const { body } = await client.query<GetProductQuery>({
    data: {
      query: `query ($id: ID!) {
        product(id: $id) {
          id
          priceRangeV2{
            maxVariantPrice{
              amount
            }
          }
          title
        }
      }`,
      variables: {
        id: id,
      },
    },
  });
  return body.data?.product;
}
