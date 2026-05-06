import { Router } from "express";
import { requireAuth, getAuthUser } from "../middlewares/requireAuth";
import { db } from "@workspace/db";
import { managersTable, insertManagerSchema, subscriptionsTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";
import type { Request, Response } from "express";

const router = Router();

router.get("/api/managers", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);
    const managers = await db.select().from(managersTable).where(eq(managersTable.ownerId, userId)).orderBy(managersTable.createdAt);
    res.json(managers);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/api/managers", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);

    /* ── Vérification forfait ─────────────────────────────────── */
    const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.ownerId, userId));
    const planId = sub?.planId ?? "free";

    if (!["pro", "enterprise"].includes(planId) || sub?.status !== "active") {
      res.status(403).json({
        error: "Le forfait Pro (160 $/mois) est requis pour ajouter des gestionnaires.",
        code: "PLAN_UPGRADE_REQUIRED",
        requiredPlan: "pro",
      });
      return;
    }

    /* ── Vérification limite gestionnaires ───────────────────── */
    const maxManagers = planId === "enterprise" ? Infinity : 2;
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(managersTable)
      .where(eq(managersTable.ownerId, userId));
    const currentCount = Number(countResult?.count ?? 0);

    if (currentCount >= maxManagers) {
      res.status(403).json({
        error: `Limite de ${maxManagers} gestionnaire(s) atteinte pour le forfait Pro.`,
        code: "MANAGER_LIMIT_REACHED",
      });
      return;
    }

    const parsed = insertManagerSchema.safeParse({ ...req.body, ownerId: userId });
    if (!parsed.success) { res.status(400).json({ error: parsed.error.issues }); return; }

    const [manager] = await db.insert(managersTable).values(parsed.data).returning();
    res.status(201).json(manager);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/api/managers/:id", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);

    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "ID invalide" }); return; }

    const [existing] = await db.select().from(managersTable).where(eq(managersTable.id, id));
    if (!existing) { res.status(404).json({ error: "Gestionnaire non trouvé" }); return; }
    if (existing.ownerId !== userId) { res.status(403).json({ error: "Accès refusé" }); return; }

    await db.delete(managersTable).where(and(eq(managersTable.id, id), eq(managersTable.ownerId, userId)));
    res.status(204).send();
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
