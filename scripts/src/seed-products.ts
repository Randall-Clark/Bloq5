import { getUncachableStripeClient } from "./stripeClient.js";

const PLANS = [
  {
    planId: "starter",
    name: "Starter bloq5",
    description: "1 annonce publiée, visite virtuelle payante, support 24/7",
    unitAmount: 4500,
    currency: "cad",
  },
  {
    planId: "pro",
    name: "Pro bloq5",
    description: "Jusqu'à 10 propriétés, 2 gestionnaires inclus, visites virtuelles incluses",
    unitAmount: 16000,
    currency: "cad",
  },
];

async function seedProducts() {
  const stripe = await getUncachableStripeClient();
  console.log("Creating bloq5 subscription products in Stripe…");

  for (const plan of PLANS) {
    const existing = await stripe.products.search({
      query: `metadata['planId']:'${plan.planId}' AND active:'true'`,
    });

    if (existing.data.length > 0) {
      console.log(`✓ ${plan.name} already exists (${existing.data[0].id})`);
      const prices = await stripe.prices.list({ product: existing.data[0].id, active: true });
      if (prices.data.length > 0) {
        console.log(`  → Price: ${prices.data[0].id} (${plan.unitAmount / 100} ${plan.currency.toUpperCase()}/mo)`);
      }
      continue;
    }

    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: { planId: plan.planId },
    });
    console.log(`✓ Created product: ${product.name} (${product.id})`);

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.unitAmount,
      currency: plan.currency,
      recurring: { interval: "month" },
    });
    console.log(`  → Created price: ${price.id} (${plan.unitAmount / 100} ${plan.currency.toUpperCase()}/mo)`);
  }

  console.log("\nDone! Webhooks will sync to the database automatically.");
}

seedProducts().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
