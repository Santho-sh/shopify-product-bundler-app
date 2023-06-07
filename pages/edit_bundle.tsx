import isShopAvailable from "@/utils/middleware/isShopAvailable";
import { Toast, useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import {
  Button,
  DataTable,
  Form,
  FormLayout,
  Layout,
  LegacyCard,
  Page,
  Spinner,
  TextField,
} from "@shopify/polaris";
import { useCallback, useState, useEffect } from "react";
import React from "react";
import useFetch from "@/components/hooks/useFetch";
import { useRouter } from "next/router";
import { NextPage } from "next";
import { EditedBundleData } from "@/utils/shopifyQueries/editBundle";
import { useI18n } from "@shopify/react-i18n";

export type Fieldvalues = {
  bundle_name?: string;
  bundle_title?: string;
  created_at?: string;
  description?: string;
  discount?: string;
  products?: string;
};

export type GetBundleData = {
  id: string;
  fields: Array<{
    key: string;
    value: string;
  }>;
};

export type ProductData = {
  id: string;
  name: string;
  price: string;
};

export type GetProductData = {
  id: string;
  priceRangeV2: {
    maxVariantPrice: {
      amount: string;
    };
  };
  title: string;
};

const CreateBundlePage: NextPage = () => {
  const router = useRouter();
  const id = router.query?.id;
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const fetch = useFetch();

  const [i18n] = useI18n();

  const [bundleName, setBundleName] = useState("");
  const [bundleTitle, setBundleTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState("10");
  const [products, setProducts] = useState<ProductData[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [gettingBundle, setGettingBundle] = useState(false);

  // Geting Bundle data
  async function getBundle(id) {
    try {
      setGettingBundle(true);
      let data: GetBundleData = await fetch("/api/getBundle", {
        method: "POST",
        body: JSON.stringify({
          id: id,
        }),
      }).then(async (res) => JSON.parse(await res.json()));

      let values: Fieldvalues = {};
      for (let field of data.fields) {
        values[field.key] = field.value;
      }
      setBundleName(values.bundle_name);
      setBundleTitle(values.bundle_title);
      setDescription(values.description);
      setDiscount(values.discount);
      let productsData: ProductData[] = [];
      // Getting products data
      const products = JSON.parse(values.products);

      for (let productId of products) {
        let data: GetProductData = await fetch("/api/getProduct", {
          method: "POST",
          body: JSON.stringify({
            id: productId,
          }),
        }).then(async (res) => JSON.parse(await res.json()));

        productsData.push({
          id: data.id,
          name: data.title,
          price: data.priceRangeV2.maxVariantPrice.amount,
        });
      }

      setProducts(productsData);
      setRows(
        productsData.map((product) => {
          return [product.name, product.price];
        })
      );
      setGettingBundle(false);
    } catch (e) {
      redirect.dispatch(Redirect.Action.APP, "/");
    }
  }

  useEffect(() => {
    getBundle(id);
  }, []);

  // Submit Form: Save Edited Bundle
  async function handleSubmit() {
    setLoading(true);
    const data: EditedBundleData = {
      id: id as string,
      bundleName: bundleName,
      bundleTitle: bundleTitle,
      description: description,
      discount: discount,
    };
    let response = await fetch("/api/editBundle", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (response.status == 200) {
      toggleSuccessToastActive();
      redirect.dispatch(Redirect.Action.APP, "/");
    } else {
      toggleErrorToastActive();
    }
    setLoading(false);
  }

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
      content={i18n.translate("create_bundle.toasts.success")}
      onDismiss={toggleSuccessToastActive}
      duration={3000}
    />
  ) : null;
  const errorToast = errorToastActive ? (
    <Toast
      content={i18n.translate("create_bundle.toasts.error")}
      onDismiss={toggleErrorToastActive}
      duration={3000}
      error
    />
  ) : null;

  const handleBundleNameChange = useCallback(
    (value: string) => setBundleName(value),
    []
  );
  const handleDiscountChange = useCallback(
    (value: string) => setDiscount(value),
    []
  );
  const handleTitleChange = useCallback(
    (value: string) => setBundleTitle(value),
    []
  );
  const handleDescriptionChange = useCallback(
    (value: string) => setDescription(value),
    []
  );

  // while getting bundle data showing spinner
  if (gettingBundle) {
    return (
      <div
        style={{
          height: "20rem",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spinner accessibilityLabel="Spinner" size="large" />
      </div>
    );
  }

  return (
    <Page
      title={i18n.translate("edit_bundle.title")}
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
                  <TextField
                    value={bundleName}
                    onChange={handleBundleNameChange}
                    label={i18n.translate("create_bundle.bundle_name.label")}
                    helpText={i18n.translate(
                      "create_bundle.bundle_name.help_text"
                    )}
                    type="text"
                    autoComplete=""
                  />
                </LegacyCard.Section>

                <LegacyCard.Section>
                  <TextField
                    value={bundleTitle}
                    onChange={handleTitleChange}
                    label={i18n.translate("create_bundle.bundle_title.label")}
                    helpText={i18n.translate(
                      "create_bundle.bundle_title.help_text"
                    )}
                    type="text"
                    autoComplete=""
                  />
                </LegacyCard.Section>

                <LegacyCard.Section>
                  <TextField
                    value={description}
                    onChange={handleDescriptionChange}
                    label={i18n.translate("create_bundle.description.label")}
                    helpText={i18n.translate(
                      "create_bundle.description.help_text"
                    )}
                    type="text"
                    autoComplete=""
                  />
                </LegacyCard.Section>
                <LegacyCard.Section>
                  <TextField
                    value={discount}
                    onChange={handleDiscountChange}
                    label={i18n.translate("create_bundle.discount.label")}
                    helpText={i18n.translate(
                      "create_bundle.discount.help_text"
                    )}
                    type="number"
                    suffix="%"
                    autoComplete="10"
                    max={100}
                    min={0}
                  />
                </LegacyCard.Section>
              </LegacyCard>
              <LegacyCard
                title={i18n.translate("edit_bundle.products_table.title")}
                sectioned
              >
                <DataTable
                  showTotalsInFooter
                  columnContentTypes={["text", "text"]}
                  headings={[
                    `${i18n.translate("edit_bundle.products_table.product")}`,
                    `${i18n.translate("edit_bundle.products_table.price")}`,
                  ]}
                  rows={rows}
                />
              </LegacyCard>
              <div
                style={{ display: "flex", gap: "1rem", paddingBottom: "1rem" }}
              >
                <Button primary submit loading={loading}>
                  {i18n.translate("buttons.save_bundle")}
                </Button>
                <Button
                  primary
                  destructive
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
    </Page>
  );
};

//On first install, check if the store is installed and redirect accordingly
export async function getServerSideProps(context) {
  return await isShopAvailable(context);
}

export default CreateBundlePage;
