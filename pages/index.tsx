import isShopAvailable from "@/utils/middleware/isShopAvailable";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { Button, Layout, Page } from "@shopify/polaris";
import ProductsTable from "@/components/ProductsTable";
import AnalyticsTable from "@/components/AnalyticsTable";

const HomePage = () => {
  const app = useAppBridge();
  const redirect = Redirect.create(app);

  return (
    <Page
      title="Bundles"
      secondaryActions={
        <Button
          onClick={() => {
            redirect.dispatch(Redirect.Action.APP, "/auto_bundle");
          }}
        >
          Auto Bundle Generation
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
          <ProductsTable />
          <AnalyticsTable />
        </Layout.Section>
      </Layout>
    </Page>
  );
};

//On first install, check if the store is installed and redirect accordingly
export async function getServerSideProps(context) {
  return await isShopAvailable(context);
}

export default HomePage;
