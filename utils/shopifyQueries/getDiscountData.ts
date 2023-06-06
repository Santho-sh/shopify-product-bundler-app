import { GraphqlClient } from "@shopify/shopify-api/lib/clients/graphql/graphql_client";

export type getDiscountDataQuery = {
  data: {
    automaticDiscountNode: {
      automaticDiscount: {
        title: string;
        shortSummary: string;
        asyncUsageCount: number;
        createdAt: string;
      };
    };
  };
};

export async function getDiscountData(client: GraphqlClient, id: string) {
  const { body } = await client.query<getDiscountDataQuery>({
    data: {
      query: `query ($id: ID!) {
        automaticDiscountNode(id: $id) {
          automaticDiscount {
            ... on DiscountAutomaticBasic {
              title
              shortSummary
              asyncUsageCount
              createdAt
            }
          }
        }	
      }`,
      variables: {
        id: id,
      },
    },
  });
  return body.data.automaticDiscountNode;
}
