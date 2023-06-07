import { useState, useEffect } from "react";
import useFetch from "./hooks/useFetch";
import { DataTable, LegacyCard, Spinner } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";

export default function AnalyticsTable() {
  const fetch = useFetch();
  const [i18n] = useI18n();

  const [gettingData, setGettingData] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const [rows, setRows] = useState([]);

  async function getData() {
    setGettingData(true);
    let data = await fetch("/api/getAnalyticsData", {
      method: "POST",
    }).then(async (res) => JSON.parse(await res.json()));

    let sales = 0;
    setRows(
      data.map((bundleData) => {
        sales += bundleData.sales;
        return [
          bundleData.bundleName,
          new Date(bundleData.createdAt).toDateString(),
          bundleData.summary,
          bundleData.sales,
        ];
      })
    );
    setTotalSales(sales);

    setGettingData(false);
  }

  useEffect(() => {
    getData();
  }, []);

  // when getting data showing spinner
  if (gettingData) {
    return (
      <>
        <div
          style={{
            height: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spinner accessibilityLabel="Spinner example" size="large" />
        </div>
      </>
    );
  }

  // if there is no data after loading then return none
  if (rows.length == 0) {
    return <></>;
  }

  return (
    <>
      <LegacyCard
        title={i18n.translate("index.analytics.total_sales")}
        sectioned
      >
        <h1>{totalSales}</h1>
      </LegacyCard>
      <LegacyCard>
        <DataTable
          columnContentTypes={["text", "text", "text", "numeric"]}
          headings={[
            `${i18n.translate("index.analytics.table.name")}`,
            `${i18n.translate("index.analytics.table.created")}`,
            `${i18n.translate("index.analytics.table.summary")}`,
            `${i18n.translate("index.analytics.table.sales")}`,
          ]}
          rows={rows}
        />
      </LegacyCard>
    </>
  );
}
