import { GraphqlClient } from "@shopify/shopify-api/lib/clients/graphql/graphql_client";

export type DeleteBundleQuery = {
  data: {
    metaobjectBulkDelete: {
      job: {
        id: string;
        done: boolean;
      };
    };
  };
};

export async function deleteBundles(client: GraphqlClient, ids: string[]) {
  const { body } = await client.query<DeleteBundleQuery>({
    data: {
      query: `mutation DeleteMetaobjects($where: MetaobjectBulkDeleteWhereCondition!) {
        metaobjectBulkDelete(where: $where) {
          job {
            id
            done
          }
        }
      }`,
      variables: {
        where: {
          ids: ids,
        },
      },
    },
  });
  return !body.data.metaobjectBulkDelete.job.done;
}
