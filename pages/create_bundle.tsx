import isShopAvailable from "@/utils/middleware/isShopAvailable";
import { ResourcePicker, useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { Product } from "@shopify/app-bridge/actions/ResourcePicker";
import SelectedProductsTable from "@/components/SelectedProductsTable";

import {
  Banner,
  Box,
  Button,
  Form,
  FormLayout,
  Layout,
  LegacyCard,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import React from "react";
import useFetch from "@/components/hooks/useFetch";
import { BundleData } from "@/utils/productBundles";

const CreateBundlePage = () => {
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const fetch = useFetch();

  const [bundleName, setBundleName] = useState("Bundle discount");
  const [bundleTitle, setBundleTitle] = useState("Get a discount!");
  const [description, setDescription] = useState(
    "Buy these products together and get a discount!"
  );
  const [discount, setDiscount] = useState("10");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const [resoursePicker, setResoursePicker] = useState(false);

  // Submit Form: Create Bundle
  async function handleSubmit() {
    const data: BundleData = {
      bundleName: bundleName,
      bundleTitle: bundleTitle,
      description: description,
      discount: discount,
      products: selectedProducts.map((products) => {
        return products.id;
      }),
      productsQuantities: [1],
    };

    let response = await fetch("/api/createBundle", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setSelectedProducts([]);
  }

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

  return (
    <Page
      title="Create Bundle"
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

              <LegacyCard title="Discounted products in bundle" sectioned>
                <Text as="p" color="subdued">
                  Select the products you want to offer in the bundle. It is
                  recommended to select only a handful of product (e.g. 2 - 4
                  products), as smaller bundles will be rendered faster and
                  won't overwhelm your customers.
                </Text>
                <LegacyCard.Section>
                  {selectedProducts.length == 0 ? (
                    <Banner status="warning">
                      <Text as="p" color="warning">
                        You have to select at least one product if you want to
                        save the bundle.
                      </Text>
                    </Banner>
                  ) : (
                    <SelectedProductsTable products={selectedProducts} />
                  )}
                </LegacyCard.Section>
                <Button primary onClick={() => setResoursePicker(true)}>
                  Select Products
                </Button>
              </LegacyCard>
              <ResourcePicker
                resourceType="Product"
                open={resoursePicker}
                initialSelectionIds={selectedProducts.map((product) => {
                  return {
                    id: product.id,
                    variants: product.variants.map((varient) => {
                      return { id: varient.id };
                    }),
                  };
                })}
                onSelection={(payload) => {
                  setSelectedProducts(payload.selection as Product[]);
                  setResoursePicker(false);
                }}
                onCancel={() => setResoursePicker(false)}
              />
              <Box paddingBlockEnd="4">
                <Button
                  size="large"
                  primary
                  submit
                  disabled={selectedProducts.length == 0 ? true : false}
                >
                  Save bundle
                </Button>
              </Box>
            </FormLayout>
          </Form>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

//On first install, check if the store is installed and redirect accordingly
export async function getServerSideProps(context) {
  return await isShopAvailable(context);
}

export default CreateBundlePage;
