import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { propertiesTable, insertPropertySchema } from "@workspace/db/schema";
import { eq, sql, ilike, and, gte, lte } from "drizzle-orm";
import type { Request, Response } from "express";

const router = Router();

router.get("/api/properties", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "12",
      type,
      city,
      minPrice,
      maxPrice,
      bedrooms,
    } = req.query as Record<string, string | undefined>;

    const pageNum = parseInt(page ?? "1") || 1;
    const limitNum = parseInt(limit ?? "12") || 12;
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (type) conditions.push(eq(propertiesTable.type, type as any));
    if (city) conditions.push(ilike(propertiesTable.city, `%${city}%`));
    if (minPrice) conditions.push(gte(propertiesTable.price, minPrice as any));
    if (maxPrice) conditions.push(lte(propertiesTable.price, maxPrice as any));
    if (bedrooms) conditions.push(eq(propertiesTable.bedrooms, parseInt(bedrooms)));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [properties, countResult] = await Promise.all([
      db.select().from(propertiesTable).where(whereClause).limit(limitNum).offset(offset).orderBy(propertiesTable.createdAt),
      db.select({ count: sql<number>`count(*)` }).from(propertiesTable).where(whereClause),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    res.json({ data: properties, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/api/properties/featured", async (req: Request, res: Response): Promise<void> => {
  try {
    const properties = await db.select().from(propertiesTable).where(eq(propertiesTable.isFeatured, true)).limit(6).orderBy(propertiesTable.createdAt);
    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/api/properties/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "ID invalide" }); return; }

    const [property] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, id));
    if (!property) { res.status(404).json({ error: "Propriété non trouvée" }); return; }

    await db.update(propertiesTable).set({ views: sql`${propertiesTable.views} + 1` }).where(eq(propertiesTable.id, id));
    res.json({ ...property, views: property.views + 1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/api/properties/:id/available-dates", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "ID invalide" }); return; }

    const [property] = await db.select({ availableDates: propertiesTable.availableDates }).from(propertiesTable).where(eq(propertiesTable.id, id));
    if (!property) { res.status(404).json({ error: "Propriété non trouvée" }); return; }

    res.json(property.availableDates ?? []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/api/properties", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    if (!userId) { res.status(401).json({ error: "Non autorisé" }); return; }

    const parsed = insertPropertySchema.safeParse({ ...req.body, ownerId: userId });
    if (!parsed.success) { res.status(400).json({ error: parsed.error.issues }); return; }

    const [property] = await db.insert(propertiesTable).values(parsed.data).returning();
    res.status(201).json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/api/properties/:id", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "ID invalide" }); return; }

    const [existing] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, id));
    if (!existing) { res.status(404).json({ error: "Propriété non trouvée" }); return; }
    if (existing.ownerId !== userId) { res.status(403).json({ error: "Accès refusé" }); return; }

    const [updated] = await db.update(propertiesTable).set({ ...req.body, updatedAt: new Date() }).where(eq(propertiesTable.id, id)).returning();
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/api/properties/:id", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "ID invalide" }); return; }

    const [existing] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, id));
    if (!existing) { res.status(404).json({ error: "Propriété non trouvée" }); return; }
    if (existing.ownerId !== userId) { res.status(403).json({ error: "Accès refusé" }); return; }

    await db.delete(propertiesTable).where(eq(propertiesTable.id, id));
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
