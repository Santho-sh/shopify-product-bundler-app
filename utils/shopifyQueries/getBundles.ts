import { GraphqlClient } from "@shopify/shopify-api/lib/clients/graphql/graphql_client";
export type GetBundlesQuery = {
  data: {
    metaobjects: GetBundlesData;
  };
};

export type GetBundlesData = {
  edges: Array<{
    node: {
      id: string;
      handle: string;
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

export async function getBundles(
  client: GraphqlClient,
  after: boolean,
  cursor: string = null
) {
  let data;

  if (cursor) {
    if (after) {
      data = {
        query: `query ($cursor: String!) {
          metaobjects(type: "product-bundles" reverse: true first: 8 after: $cursor) {
            edges {
              node {
                id
                handle
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
        }`,
        variables: {
          cursor: cursor,
        },
      };
    } else {
      data = {
        query: `query ($cursor: String!){
          metaobjects( type: "product-bundles" reverse:true last: 8 before: $cursor) {
            edges {
              node {  
                id
                handle
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
        }`,
        variables: {
          cursor: cursor,
        },
      };
    }
  } else {
    data = {
      query: `{
        metaobjects( type: "product-bundles" reverse:true  first: 8 ) {
          edges {
            node {  
              id
              handle
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
      }`,
    };
  }

  const { body } = await client.query<GetBundlesQuery>({
    data: data,
  });
  return body.data?.metaobjects;
}
