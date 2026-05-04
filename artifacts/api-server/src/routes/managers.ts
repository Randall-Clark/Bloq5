import { Router } from "express";
import { requireAuth, getAuthUser } from "../middlewares/requireAuth";
import { db } from "@workspace/db";
import { managersTable, insertManagerSchema } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
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
