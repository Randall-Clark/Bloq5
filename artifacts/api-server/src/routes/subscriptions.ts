import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { subscriptionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 45,
    currency: "CAD",
    interval: "month",
    maxProperties: 5,
    maxManagers: 0,
    features: [
      "Jusqu'à 5 propriétés",
      "Photos illimitées",
      "Visite virtuelle (3 premiers mois)",
      "Gestion des demandes",
      "Support 24/7",
      "Messagerie temporaire",
    ],
    isEnterprise: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 80,
    currency: "CAD",
    interval: "month",
    maxProperties: 12,
    maxManagers: 5,
    features: [
      "Tout le plan Starter",
      "Jusqu'à 12 propriétés",
      "5 gestionnaires inclus",
      "Tableau de bord avancé",
      "Statistiques détaillées",
      "Export des données",
      "Visites virtuelles illimitées",
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
    features: [
      "Propriétés illimitées",
      "Gestionnaires illimités",
      "API dédiée",
      "Intégrations personnalisées",
      "SLA garanti",
      "Responsable de compte dédié",
      "Formation et onboarding",
    ],
    isEnterprise: true,
  },
];

const router = Router();

router.get("/api/subscriptions/plans", async (req: Request, res: Response): Promise<void> => {
  res.json(PLANS);
});

router.get("/api/subscriptions/current", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    if (!userId) { res.status(401).json({ error: "Non autorisé" }); return; }

    let [subscription] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.ownerId, userId));

    if (!subscription) {
      [subscription] = await db.insert(subscriptionsTable).values({ ownerId: userId, planId: "starter" }).returning();
    }

    const plan = PLANS.find((p) => p.id === subscription.planId) ?? PLANS[0];
    res.json({ ...subscription, plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
