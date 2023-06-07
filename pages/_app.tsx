import { NavigationMenu } from "@shopify/app-bridge-react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import translations from "@shopify/polaris/locales/en.json";
import AppBridgeProvider from "@/components/providers/AppBridgeProvider";
import { useRouter } from "next/router";
import { I18nContext, I18nManager } from "@shopify/react-i18n";

const locale = "en";
const i18nManager = new I18nManager({
  locale,
  onError(error) {
    console.error(error);
  },
});

export default function App({ Component, pageProps }) {
  const router = useRouter();
  return (
    <I18nContext.Provider value={i18nManager}>
      <PolarisProvider i18n={translations}>
        <AppBridgeProvider>
          <NavigationMenu
            navigationLinks={[
              {
                label: "Fetch Data",
                destination: "/debug/getData",
              },
              {
                label: "Billing API",
                destination: "/debug/billing",
              },
            ]}
            matcher={(link) => router.pathname === link.destination}
          />
          <Component {...pageProps} />
        </AppBridgeProvider>
      </PolarisProvider>
    </I18nContext.Provider>
  );
}
