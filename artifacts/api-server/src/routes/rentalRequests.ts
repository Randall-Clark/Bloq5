import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import {
  rentalRequestsTable,
  propertiesTable,
  insertRentalRequestSchema,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

const router = Router();

router.get("/api/rental-requests", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    if (!userId) { res.status(401).json({ error: "Non autorisé" }); return; }

    const requests = await db
      .select({
        id: rentalRequestsTable.id,
        propertyId: rentalRequestsTable.propertyId,
        propertyTitle: propertiesTable.title,
        propertyImage: propertiesTable.images,
        userId: rentalRequestsTable.userId,
        status: rentalRequestsTable.status,
        message: rentalRequestsTable.message,
        applicantName: rentalRequestsTable.applicantName,
        applicantEmail: rentalRequestsTable.applicantEmail,
        applicantPhone: rentalRequestsTable.applicantPhone,
        createdAt: rentalRequestsTable.createdAt,
        updatedAt: rentalRequestsTable.updatedAt,
      })
      .from(rentalRequestsTable)
      .leftJoin(propertiesTable, eq(rentalRequestsTable.propertyId, propertiesTable.id))
      .where(eq(rentalRequestsTable.userId, userId))
      .orderBy(rentalRequestsTable.createdAt);

    res.json(requests.map((r) => ({ ...r, propertyImage: Array.isArray(r.propertyImage) ? r.propertyImage[0] ?? null : null })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/api/rental-requests", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    if (!userId) { res.status(401).json({ error: "Non autorisé" }); return; }

    const existingRequests = await db.select({ id: rentalRequestsTable.id }).from(rentalRequestsTable).where(eq(rentalRequestsTable.userId, userId));
    if (existingRequests.length >= 3) {
      res.status(400).json({ error: "Limite de 3 demandes atteinte. Frais supplémentaires de 5$ requis." });
      return;
    }

    const parsed = insertRentalRequestSchema.safeParse({ ...req.body, userId });
    if (!parsed.success) { res.status(400).json({ error: parsed.error.issues }); return; }

    const [request] = await db.insert(rentalRequestsTable).values(parsed.data).returning();
    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/api/rental-requests/:id", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "ID invalide" }); return; }

    const [request] = await db
      .select({
        id: rentalRequestsTable.id,
        propertyId: rentalRequestsTable.propertyId,
        propertyTitle: propertiesTable.title,
        propertyImage: propertiesTable.images,
        userId: rentalRequestsTable.userId,
        status: rentalRequestsTable.status,
        message: rentalRequestsTable.message,
        applicantName: rentalRequestsTable.applicantName,
        applicantEmail: rentalRequestsTable.applicantEmail,
        applicantPhone: rentalRequestsTable.applicantPhone,
        statusNote: rentalRequestsTable.statusNote,
        conversationEnded: rentalRequestsTable.conversationEnded,
        createdAt: rentalRequestsTable.createdAt,
        updatedAt: rentalRequestsTable.updatedAt,
      })
      .from(rentalRequestsTable)
      .leftJoin(propertiesTable, eq(rentalRequestsTable.propertyId, propertiesTable.id))
      .where(eq(rentalRequestsTable.id, id));

    if (!request) { res.status(404).json({ error: "Demande non trouvée" }); return; }

    if (request.userId !== userId) {
      const [property] = await db.select({ ownerId: propertiesTable.ownerId }).from(propertiesTable).where(eq(propertiesTable.id, request.propertyId));
      if (property?.ownerId !== userId) { res.status(403).json({ error: "Accès refusé" }); return; }
    }

    res.json({ ...request, propertyImage: Array.isArray(request.propertyImage) ? request.propertyImage[0] ?? null : null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/api/rental-requests/:id/status", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "ID invalide" }); return; }

    const [request] = await db.select().from(rentalRequestsTable).where(eq(rentalRequestsTable.id, id));
    if (!request) { res.status(404).json({ error: "Demande non trouvée" }); return; }

    const [property] = await db.select({ ownerId: propertiesTable.ownerId }).from(propertiesTable).where(eq(propertiesTable.id, request.propertyId));
    if (property?.ownerId !== userId) { res.status(403).json({ error: "Accès refusé" }); return; }

    const { status, statusNote } = req.body;
    const [updated] = await db.update(rentalRequestsTable).set({ status, statusNote, updatedAt: new Date() }).where(eq(rentalRequestsTable.id, id)).returning();
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/api/properties/:id/rental-requests", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "ID invalide" }); return; }

    const [property] = await db.select({ ownerId: propertiesTable.ownerId }).from(propertiesTable).where(eq(propertiesTable.id, id));
    if (!property) { res.status(404).json({ error: "Propriété non trouvée" }); return; }
    if (property.ownerId !== userId) { res.status(403).json({ error: "Accès refusé" }); return; }

    const requests = await db
      .select({
        id: rentalRequestsTable.id,
        propertyId: rentalRequestsTable.propertyId,
        propertyTitle: propertiesTable.title,
        propertyImage: propertiesTable.images,
        userId: rentalRequestsTable.userId,
        status: rentalRequestsTable.status,
        message: rentalRequestsTable.message,
        applicantName: rentalRequestsTable.applicantName,
        applicantEmail: rentalRequestsTable.applicantEmail,
        applicantPhone: rentalRequestsTable.applicantPhone,
        createdAt: rentalRequestsTable.createdAt,
        updatedAt: rentalRequestsTable.updatedAt,
      })
      .from(rentalRequestsTable)
      .leftJoin(propertiesTable, eq(rentalRequestsTable.propertyId, propertiesTable.id))
      .where(eq(rentalRequestsTable.propertyId, id))
      .orderBy(rentalRequestsTable.createdAt);

    res.json(requests.map((r) => ({ ...r, propertyImage: Array.isArray(r.propertyImage) ? r.propertyImage[0] ?? null : null })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
