import { Router } from "express";
import { requireAuth, getAuthUser } from "../middlewares/requireAuth";
import { db } from "@workspace/db";
import {
  rentalRequestsTable,
  propertiesTable,
  insertRentalRequestSchema,
  user as userTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

const router = Router();

router.get("/api/rental-requests", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);

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
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/api/rental-requests", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);

    const existingRequests = await db.select({ id: rentalRequestsTable.id }).from(rentalRequestsTable).where(eq(rentalRequestsTable.userId, userId));
    if (existingRequests.length >= 3) {
      res.status(400).json({ error: "Limite de 3 demandes atteinte. Frais supplémentaires de 5$ requis." });
      return;
    }

    const parsed = insertRentalRequestSchema.safeParse({ ...req.body, userId });
    if (!parsed.success) { res.status(400).json({ error: parsed.error.issues }); return; }

    const [request] = await db.insert(rentalRequestsTable).values(parsed.data).returning();

    /* ── Notification email au propriétaire (console log pour l'instant) ── */
    try {
      const [property] = await db
        .select({ ownerId: propertiesTable.ownerId, title: propertiesTable.title })
        .from(propertiesTable)
        .where(eq(propertiesTable.id, request.propertyId));
      if (property) {
        const [owner] = await db
          .select({ email: userTable.email, name: userTable.name })
          .from(userTable)
          .where(eq(userTable.id, property.ownerId));
        if (owner) {
          req.log.info(
            {
              notification: "rental_request",
              to: owner.email,
              ownerName: owner.name,
              property: property.title,
              applicant: parsed.data.applicantName,
              applicantEmail: parsed.data.applicantEmail,
            },
            `[EMAIL → PROPRIÉTAIRE] Nouvelle demande de location — "${property.title}" — Destinataire: ${owner.email} — Candidat: ${parsed.data.applicantName} <${parsed.data.applicantEmail}>`
          );
        }
      }
    } catch (notifErr) {
      req.log.warn(notifErr, "Impossible d'envoyer la notification au propriétaire");
    }

    res.status(201).json(request);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/api/rental-requests/:id", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);
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
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/api/rental-requests/:id/status", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "ID invalide" }); return; }

    const [request] = await db.select().from(rentalRequestsTable).where(eq(rentalRequestsTable.id, id));
    if (!request) { res.status(404).json({ error: "Demande non trouvée" }); return; }

    const [property] = await db.select({ ownerId: propertiesTable.ownerId }).from(propertiesTable).where(eq(propertiesTable.id, request.propertyId));
    if (property?.ownerId !== userId) { res.status(403).json({ error: "Accès refusé" }); return; }

    const { status, statusNote } = req.body as { status?: string; statusNote?: string };
    const allowed = ["pending", "approved", "rejected", "cancelled"];
    if (!status || !allowed.includes(status)) {
      res.status(400).json({ error: "Statut invalide" });
      return;
    }
    const [updated] = await db.update(rentalRequestsTable)
      .set({ status: status as "pending" | "approved" | "rejected" | "cancelled", statusNote: statusNote ?? null, updatedAt: new Date() })
      .where(eq(rentalRequestsTable.id, id))
      .returning();
    res.json(updated);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/api/properties/:id/rental-requests", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);
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
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
