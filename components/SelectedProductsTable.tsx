import {
  Product,
  ProductVariant,
} from "@shopify/app-bridge/actions/ResourcePicker";
import { IndexTable, LegacyCard, Text } from "@shopify/polaris";
import React, { ReactElement } from "react";
import { useI18n } from "@shopify/react-i18n";

type Props = {
  products: Product[];
};

function SelectedProductsTable({ products }: Props): ReactElement {
  let productsArray: Partial<ProductVariant>[] = [];
  const [i18n] = useI18n();

  products.forEach(({ variants }) => {
    productsArray.push(...variants);
  });

  const rowMarkup = productsArray.map(
    ({ id, displayName, title, price }, index) => (
      <IndexTable.Row id={id} key={id} position={index}>
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {displayName}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{title}</IndexTable.Cell>
        <IndexTable.Cell>{price}</IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  return (
    <LegacyCard>
      <IndexTable
        itemCount={productsArray.length}
        headings={[
          { title: `${i18n.translate("create_bundle.table.product")}` },
          { title: `${i18n.translate("create_bundle.table.title")}` },
          { title: `${i18n.translate("create_bundle.table.price")}` },
        ]}
        selectable={false}
      >
        {rowMarkup}
      </IndexTable>
    </LegacyCard>
  );
}

export default SelectedProductsTable;
