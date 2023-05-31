import isShopAvailable from "@/utils/middleware/isShopAvailable";
import { Toast, useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";

import {
  Button,
  Form,
  FormLayout,
  Layout,
  LegacyCard,
  OptionList,
  Page,
  Spinner,
  TextField,
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import React from "react";
import useFetch from "@/components/hooks/useFetch";

export type getCollectionsData = {
  node: {
    id: string;
    title: string;
    handle: string;
    productsCount: number;
  };
};

export type getAutoBundleata = {
  collections: Array<string>;
  discount: string;
  maxPrice: string;
  minPrice: string;
  shop: string;
  tags: Array<string>;
};

const AutoBundlePage = () => {
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const fetch = useFetch();

  const [productTags, setProductTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [collections, setCollections] = useState<getCollectionsData[]>([]);
  const [selectedCollections, setSelectedCollections] = useState([]);

  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("0");

  const [discount, setDiscount] = useState("0");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Submit Form: Save auto bundle data Bundle
  async function handleSubmit() {
    setSaving(true);

    const data = {
      collections: selectedCollections,
      tags: selectedTags,
      minPrice: minPrice,
      maxPrice: maxPrice,
      discount: discount,
    };

    let response = await fetch("/api/saveAutoBundleData", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.status == 200) {
      toggleSuccessToastActive();
    } else {
      toggleErrorToastActive();
    }
    setSaving(false);
  }

  async function getData() {
    setLoading(true);
    let collections = await fetch("/api/getCollections", {
      method: "POST",
    }).then(async (res) => JSON.parse(await res.json()));

    let tags = await fetch("/api/getProductTags", {
      method: "POST",
    }).then(async (res) => JSON.parse(await res.json()));

    fetch("/api/getAutoBundleData", {
      method: "POST",
    }).then(async (res) => {
      if (res.status == 200) {
        const data: getAutoBundleata = JSON.parse(await res.json());
        setSelectedCollections(data.collections);
        setSelectedTags(data.tags);
        setDiscount(data.discount);
        setMinPrice(data.minPrice);
        setMaxPrice(data.maxPrice);
      }
    });

    setCollections(collections.edges);
    setProductTags(tags.edges);
    setLoading(false);
  }

  useEffect(() => {
    getData();
  }, []);

  let collectionsOptions = collections.map((collection) => {
    return {
      value: collection.node.title,
      label: collection.node.title,
    };
  });

  let tagsOptions = productTags.map((tag) => {
    return {
      value: tag.node,
      label: tag.node,
    };
  });

  // success/error toast messages
  const [successToastActive, setSuccessToastActive] = useState(false);
  const [errorToastActive, setErrorToastActive] = useState(false);

  const toggleSuccessToastActive = useCallback(
    () => setSuccessToastActive((active) => !active),
    []
  );
  const toggleErrorToastActive = useCallback(
    () => setErrorToastActive((active) => !active),
    []
  );

  const successToast = successToastActive ? (
    <Toast
      content="Bundle Data Saved"
      onDismiss={toggleSuccessToastActive}
      duration={3000}
    />
  ) : null;
  const errorToast = errorToastActive ? (
    <Toast
      content="Error while saving data"
      onDismiss={toggleErrorToastActive}
      duration={3000}
      error
    />
  ) : null;

  // While getting data show spinner
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "30rem",
        }}
      >
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <Page
      title="Automatic Bundle Generation"
      backAction={{
        onAction: () => redirect.dispatch(Redirect.Action.APP, "/"),
      }}
    >
      <Layout>
        <Layout.Section fullWidth>
          <Form onSubmit={handleSubmit}>
            <FormLayout>
              <LegacyCard sectioned>
                <LegacyCard.Section>
                  <OptionList
                    title="Product Tags"
                    onChange={(value) => setSelectedTags(value)}
                    options={tagsOptions}
                    allowMultiple
                    selected={selectedTags}
                  />
                </LegacyCard.Section>

                <LegacyCard.Section>
                  <OptionList
                    title="Collections"
                    onChange={(value) => setSelectedCollections(value)}
                    options={collectionsOptions}
                    allowMultiple
                    selected={selectedCollections}
                  />
                </LegacyCard.Section>

                <LegacyCard.Section>
                  <TextField
                    value={minPrice}
                    onChange={(value) => {
                      setMinPrice(value);
                    }}
                    label="Minimum price"
                    helpText="Minimun price of product to include in the bundle"
                    type="number"
                    autoComplete=""
                    min={0}
                  />
                </LegacyCard.Section>
                <LegacyCard.Section>
                  <TextField
                    value={maxPrice}
                    onChange={(value) => {
                      setMaxPrice(value);
                    }}
                    label="Maximum Price"
                    helpText="Maximum price of product to include in the bundle"
                    type="number"
                    autoComplete=""
                    min={0}
                  />
                </LegacyCard.Section>
                <LegacyCard.Section>
                  <TextField
                    value={discount}
                    onChange={(value) => {
                      setDiscount(value);
                    }}
                    label="Percentage discount"
                    helpText="Set the percentage discount which will be applied to each product in the bundle. You can set it to 0% if you want to create a bundle without a discount."
                    type="number"
                    autoComplete="10"
                    min={0}
                    max={100}
                  />
                </LegacyCard.Section>
              </LegacyCard>
              <div
                style={{ display: "flex", gap: "1rem", paddingBottom: "1rem" }}
              >
                <Button primary submit loading={saving}>
                  Save
                </Button>
                <Button
                  primary
                  destructive
                  onClick={() => {
                    redirect.dispatch(Redirect.Action.APP, "/");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </FormLayout>
          </Form>
        </Layout.Section>
      </Layout>
      {successToast}
      {errorToast}
    </Page>
  );
};

//On first install, check if the store is installed and redirect accordingly
export async function getServerSideProps(context) {
  return await isShopAvailable(context);
}

export default AutoBundlePage;
