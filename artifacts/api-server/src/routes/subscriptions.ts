import { Router } from "express";
import { requireAuth, getAuthUser } from "../middlewares/requireAuth";
import { db } from "@workspace/db";
import { subscriptionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { getUncachableStripeClient } from "../lib/stripeClient";
import { findPriceIdForPlan } from "../lib/stripeStorage";

export const PLANS = [
  {
    id: "free",
    name: "Gratuit",
    price: 0,
    currency: "CAD",
    interval: "month",
    maxProperties: 1,
    maxManagers: 0,
    canPublish: true,
    publicationCredits: 1,
    listingDurationMonths: 1,
    virtualTourCredits: 0,
    addonDiscount: 0,
    features: [
      "1 crédit de publication",
      "Annonce visible pendant 1 mois",
      "Gestion des demandes",
      "Support 24/7",
    ],
    isEnterprise: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: 45,
    currency: "CAD",
    interval: "month",
    maxProperties: 3,
    maxManagers: 0,
    canPublish: true,
    publicationCredits: 3,
    listingDurationMonths: 3,
    virtualTourCredits: 2,
    addonDiscount: 25,
    features: [
      "3 crédits de publication",
      "Annonces visibles pendant 3 mois",
      "2 visites virtuelles offertes",
      "25 % de rabais sur les services à la carte",
      "Gestion des demandes",
      "Support 24/7",
    ],
    isEnterprise: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 160,
    currency: "CAD",
    interval: "month",
    maxProperties: 10,
    maxManagers: 3,
    canPublish: true,
    publicationCredits: 10,
    listingDurationMonths: 3,
    virtualTourCredits: -1,
    addonDiscount: 40,
    features: [
      "Jusqu'à 10 crédits de publication",
      "Annonces visibles pendant 3 mois",
      "Équipe de 3 gestionnaires inclus",
      "Visites virtuelles illimitées incluses",
      "40 % de rabais sur les services à la carte",
      "Tableaux de bord avancés",
      "Statistiques détaillées",
      "Export des données",
      "Support prioritaire",
    ],
    isEnterprise: false,
  },
  {
    id: "enterprise",
    name: "Entreprise Pro",
    price: null,
    currency: "CAD",
    interval: "month",
    maxProperties: -1,
    maxManagers: -1,
    canPublish: true,
    publicationCredits: -1,
    listingDurationMonths: 12,
    virtualTourCredits: -1,
    addonDiscount: 50,
    features: [
      "Crédits de publication illimités",
      "Gestionnaires illimités",
      "Visites virtuelles illimitées",
      "API dédiée & intégrations personnalisées",
      "SLA garanti",
      "Responsable de compte dédié",
      "Formation et onboarding",
    ],
    isEnterprise: true,
  },
];

export function getPlanById(planId: string) {
  return PLANS.find((p) => p.id === planId) ?? PLANS[0];
}

const router = Router();

router.get("/api/subscriptions/plans", (_req: Request, res: Response): void => {
  res.setHeader("Cache-Control", "no-store");
  res.json(PLANS);
});

router.get("/api/subscriptions/current", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);

    let [subscription] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.ownerId, userId));

    if (!subscription) {
      [subscription] = await db
        .insert(subscriptionsTable)
        .values({ ownerId: userId, planId: "free", status: "active" })
        .returning();
    }

    const plan = getPlanById(subscription.planId);
    res.json({ ...subscription, plan });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ── Checkout: create a Stripe checkout session ─────────────── */
router.post("/api/subscriptions/checkout", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);
    const { planId } = req.body as { planId: string };

    const plan = PLANS.find((p) => p.id === planId);
    if (!plan || plan.isEnterprise || !plan.price) {
      res.status(400).json({ error: "Forfait invalide pour le paiement en ligne" });
      return;
    }

    let [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.ownerId, userId));
    if (!sub) {
      [sub] = await db.insert(subscriptionsTable).values({ ownerId: userId, planId: "free", status: "active" }).returning();
    }

    const priceId = await findPriceIdForPlan(planId);
    if (!priceId) {
      res.status(503).json({ error: "Paiement Stripe non encore configuré — contactez le support" });
      return;
    }

    const stripe = await getUncachableStripeClient();

    let customerId = sub.stripeCustomerId ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({ metadata: { userId } });
      customerId = customer.id;
      await db.update(subscriptionsTable)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(subscriptionsTable.ownerId, userId));
    }

    const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
    const base = domain ? `https://${domain}` : "http://localhost";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${base}/pro/subscription?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pro/subscription?checkout=cancel`,
      metadata: { userId, planId },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    req.log.error(error);
    if (error.message?.includes("Missing Replit") || error.message?.includes("not connected")) {
      res.status(503).json({ error: "Stripe non configuré — contactez le support" });
    } else {
      res.status(500).json({ error: "Erreur lors de la création de la session de paiement" });
    }
  }
});

/* ── Verify checkout: called after Stripe redirect ──────────── */
router.get("/api/subscriptions/verify-checkout", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);
    const sessionId = req.query["session_id"] as string;

    if (!sessionId) {
      res.status(400).json({ error: "session_id requis" });
      return;
    }

    const stripe = await getUncachableStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.payment_status !== "paid" && session.status !== "complete") {
      res.status(402).json({ error: "Paiement non complété" });
      return;
    }

    const planId = (session.metadata?.planId as string) ?? "starter";
    const stripeSub = session.subscription as any;
    const periodEnd = stripeSub?.current_period_end
      ? new Date(stripeSub.current_period_end * 1000)
      : null;

    await db.update(subscriptionsTable)
      .set({
        planId,
        status: "active",
        stripeSubscriptionId: stripeSub?.id ?? null,
        currentPeriodEnd: periodEnd,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionsTable.ownerId, userId));

    const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.ownerId, userId));
    res.json({ ...sub, plan: getPlanById(planId) });
  } catch (error: any) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur lors de la vérification du paiement" });
  }
});

/* ── Cancel subscription: cancel at period end ──────────────── */
router.post("/api/subscriptions/cancel", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);

    const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.ownerId, userId));
    if (!sub) {
      res.status(404).json({ error: "Aucun abonnement trouvé" });
      return;
    }
    if (sub.planId === "free" || !sub.stripeSubscriptionId) {
      res.status(400).json({ error: "Aucun abonnement payant actif à résilier" });
      return;
    }

    const stripe = await getUncachableStripeClient();
    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await db.update(subscriptionsTable)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(subscriptionsTable.ownerId, userId));

    const [updated] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.ownerId, userId));
    res.json({ ...updated, plan: getPlanById(updated.planId) });
  } catch (error: any) {
    req.log.error(error);
    if (error.message?.includes("Missing Replit") || error.message?.includes("not connected")) {
      res.status(503).json({ error: "Stripe non configuré — contactez le support" });
    } else {
      res.status(500).json({ error: "Erreur lors de la résiliation" });
    }
  }
});

/* ── List payment methods ────────────────────────────────────── */
router.get("/api/subscriptions/payment-methods", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);
    const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.ownerId, userId));
    if (!sub?.stripeCustomerId) { res.json({ paymentMethods: [], defaultPaymentMethodId: null }); return; }

    const stripe = await getUncachableStripeClient();
    const pms = await stripe.paymentMethods.list({ customer: sub.stripeCustomerId, type: "card" });
    const customer = await stripe.customers.retrieve(sub.stripeCustomerId) as any;
    const defaultPmId = customer.invoice_settings?.default_payment_method ?? null;

    res.setHeader("Cache-Control", "no-store");
    res.json({ paymentMethods: pms.data, defaultPaymentMethodId: defaultPmId });
  } catch (error: any) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des méthodes de paiement" });
  }
});

/* ── Delete a payment method ─────────────────────────────────── */
router.delete("/api/subscriptions/payment-methods/:pmId", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);
    const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.ownerId, userId));
    if (!sub?.stripeCustomerId) { res.status(400).json({ error: "Aucun compte Stripe trouvé" }); return; }

    const stripe = await getUncachableStripeClient();

    // Verify the payment method belongs to this customer before detaching
    const pm = await stripe.paymentMethods.retrieve(req.params.pmId);
    if (pm.customer !== sub.stripeCustomerId) {
      res.status(403).json({ error: "Accès refusé" });
      return;
    }

    await stripe.paymentMethods.detach(req.params.pmId);
    res.json({ success: true });
  } catch (error: any) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

/* ── Set default payment method ──────────────────────────────── */
router.post("/api/subscriptions/payment-methods/:pmId/default", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);
    const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.ownerId, userId));
    if (!sub?.stripeCustomerId) { res.status(400).json({ error: "Aucun compte Stripe trouvé" }); return; }

    const stripe = await getUncachableStripeClient();
    await stripe.customers.update(sub.stripeCustomerId, {
      invoice_settings: { default_payment_method: req.params.pmId },
    });
    res.json({ success: true });
  } catch (error: any) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
});

/* ── Customer portal: manage billing ────────────────────────── */
router.post("/api/subscriptions/portal", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);

    const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.ownerId, userId));
    if (!sub?.stripeCustomerId) {
      res.status(400).json({ error: "Aucun compte de facturation trouvé" });
      return;
    }

    const stripe = await getUncachableStripeClient();
    const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
    const returnUrl = domain ? `https://${domain}/pro/subscription` : "http://localhost/pro/subscription";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: returnUrl,
    });

    res.json({ url: portalSession.url });
  } catch (error: any) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur lors de l'accès au portail de facturation" });
  }
});

export default router;
