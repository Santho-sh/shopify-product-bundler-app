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

//On first install, check if the store is installed and redirect accordingly
export async function getServerSideProps(context) {
  return await isShopAvailable(context);
}

const Settings = () => {
  const app = useAppBridge();
  const redirect = Redirect.create(app);

  return (
    <Page
      title="Settinngs"
      backAction={{
        onAction: () => redirect.dispatch(Redirect.Action.APP, "/"),
      }}
    >
      <Layout>
        <Layout.Section fullWidth></Layout.Section>
      </Layout>
    </Page>
  );
};

export default Settings;
