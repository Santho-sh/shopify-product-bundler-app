import isShopAvailable from "@/utils/middleware/isShopAvailable";
import { Toast, useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";

import {
  Badge,
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
import { useI18n } from "@shopify/react-i18n";

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
  minProducts: string;
  shop: string;
  tags: Array<string>;
};

const AutoBundlePage = () => {
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const fetch = useFetch();

  const [i18n] = useI18n();

  true;
  // Already an auto bundle is active or not
  const [bundleActice, setBundleActice] = useState(false);

  const [productTags, setProductTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [collections, setCollections] = useState<getCollectionsData[]>([]);
  const [selectedCollections, setSelectedCollections] = useState([]);

  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("0");

  const [discount, setDiscount] = useState("10");
  const [minProducts, setMinProducts] = useState("2");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Submit Form: Save auto bundle data Bundle
  async function handleSubmit() {
    setSaving(true);

    let allcollections = collections.map((collection) => {
      return collection.node.title;
    });

    const data = {
      collections: selectedCollections,
      allCollections: allcollections,
      tags: selectedTags,
      minPrice: minPrice,
      maxPrice: maxPrice,
      minProducts: minProducts,
      discount: discount,
    };

    let response = await fetch("/api/saveAutoBundleData", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.status == 200) {
      toggleSuccessToastActive();
      setBundleActice(true);
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

    await fetch("/api/getAutoBundleData", {
      method: "POST",
    }).then(async (res) => {
      if (res.status == 200) {
        setBundleActice(true);
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

  // delete auto bundle
  async function deleteAutoBundle() {
    setDeleting(true);
    await fetch("/api/deleteAutoBundle", {
      method: "POST",
    });
    toggleDeleteSuccessToast();
    setDeleting(false);
    setBundleActice(false);
  }

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
  const [deleteSuccessToastActive, setDeleteSuccessToastActive] =
    useState(false);

  const toggleSuccessToastActive = useCallback(
    () => setSuccessToastActive((active) => !active),
    []
  );
  const toggleErrorToastActive = useCallback(
    () => setErrorToastActive((active) => !active),
    []
  );
  const toggleDeleteSuccessToast = useCallback(
    () => setDeleteSuccessToastActive((active) => !active),
    []
  );

  const successToast = successToastActive ? (
    <Toast
      content={i18n.translate("auto_bundle.toasts.success")}
      onDismiss={toggleSuccessToastActive}
      duration={3000}
    />
  ) : null;
  const errorToast = errorToastActive ? (
    <Toast
      content={i18n.translate("auto_bundle.toasts.error")}
      onDismiss={toggleErrorToastActive}
      duration={3000}
      error
    />
  ) : null;
  const deleteSuccessToast = deleteSuccessToastActive ? (
    <Toast
      content={i18n.translate("auto_bundle.toasts.delete")}
      onDismiss={toggleErrorToastActive}
      duration={3000}
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
      title={i18n.translate("auto_bundle.title")}
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
                  {i18n.translate("auto_bundle.status.title")}{" "}
                  {bundleActice ? (
                    <Badge status="success">
                      {i18n.translate("auto_bundle.status.active")}
                    </Badge>
                  ) : (
                    <Badge>
                      {i18n.translate("auto_bundle.status.inactive")}
                    </Badge>
                  )}
                  <p>{i18n.translate("auto_bundle.description")}</p>
                </LegacyCard.Section>
                <LegacyCard.Section>
                  <OptionList
                    title={i18n.translate("auto_bundle.tags")}
                    onChange={(value) => setSelectedTags(value)}
                    options={tagsOptions}
                    allowMultiple
                    selected={selectedTags}
                  />
                </LegacyCard.Section>

                <LegacyCard.Section>
                  <OptionList
                    title={i18n.translate("auto_bundle.collections")}
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
                    label={i18n.translate("auto_bundle.minimum_price.label")}
                    helpText={i18n.translate(
                      "auto_bundle.minimum_price.help_text"
                    )}
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
                    label={i18n.translate("auto_bundle.maximum_price.label")}
                    helpText={i18n.translate(
                      "auto_bundle.maximum_price.help_text"
                    )}
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
                    label={i18n.translate("create_bundle.discount.label")}
                    helpText={i18n.translate(
                      "create_bundle.discount.help_text"
                    )}
                    type="number"
                    autoComplete="10"
                    min={0}
                    max={100}
                  />
                </LegacyCard.Section>
                <LegacyCard.Section>
                  <TextField
                    value={minProducts}
                    onChange={(value) => {
                      setMinProducts(value);
                    }}
                    label={i18n.translate("auto_bundle.minimum_products.label")}
                    helpText={i18n.translate(
                      "auto_bundle.minimum_products.help_text"
                    )}
                    type="number"
                    autoComplete="2"
                    min={1}
                    max={20}
                  />
                </LegacyCard.Section>
              </LegacyCard>
              <div
                style={{ display: "flex", gap: "1rem", paddingBottom: "1rem" }}
              >
                <Button primary submit loading={saving}>
                  {i18n.translate("buttons.save")}
                </Button>
                <Button
                  loading={deleting}
                  destructive
                  disabled={!bundleActice}
                  onClick={() => {
                    deleteAutoBundle();
                    redirect.dispatch(Redirect.Action.APP, "/");
                  }}
                >
                  {i18n.translate("buttons.delete")}
                </Button>
                <Button
                  monochrome
                  onClick={() => {
                    redirect.dispatch(Redirect.Action.APP, "/");
                  }}
                >
                  {i18n.translate("buttons.cancel")}
                </Button>
              </div>
            </FormLayout>
          </Form>
        </Layout.Section>
      </Layout>
      {successToast}
      {errorToast}
      {deleteSuccessToast}
    </Page>
  );
};

//On first install, check if the store is installed and redirect accordingly
export async function getServerSideProps(context) {
  return await isShopAvailable(context);
}

export default AutoBundlePage;
