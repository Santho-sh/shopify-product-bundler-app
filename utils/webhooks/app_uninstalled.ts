// If you have the recommended extension installed, create a new page and type `createwebhook` to generate webhook boilerplate

import prisma from "@/utils/prisma";

const appUninstallHandler = async (topic, shop, webhookRequestBody) => {
  try {
    const webhookBody = JSON.parse(webhookRequestBody);
    await prisma.session.deleteMany({ where: { shop } });
    await prisma.active_stores.upsert({
      where: { shop: shop },
      update: { isActive: false },
      create: { shop: shop, isActive: false },
    });

    // Delete all bundles data in db
    await prisma.bundle_discount_id.deleteMany({
      where: {
        shop: shop,
      },
    });

    await prisma.auto_bundle_data.deleteMany({
      where: {
        shop: shop,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export default appUninstallHandler;
