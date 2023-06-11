import { GraphqlClient } from "@shopify/shopify-api/lib/clients/graphql/graphql_client";

export interface EditedBundleData {
  id: string;
  bundleName: string;
  bundleTitle: string;
  description: string;
  discount: string;
}

export interface BundleUpdateQuery {
  data: {
    metaobjectUpdate: {
      metaobject?: {
        id: string;
        fields: Array<{
          key: string;
          value: string;
        }>;
      };
      userErrors: [];
    };
  };
}

export async function editBundle(
  client: GraphqlClient,
  data: EditedBundleData
) {
  const { body } = await client.query<BundleUpdateQuery>({
    data: {
      query: `mutation UpdateMetaobject($id: ID!, $metaobject: MetaobjectUpdateInput!) {
          metaobjectUpdate(id: $id, metaobject: $metaobject) {
            metaobject {
              id
              fields {
                key
                value
              }
            }
            userErrors {
              field
              message
              code
            }
          }
        }`,
      variables: {
        id: data.id,
        metaobject: {
          fields: [
            {
              key: "bundle_name",
              value: data.bundleName,
            },
            {
              key: "bundle_title",
              value: data.bundleTitle,
            },
            {
              key: "description",
              value: data.description,
            },
            {
              key: "discount",
              value: data.discount,
            },
          ],
        },
      },
    },
  });

  return body.data?.metaobjectUpdate.metaobject != null;
}
