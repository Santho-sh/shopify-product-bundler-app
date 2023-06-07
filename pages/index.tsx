import isShopAvailable from "@/utils/middleware/isShopAvailable";
import { useAppBridge, useLocale } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { Button, Layout, Page } from "@shopify/polaris";
import ProductsTable from "@/components/ProductsTable";
import AnalyticsTable from "@/components/AnalyticsTable";
import { useI18n } from "@shopify/react-i18n";

const HomePage = () => {
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const [i18n] = useI18n();

  return (
    <Page
      title={i18n.translate("index.title")}
      secondaryActions={
        <Button
          onClick={() => {
            redirect.dispatch(Redirect.Action.APP, "/auto_bundle");
          }}
        >
          {i18n.translate("buttons.auto_bundle")}
        </Button>
      }
      primaryAction={{
        content: `${i18n.translate("buttons.create_bundle")}`,
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
