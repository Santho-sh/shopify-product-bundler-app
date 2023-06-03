import { GraphqlClient } from "@shopify/shopify-api/lib/clients/graphql/graphql_client";

export async function discountDelete(client: GraphqlClient, ids: string[]) {
  await client.query({
    data: {
      query: `mutation discountAutomaticBulkDelete($ids: [ID!]) {
        discountAutomaticBulkDelete(ids: $ids){
          job {
            done
          }
          userErrors {
            field
            message
          }
        }
      }`,
      variables: {
        ids: ids,
      },
    },
  });
}
