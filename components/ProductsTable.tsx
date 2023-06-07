import {
  IndexTable,
  LegacyCard,
  useIndexResourceState,
  Text,
  Pagination,
  Button,
} from "@shopify/polaris";
import { useState, useEffect } from "react";
import useFetch from "./hooks/useFetch";
import { GetBundlesData } from "@/utils/shopifyQueries/getBundles";
import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useI18n } from "@shopify/react-i18n";

export type Fieldvalues = {
  bundle_name?: string;
  bundle_title?: string;
  created_at?: string;
  description?: string;
  discount?: string;
  products?: string;
  products_quantities?: string;
};

export default function ProductsTable() {
  const fetch = useFetch();
  const app = useAppBridge();
  const redirect = Redirect.create(app);

  const [i18n] = useI18n();

  const [bundles, setBundles] = useState([]);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [startCursor, setStartCursor] = useState("");
  const [endCursor, setEndCursor] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [gettingBundles, setgettingBundles] = useState(false);

  // Delete bundles
  async function deleteBundle() {
    setDeleting(true);
    await fetch("/api/deleteBundles", {
      method: "POST",
      body: JSON.stringify({
        ids: selectedResources,
      }),
    });
    setBundles(
      bundles.filter((bundle) => {
        if (selectedResources.includes(bundle.id)) {
          return false;
        }
        return true;
      })
    );
    setDeleting(false);
  }

  function arrayToObject(fields) {
    let values: Fieldvalues = {};
    for (let field of fields) {
      values[field.key] = field.value;
    }
    return values;
  }

  // get all bundles data
  async function getBunldes(after: boolean, cursor: string = null) {
    setgettingBundles(true);
    let data: GetBundlesData = await fetch("/api/getBundles", {
      method: "POST",
      body: JSON.stringify({
        after: after,
        cursor: cursor,
      }),
    }).then(async (res) => JSON.parse(await res.json()));

    let bundles = data.edges.map(({ node }) => {
      let values = arrayToObject(node.fields);
      return {
        id: node.id,
        handle: node.handle,
        name: values.bundle_name,
        title: values.bundle_title,
        created: new Date(values.created_at).toDateString(),
        discount: values.discount,
      };
    });

    setBundles(bundles);
    setStartCursor(data.pageInfo.startCursor);
    setEndCursor(data.pageInfo.endCursor);
    setHasNextPage(data.pageInfo.hasNextPage);
    setHasPreviousPage(data.pageInfo.hasPreviousPage);
    setgettingBundles(false);
  }

  // initially get all bundles
  useEffect(() => {
    getBunldes(true);
  }, []);

  const resourceName = {
    singular: `${i18n.translate("index.title")}`,
    plural: `${i18n.translate("index.title")}`,
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(bundles);

  // table data
  const rowMarkup = bundles.map(
    ({ id, handle, name, title, created, discount }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {name}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(handle);
            }}
            plain
            dataPrimaryLink
          >
            {i18n.translate("index.bundles_table.copy")}
          </Button>
        </IndexTable.Cell>
        <IndexTable.Cell>{discount}</IndexTable.Cell>
        <IndexTable.Cell>{created}</IndexTable.Cell>
        <IndexTable.Cell>{title}</IndexTable.Cell>
        <IndexTable.Cell>
          <Button
            onClick={() => {
              redirect.dispatch(
                Redirect.Action.APP,
                `/edit_bundle?id=${encodeURIComponent(id)}`
              );
            }}
            plain
          >
            {i18n.translate("index.bundles_table.view_edit")}
          </Button>
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  return (
    <>
      <LegacyCard>
        <IndexTable
          resourceName={resourceName}
          itemCount={bundles.length}
          selectedItemsCount={
            allResourcesSelected ? "All" : selectedResources.length
          }
          onSelectionChange={handleSelectionChange}
          loading={gettingBundles}
          headings={[
            { title: `${i18n.translate("index.bundles_table.name")}` },
            { title: `${i18n.translate("index.bundles_table.shortcode")}` },
            { title: `${i18n.translate("index.bundles_table.discount")}` },
            { title: `${i18n.translate("index.bundles_table.created")}` },
            { title: `${i18n.translate("index.bundles_table.title")}` },
            { title: `${i18n.translate("index.bundles_table.action")}` },
          ]}
          lastColumnSticky
        >
          {rowMarkup}
        </IndexTable>
      </LegacyCard>
      <div style={{ display: "flex", gap: "1rem", marginBlock: "1rem" }}>
        <Pagination
          hasPrevious={hasPreviousPage}
          onPrevious={() => {
            getBunldes(false, startCursor);
          }}
          hasNext={hasNextPage}
          onNext={() => {
            getBunldes(true, endCursor);
          }}
        />
        {selectedResources.length > 0 ? (
          <Button onClick={() => deleteBundle()} destructive loading={deleting}>
            {i18n.translate("buttons.delete")}
          </Button>
        ) : null}
      </div>
    </>
  );
}
