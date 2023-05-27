import { GraphqlClient } from "@shopify/shopify-api/lib/clients/graphql/graphql_client";

export interface BundleData {
  bundleName: string;
  bundleTitle: string;
  description: string;
  discount: string;
  products: Array<string>;
  productsQuantities: Array<number>;
}

export interface BundleCreateQuery {
  data: {
    metaobjectCreate: {
      metaobject?: {
        fields: Array<{
          key: string;
          value: string;
        }>;
      };
      userErrors: Array<{
        field: Array<string>;
        message: string;
        code: string;
      }>;
    };
  };
}

export async function editBundle(client: GraphqlClient, data: BundleData) {
  const { body } = await client.query<BundleCreateQuery>({
    data: {
      query: `mutation UpdateMetaobject($id: ID!, $metaobject: MetaobjectUpdateInput!) {
          metaobjectUpdate(id: $id, metaobject: $metaobject) {
            metaobject {
              id
              season: fields {
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
        metaobject: {
          type: "product-bundles",
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
              key: "created_at",
              value: new Date().toISOString(),
            },
            {
              key: "discount",
              value: data.discount,
            },
            {
              key: "products",
              value: JSON.stringify(data.products),
            },
            {
              key: "products_quantities",
              value: JSON.stringify(data.productsQuantities),
            },
          ],
        },
      },
    },
  });

  return body.data?.metaobjectCreate.metaobject != null;
}
