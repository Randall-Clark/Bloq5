import { Router } from "express";
import { requireAuth, getAuthUser } from "../middlewares/requireAuth";
import { db } from "@workspace/db";
import { favoritesTable, propertiesTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import type { Request, Response } from "express";

const router = Router();

router.get("/api/favorites", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);

    const favorites = await db
      .select({ id: favoritesTable.id, propertyId: favoritesTable.propertyId, createdAt: favoritesTable.createdAt, property: propertiesTable })
      .from(favoritesTable)
      .leftJoin(propertiesTable, eq(favoritesTable.propertyId, propertiesTable.id))
      .where(eq(favoritesTable.userId, userId));

    res.json(favorites);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/api/favorites", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);

    const { propertyId } = req.body;
    if (!propertyId) { res.status(400).json({ error: "propertyId requis" }); return; }

    const existing = await db
      .select()
      .from(favoritesTable)
      .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.propertyId, parseInt(String(propertyId)))));

    if (existing.length > 0) { res.status(409).json({ error: "Déjà en favoris" }); return; }

    const [favorite] = await db.insert(favoritesTable).values({ userId, propertyId: parseInt(String(propertyId)) }).returning();
    res.status(201).json(favorite);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/api/favorites/:propertyId", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);

    const propertyId = parseInt(String(req.params.propertyId));
    await db.delete(favoritesTable).where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.propertyId, propertyId)));
    res.status(204).send();
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
