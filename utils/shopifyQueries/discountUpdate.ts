import { GraphqlClient } from "@shopify/shopify-api/lib/clients/graphql/graphql_client";

export async function discountUpdate(
  client: GraphqlClient,
  id: string,
  discount: string
) {
  await client.query({
    data: {
      query: `mutation discountAutomaticBasicUpdate($id: ID!, $automaticBasicDiscount: DiscountAutomaticBasicInput!) {
        discountAutomaticBasicUpdate(id: $id, automaticBasicDiscount: $automaticBasicDiscount) {
          automaticDiscountNode {
            id
            automaticDiscount {
              ... on DiscountAutomaticBasic {
                customerGets {
                  value {
                    ... on DiscountPercentage {
                      percentage
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            code
            message
          }
        }
      }`,
      variables: {
        id: id,
        automaticBasicDiscount: {
          customerGets: {
            value: {
              percentage: parseFloat(discount) / 100,
            },
          },
        },
      },
    },
  });
}
