import { GraphqlClient } from "@shopify/shopify-api/lib/clients/graphql/graphql_client";

export interface BundleDefinitionQuery {
  data: {
    metaobjectDefinitionCreate: {
      metaobjectDefinition?: {
        name: string;
        type: string;
        fieldDefinitions: Array<{
          name: string;
          key: string;
          description: string;
          required: boolean;
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

async function createBundleDefinition(client: GraphqlClient) {
  const { body } = await client.query<BundleDefinitionQuery>({
    data: {
      query: `mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
            metaobjectDefinitionCreate(definition: $definition) {
              metaobjectDefinition {
                name
                type
                fieldDefinitions {
                  name
                  key
                  description
                  required
                }
              }
              userErrors {
                field
                message
                code
              }
            }
          }
          `,
      variables: {
        definition: {
          name: "Product Bundles",
          type: "product-bundles",
          description: "Products Bundles",
          fieldDefinitions: [
            {
              name: "Bundle Name",
              key: "bundle_name",
              description: "Name of The Bundle",
              required: true,
              type: "single_line_text_field",
            },
            {
              name: "Bundle Title",
              key: "bundle_title",
              description: "Title of the Bundle",
              required: true,
              type: "single_line_text_field",
            },
            {
              name: "Description",
              key: "description",
              description: "Description for a Bundle",
              required: true,
              type: "multi_line_text_field",
            },
            {
              name: "Created At",
              key: "created_at",
              description: "Bundle Creation Time",
              required: true,
              type: "date_time",
            },
            {
              name: "Discount",
              key: "discount",
              description: "Discount Percentage for the Bundle",
              required: true,
              type: "number_integer",
            },
            {
              name: "Products",
              key: "products",
              description: "Products in the Bundle",
              required: true,
              type: "list.product_reference",
            },
            {
              name: "Products Quantities",
              key: "products_quantities",
              description: "Products Quantities in the Bundle",
              required: true,
              type: "list.number_integer",
            },
          ],
        },
      },
    },
  });

  return body.data?.metaobjectDefinitionCreate != null;
}

async function createBundle(client: GraphqlClient, data: BundleData) {
  const { body } = await client.query<BundleCreateQuery>({
    data: {
      query: `mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
          metaobjectCreate(metaobject: $metaobject) {
            metaobject {
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

export { createBundleDefinition, createBundle };
