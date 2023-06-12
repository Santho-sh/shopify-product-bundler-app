import isShopAvailable from "@/utils/middleware/isShopAvailable";
import { ResourcePicker, Toast, useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { Product } from "@shopify/app-bridge/actions/ResourcePicker";
import SelectedProductsTable from "@/components/SelectedProductsTable";

import {
  Banner,
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
import { BundleData } from "@/utils/shopifyQueries/createBundle";
import { useI18n } from "@shopify/react-i18n";

const CreateBundlePage = () => {
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const fetch = useFetch();

  const [i18n] = useI18n();

  const [bundleName, setBundleName] = useState(
    `${i18n.translate("create_bundle.default_values.bundle_name")}`
  );
  const [bundleTitle, setBundleTitle] = useState(
    `${i18n.translate("create_bundle.default_values.bundle_title")}`
  );
  const [description, setDescription] = useState(
    `${i18n.translate("create_bundle.default_values.description")}`
  );
  const [discount, setDiscount] = useState("10");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [resoursePicker, setResoursePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Submit Form: Create new Bundle
  async function handleSubmit() {
    setLoading(true);
    const data: BundleData = {
      bundleName: bundleName,
      bundleTitle: bundleTitle,
      description: description,
      discount: discount,
      products: selectedProducts.map((products) => {
        return products.id;
      }),
    };

    let response = await fetch("/api/createBundle", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (response.status == 200) {
      setBundleName(
        `${i18n.translate("create_bundle.default_values.bundle_name")}`
      );
      setBundleTitle(
        `${i18n.translate("create_bundle.default_values.bundle_title")}`
      );
      setDescription(
        `${i18n.translate("create_bundle.default_values.description")}`
      );
      setDiscount("10");
      toggleSuccessToastActive();
    } else {
      toggleErrorToastActive();
    }
    setSelectedProducts([]);
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
                    onChange={(value) => {
                      setBundleName(value);
                    }}
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
                    onChange={(value) => {
                      setBundleTitle(value);
                    }}
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
                    onChange={(value) => {
                      setDescription(value);
                    }}
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
                    onChange={(value) => {
                      setDiscount(value);
                    }}
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
                title={i18n.translate("create_bundle.products.title")}
                sectioned
              >
                <Text as="p" color="subdued">
                  {i18n.translate("create_bundle.products.help_text")}
                </Text>
                <LegacyCard.Section>
                  {selectedProducts.length == 0 ? (
                    <Banner status="warning">
                      <Text as="p" color="warning">
                        {i18n.translate("create_bundle.products.warning")}
                      </Text>
                    </Banner>
                  ) : (
                    <SelectedProductsTable products={selectedProducts} />
                  )}
                </LegacyCard.Section>
                <Button primary onClick={() => setResoursePicker(true)}>
                  {i18n.translate("create_bundle.products.select")}
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
              <div
                style={{ display: "flex", gap: "1rem", paddingBottom: "1rem" }}
              >
                <Button
                  size="large"
                  primary
                  submit
                  disabled={selectedProducts.length == 0}
                  loading={loading}
                >
                  {i18n.translate("buttons.save_bundle")}
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
