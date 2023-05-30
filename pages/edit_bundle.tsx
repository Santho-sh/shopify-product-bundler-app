import isShopAvailable from "@/utils/middleware/isShopAvailable";
import { Toast, useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import {
  Button,
  DataTable,
  Form,
  FormLayout,
  IndexTable,
  Layout,
  LegacyCard,
  Page,
  Spinner,
  Text,
  TextField,
} from "@shopify/polaris";
import { useCallback, useState, useEffect } from "react";
import React from "react";
import useFetch from "@/components/hooks/useFetch";
import { useRouter } from "next/router";
import { NextPage } from "next";
import { EditedBundleData } from "@/utils/shopifyQueries/editBundle";

export type Fieldvalues = {
  bundle_name?: string;
  bundle_title?: string;
  created_at?: string;
  description?: string;
  discount?: string;
  products?: string;
  products_quantities?: string;
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

  const [bundleName, setBundleName] = useState("Bundle discount");
  const [bundleTitle, setBundleTitle] = useState("Get a discount!");
  const [description, setDescription] = useState(
    "Buy these products together and get a discount!"
  );
  const [discount, setDiscount] = useState("10");
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(false);
  const [gettingBundle, setGettingBundle] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

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
      await JSON.parse(values.products).map(async (productId: string) => {
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
        setTotalPrice(
          totalPrice + parseFloat(data.priceRangeV2.maxVariantPrice.amount)
        );
      });
      setProducts(productsData);
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

  const rows = products.map((product) => {
    return [product.name, product.price];
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
      content="Bundle Saved"
      onDismiss={toggleSuccessToastActive}
      duration={3000}
    />
  ) : null;
  const errorToast = errorToastActive ? (
    <Toast
      content="Error while saving bundle"
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
        <Spinner accessibilityLabel="Spinner example" size="large" />
      </div>
    );
  }

  return (
    <Page
      title={"Edit Bundle"}
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
                    label="Bundle Name"
                    helpText="Bundle name will be visible on invoices."
                    type="text"
                    autoComplete=""
                  />
                </LegacyCard.Section>

                <LegacyCard.Section>
                  <TextField
                    value={bundleTitle}
                    onChange={handleTitleChange}
                    label="Title"
                    helpText="Title will be displayed on product pages."
                    type="text"
                    autoComplete=""
                  />
                </LegacyCard.Section>

                <LegacyCard.Section>
                  <TextField
                    value={description}
                    onChange={handleDescriptionChange}
                    label="Description"
                    helpText="Description will be displayed on product pages under bundle title."
                    type="text"
                    autoComplete=""
                  />
                </LegacyCard.Section>
                <LegacyCard.Section>
                  <TextField
                    value={discount}
                    onChange={handleDiscountChange}
                    label="Percentage discount"
                    helpText="Set the percentage discount which will be applied to each product in the bundle. You can set it to 0% if you want to create a bundle without a discount."
                    type="number"
                    suffix="%"
                    autoComplete="10"
                    max={100}
                  />
                </LegacyCard.Section>
              </LegacyCard>
              <LegacyCard title="Products in bundle" sectioned>
                <DataTable
                  showTotalsInFooter
                  columnContentTypes={["text", "text"]}
                  headings={["Product", "Price"]}
                  rows={rows}
                />
              </LegacyCard>
              <div
                style={{ display: "flex", gap: "1rem", paddingBottom: "1rem" }}
              >
                <Button primary submit loading={loading}>
                  Save bundle
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

export default CreateBundlePage;
