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

export async function createBundleDefinition(client: GraphqlClient) {
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
          access: {
            storefront: "PUBLIC_READ",
          },
          capabilities: {
            publishable: {
              enabled: true,
            },
          },
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
          ],
        },
      },
    },
  });

  return body.data?.metaobjectDefinitionCreate != null;
}
