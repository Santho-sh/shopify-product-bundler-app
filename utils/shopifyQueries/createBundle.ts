import { GraphqlClient } from "@shopify/shopify-api/lib/clients/graphql/graphql_client";

export interface BundleData {
  bundleName: string;
  bundleTitle: string;
  description: string;
  discount: string;
  products: Array<string>;
}

export interface BundleCreateQuery {
  data: {
    metaobjectCreate: {
      metaobject?: {
        handle: string;
        id: string;
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

export async function createBundle(client: GraphqlClient, data: BundleData) {
  const { body } = await client.query<BundleCreateQuery>({
    data: {
      query: `mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
            metaobjectCreate(metaobject: $metaobject) {
              metaobject {
                handle
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
        metaobject: {
          type: "product-bundles",
          capabilities: {
            publishable: {
              status: "ACTIVE",
            },
          },
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
          ],
        },
      },
    },
  });
  // Get a discount code using handle of the bundle
  if (body.data?.metaobjectCreate.metaobject != null) {
    let handle = body.data?.metaobjectCreate.metaobject.handle;
    let code = handle.split("-").pop().toUpperCase();
    let discountTitle = `${code}`;

    return {
      bundleId: body.data.metaobjectCreate.metaobject.id,
      discountTitle: discountTitle,
    };
  } else {
    return null;
  }
}
