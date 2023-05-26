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

export type GetBundleQuery = {
  data: {
    metaobject: {
      fields: Array<{
        key: string;
        value: string;
      }>;
    };
  };
};

export type GetBundlesQuery = {
  data: {
    metaobjects: {
      edges: Array<{
        node: {
          id: string;
          fields: Array<{
            key: string;
            value: string;
          }>;
        };
      }>;
      pageInfo: {
        startCursor: string;
        endCursor: string;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    };
  };
};

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
              name: "Auto Generated",
              key: "auto_generated",
              description: "Bundle Auto Created or Not",
              required: true,
              type: "boolean",
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

async function editBundle(client: GraphqlClient, data: BundleData) {
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

async function getBundles(
  client: GraphqlClient,
  after: boolean,
  cursor: string = null
) {
  let query: string;

  if (cursor) {
    if (after) {
      query = `{
        metaobjects(type: "product-bundles" first: 10 after:${cursor}) {
          edges {
            node {  
              id
              fields {
                key
                value
              }
            }
          }
          pageInfo {
            startCursor
            endCursor
            hasNextPage
            hasPreviousPage
          } 
        }
      }`;
    } else {
      query = `{
        metaobjects(type: "product-bundles" first: 10 before:${cursor}) {
          edges {
            node {  
              id
              fields {
                key
                value
              }
            }
          } 
          pageInfo {
            startCursor
            endCursor
            hasNextPage
            hasPreviousPage
          }
        }
      }`;
    }
  } else {
    query = `{
      metaobjects(type: "product-bundles" first: 10 ) {
        edges {
          node {  
            id
            fields {
              key
              value
            }
          }
        } 
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
      }
    }`;
  }

  const { body } = await client.query<GetBundlesQuery>({
    data: {
      query: query,
    },
  });
  return body.data?.metaobjects;
}

async function getBundle(client: GraphqlClient, id: string) {
  const { body } = await client.query<GetBundleQuery>({
    data: {
      query: `{
        metaobject(id: ${id}) {
          id
          fields {
            key
            value
          }
        }
      }`,
    },
  });
  return body.data?.metaobject;
}

export {
  createBundleDefinition,
  createBundle,
  getBundles,
  getBundle,
  editBundle,
};
