import { GraphqlClient } from "@shopify/shopify-api/lib/clients/graphql/graphql_client";

// Bundle data to create discount
export interface BundleDiscountData {
  title: string;
  discount: string;
  products: Array<string>;
  minProducts: string;
}

// Discount create return data type
export type discountCreateMutation = {
  data: {
    discountAutomaticBasicCreate: {
      automaticDiscountNode: {
        id: string;
      };
      userErrors: Array<any>;
    };
  };
};

export async function discountCreate(
  client: GraphqlClient,
  data: BundleDiscountData
) {
  const { body } = await client.query<discountCreateMutation>({
    data: {
      query: `mutation discountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
        discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
          automaticDiscountNode{
            id
          }
          userErrors {
            field
            message
          }
        }
      }`,
      variables: {
        automaticBasicDiscount: {
          combinesWith: {
            productDiscounts: true,
          },
          customerGets: {
            items: {
              products: {
                productsToAdd: data.products,
              },
            },
            value: {
              percentage: parseFloat(data.discount) / 100,
            },
          },
          minimumRequirement: {
            quantity: {
              greaterThanOrEqualToQuantity: data.minProducts,
            },
          },
          title: data.title,
          startsAt: new Date().toISOString(),
        },
      },
    },
  });

  return body.data?.discountAutomaticBasicCreate.automaticDiscountNode.id;
}
