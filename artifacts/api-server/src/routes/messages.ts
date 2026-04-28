import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { messagesTable, rentalRequestsTable, propertiesTable, profilesTable } from "@workspace/db/schema";
import { eq, and, gt } from "drizzle-orm";
import type { Request, Response } from "express";

const router = Router();

async function canAccessConversation(userId: string, requestId: number): Promise<boolean> {
  const [request] = await db
    .select({ userId: rentalRequestsTable.userId, propertyId: rentalRequestsTable.propertyId })
    .from(rentalRequestsTable)
    .where(eq(rentalRequestsTable.id, requestId));

  if (!request) return false;
  if (request.userId === userId) return true;

  const [property] = await db.select({ ownerId: propertiesTable.ownerId }).from(propertiesTable).where(eq(propertiesTable.id, request.propertyId));
  return property?.ownerId === userId;
}

router.get("/api/messages/conversation/:requestId", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    if (!userId) { res.status(401).json({ error: "Non autorisé" }); return; }

    const requestId = parseInt(String(req.params.requestId));
    if (isNaN(requestId)) { res.status(400).json({ error: "ID invalide" }); return; }

    const canAccess = await canAccessConversation(userId, requestId);
    if (!canAccess) { res.status(403).json({ error: "Accès refusé" }); return; }

    const messages = await db
      .select()
      .from(messagesTable)
      .where(and(eq(messagesTable.requestId, requestId), gt(messagesTable.expiresAt, new Date())))
      .orderBy(messagesTable.createdAt);

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/api/messages", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    if (!userId) { res.status(401).json({ error: "Non autorisé" }); return; }

    const { requestId, content } = req.body;
    if (!requestId || !content) { res.status(400).json({ error: "requestId et content requis" }); return; }

    const requestIdNum = parseInt(String(requestId));
    const canAccess = await canAccessConversation(userId, requestIdNum);
    if (!canAccess) { res.status(403).json({ error: "Accès refusé" }); return; }

    const [request] = await db.select({ conversationEnded: rentalRequestsTable.conversationEnded }).from(rentalRequestsTable).where(eq(rentalRequestsTable.id, requestIdNum));
    if (request?.conversationEnded === 1) { res.status(400).json({ error: "La conversation a été clôturée" }); return; }

    const [profile] = await db.select({ firstName: profilesTable.firstName, lastName: profilesTable.lastName }).from(profilesTable).where(eq(profilesTable.clerkId, userId));
    const senderName = profile ? `${profile.firstName} ${profile.lastName}`.trim() || "Utilisateur" : "Utilisateur";

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const [message] = await db.insert(messagesTable).values({ requestId: requestIdNum, senderId: userId, senderName, content, expiresAt }).returning();
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/api/conversations/:requestId", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    if (!userId) { res.status(401).json({ error: "Non autorisé" }); return; }

    const requestId = parseInt(String(req.params.requestId));
    if (isNaN(requestId)) { res.status(400).json({ error: "ID invalide" }); return; }

    const [request] = await db.select({ propertyId: rentalRequestsTable.propertyId }).from(rentalRequestsTable).where(eq(rentalRequestsTable.id, requestId));
    if (!request) { res.status(404).json({ error: "Demande non trouvée" }); return; }

    const [property] = await db.select({ ownerId: propertiesTable.ownerId }).from(propertiesTable).where(eq(propertiesTable.id, request.propertyId));
    if (property?.ownerId !== userId) { res.status(403).json({ error: "Accès refusé" }); return; }

    await db.update(rentalRequestsTable).set({ conversationEnded: 1, updatedAt: new Date() }).where(eq(rentalRequestsTable.id, requestId));
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
