import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { visitsTable, propertiesTable, insertVisitSchema } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

const router = Router();

router.get("/api/visits", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    if (!userId) { res.status(401).json({ error: "Non autorisé" }); return; }

    const visits = await db
      .select({
        id: visitsTable.id,
        propertyId: visitsTable.propertyId,
        propertyTitle: propertiesTable.title,
        propertyImage: propertiesTable.images,
        type: visitsTable.type,
        scheduledDate: visitsTable.scheduledDate,
        status: visitsTable.status,
        createdAt: visitsTable.createdAt,
      })
      .from(visitsTable)
      .leftJoin(propertiesTable, eq(visitsTable.propertyId, propertiesTable.id))
      .where(eq(visitsTable.userId, userId))
      .orderBy(visitsTable.scheduledDate);

    res.json(visits.map((v) => ({ ...v, propertyImage: Array.isArray(v.propertyImage) ? v.propertyImage[0] ?? null : null })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/api/visits", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    if (!userId) { res.status(401).json({ error: "Non autorisé" }); return; }

    const parsed = insertVisitSchema.safeParse({
      ...req.body,
      userId,
      scheduledDate: new Date(req.body.scheduledDate),
    });
    if (!parsed.success) { res.status(400).json({ error: parsed.error.issues }); return; }

    const [visit] = await db.insert(visitsTable).values(parsed.data).returning();
    res.status(201).json(visit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
