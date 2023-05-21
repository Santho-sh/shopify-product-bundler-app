import isShopAvailable from "../utils/middleware/isShopAvailable";
import { ResourcePicker, useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import {
  Button,
  Form,
  FormLayout,
  Layout,
  LegacyCard,
  List,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import React from "react";

//On first install, check if the store is installed and redirect accordingly
export async function getServerSideProps(context) {
  return await isShopAvailable(context);
}

const CreateBundle = () => {
  const app = useAppBridge();
  const redirect = Redirect.create(app);

  const [bundleName, setBundleName] = useState("Bundle discount");
  const [title, setTitle] = useState("Get a discount!");
  const [description, setDescription] = useState(
    "Buy these products together and get a discount!"
  );
  const [discount, setDiscount] = useState("10");
  const [resoursePicker, setResoursePicker] = useState(false);

  const handleSubmit = useCallback(() => {
    setBundleName("");
  }, []);

  const handleBundleNameChange = useCallback(
    (value: string) => setBundleName(value),
    []
  );
  const handleDiscountChange = useCallback(
    (value: string) => setDiscount(value),
    []
  );
  const handleTitleChange = useCallback((value: string) => setTitle(value), []);
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
                    value={title}
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
                  />
                </LegacyCard.Section>
              </LegacyCard>

              <LegacyCard
                title="Discounted products in bundleOnline store dashboard"
                sectioned
              >
                <Text as="p" color="subdued">
                  Select the products you want to offer in the bundle. It is
                  recommended to select only a handful of product (e.g. 2 - 4
                  products), as smaller bundles will be rendered faster and
                  won't overwhelm your customers.
                </Text>
                <LegacyCard.Section>
                  <List>
                    <List.Item>Felix Crafford</List.Item>
                    <List.Item>Ezequiel Manno</List.Item>
                  </List>
                </LegacyCard.Section>

                <Button primary onClick={() => setResoursePicker(true)}>
                  Select Products
                </Button>
              </LegacyCard>
              <ResourcePicker
                resourceType="Product"
                open={resoursePicker}
                onSelection={(payload) => {
                  console.log(payload);
                }}
              />

              <Button primary submit>
                Save
              </Button>
            </FormLayout>
          </Form>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default CreateBundle;
