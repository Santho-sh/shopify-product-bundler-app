import { useState, useEffect } from "react";
import useFetch from "./hooks/useFetch";
import { DataTable, LegacyCard } from "@shopify/polaris";

export default function AnalyticsTable() {
  const fetch = useFetch();

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

  return (
    <>
      <LegacyCard title="Total Bundle Sales" sectioned>
        <h1>{totalSales}</h1>
      </LegacyCard>
      <LegacyCard>
        <DataTable
          columnContentTypes={["text", "text", "numeric"]}
          headings={["Bundle", "Created", "Summary", "Sales"]}
          rows={rows}
        />
      </LegacyCard>
    </>
  );
}
