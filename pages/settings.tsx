import isShopAvailable from "../utils/middleware/isShopAvailable";
import { ContextualSaveBar, useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import {
  AlphaCard,
  Form,
  FormLayout,
  Layout,
  Page,
  TextField,
} from "@shopify/polaris";
import { useRouter } from "next/router";
import ProductsList from "../components/ProductsList";

//On first install, check if the store is installed and redirect accordingly
export async function getServerSideProps(context) {
  return await isShopAvailable(context);
}

const Settings = () => {
  const router = useRouter();
  const app = useAppBridge();
  const redirect = Redirect.create(app);

  return (
    <Page
      title="Settings"
      backAction={{
        onAction: () => redirect.dispatch(Redirect.Action.APP, "/"),
      }}
    >
      <Layout>
        <ProductsList />
        <Layout.Section fullWidth>
          <Form onSubmit={() => {}}>
            <ContextualSaveBar
              saveAction={{
                label: "Save",
              }}
              discardAction={{
                label: "Discard",
              }}
              fullWidth
            />
            <FormLayout>
              <AlphaCard>
                <TextField
                  autoComplete="true"
                  label="Title"
                  labelHidden
                  helpText="Title of the bundle"
                />
              </AlphaCard>
            </FormLayout>
          </Form>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Settings;
