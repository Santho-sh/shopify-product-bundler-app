import isShopAvailable from "../utils/middleware/isShopAvailable";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { Button, Layout, Page } from "@shopify/polaris";
import ProductsList from "../components/ProductsList";

//On first install, check if the store is installed and redirect accordingly
export async function getServerSideProps(context) {
  return await isShopAvailable(context);
}

const HomePage = () => {
  const app = useAppBridge();
  const redirect = Redirect.create(app);

  return (
    <Page
      title="Home"
      secondaryActions={
        <Button
          onClick={() => {
            redirect.dispatch(Redirect.Action.APP, "/settings");
          }}
        >
          Settings
        </Button>
      }
      primaryAction={{
        content: "Create Bundle",
        onAction: () => {
          redirect.dispatch(Redirect.Action.APP, "/create_bundle");
        },
      }}
    >
      <Layout>
        <Layout.Section>
          <ProductsList />
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default HomePage;
