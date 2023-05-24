import isShopAvailable from "@/utils/middleware/isShopAvailable";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { Layout, Page } from "@shopify/polaris";

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

//On first install, check if the store is installed and redirect accordingly
export async function getServerSideProps(context) {
  return await isShopAvailable(context);
}

export default Settings;
