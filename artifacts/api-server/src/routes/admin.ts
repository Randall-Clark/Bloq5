import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin";
import { db } from "@workspace/db";
import {
  propertiesTable,
  profilesTable,
  rentalRequestsTable,
  subscriptionsTable,
  user as userTable,
} from "@workspace/db/schema";
import { eq, sql, and, desc, inArray } from "drizzle-orm";
import type { Request, Response } from "express";

const router = Router();

/* ── GET /api/admin/me ──────────────────────────────────────── */
router.get("/api/admin/me", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  res.json({ role: "admin", name: req.authUser!.name, email: req.authUser!.email });
});

/* ── GET /api/admin/stats ───────────────────────────────────── */
router.get("/api/admin/stats", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      usersCount,
      propertiesCount,
      requestsCount,
      subsCount,
      propertiesAvailable,
      propertiesRented,
      pendingRequests,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(userTable),
      db.select({ count: sql<number>`count(*)` }).from(propertiesTable),
      db.select({ count: sql<number>`count(*)` }).from(rentalRequestsTable),
      db.select({ count: sql<number>`count(*)` }).from(subscriptionsTable).where(eq(subscriptionsTable.status, "active")),
      db.select({ count: sql<number>`count(*)` }).from(propertiesTable).where(eq(propertiesTable.status, "available")),
      db.select({ count: sql<number>`count(*)` }).from(propertiesTable).where(eq(propertiesTable.status, "rented")),
      db.select({ count: sql<number>`count(*)` }).from(rentalRequestsTable).where(eq(rentalRequestsTable.status, "pending")),
    ]);
    res.json({
      totalUsers:          Number(usersCount[0]?.count ?? 0),
      totalProperties:     Number(propertiesCount[0]?.count ?? 0),
      totalRequests:       Number(requestsCount[0]?.count ?? 0),
      activeSubscriptions: Number(subsCount[0]?.count ?? 0),
      propertiesAvailable: Number(propertiesAvailable[0]?.count ?? 0),
      propertiesRented:    Number(propertiesRented[0]?.count ?? 0),
      pendingRequests:     Number(pendingRequests[0]?.count ?? 0),
    });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ── GET /api/admin/users ───────────────────────────────────── */
router.get("/api/admin/users", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "20" } = req.query as Record<string, string | undefined>;
    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const offset   = (pageNum - 1) * limitNum;

    const [users, countResult] = await Promise.all([
      db
        .select({
          id:           userTable.id,
          name:         userTable.name,
          email:        userTable.email,
          emailVerified:userTable.emailVerified,
          image:        userTable.image,
          createdAt:    userTable.createdAt,
          role:         profilesTable.role,
          companyName:  profilesTable.companyName,
        })
        .from(userTable)
        .leftJoin(profilesTable, eq(profilesTable.userId, userTable.id))
        .orderBy(desc(userTable.createdAt))
        .limit(limitNum)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(userTable),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    res.json({ data: users, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ── PATCH /api/admin/users/:id/role ────────────────────────── */
router.patch("/api/admin/users/:id/role", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body as { role: string };
    const validRoles = ["admin", "owner", "tenant", "manager"];
    if (!validRoles.includes(role)) { res.status(400).json({ error: "Rôle invalide" }); return; }

    const [existing] = await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.userId, id));
    if (existing) {
      await db.update(profilesTable).set({ role: role as any }).where(eq(profilesTable.userId, id));
    } else {
      const [u] = await db.select({ email: userTable.email }).from(userTable).where(eq(userTable.id, id));
      if (!u) { res.status(404).json({ error: "Utilisateur introuvable" }); return; }
      await db.insert(profilesTable).values({ userId: id, email: u.email, role: role as any });
    }
    res.json({ ok: true });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ── GET /api/admin/properties ──────────────────────────────── */
router.get("/api/admin/properties", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "20", status } = req.query as Record<string, string | undefined>;
    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const offset   = (pageNum - 1) * limitNum;

    const conditions = [];
    if (status) conditions.push(eq(propertiesTable.status, status as any));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [properties, countResult] = await Promise.all([
      db.select().from(propertiesTable).where(whereClause).orderBy(desc(propertiesTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(propertiesTable).where(whereClause),
    ]);

    const ownerIds = [...new Set(properties.map(p => p.ownerId))].filter(Boolean);
    const owners = ownerIds.length > 0
      ? await db.select({ id: userTable.id, name: userTable.name, email: userTable.email }).from(userTable).where(inArray(userTable.id, ownerIds))
      : [];
    const ownerMap = Object.fromEntries(owners.map(o => [o.id, o]));

    const enriched = properties.map(p => ({
      ...p,
      ownerName:  ownerMap[p.ownerId]?.name  ?? null,
      ownerEmail: ownerMap[p.ownerId]?.email ?? null,
    }));

    const total = Number(countResult[0]?.count ?? 0);
    res.json({ data: enriched, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ── PATCH /api/admin/properties/:id ────────────────────────── */
router.patch("/api/admin/properties/:id", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID invalide" }); return; }
    const { isFeatured, status } = req.body as { isFeatured?: boolean; status?: string };
    const updates: Record<string, any> = {};
    if (isFeatured !== undefined) updates.isFeatured = isFeatured;
    if (status     !== undefined) updates.status     = status;
    if (Object.keys(updates).length === 0) { res.status(400).json({ error: "Aucune modification" }); return; }
    await db.update(propertiesTable).set(updates).where(eq(propertiesTable.id, id));
    res.json({ ok: true });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ── DELETE /api/admin/properties/:id ───────────────────────── */
router.delete("/api/admin/properties/:id", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID invalide" }); return; }
    await db.delete(propertiesTable).where(eq(propertiesTable.id, id));
    res.json({ ok: true });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ── GET /api/admin/requests ────────────────────────────────── */
router.get("/api/admin/requests", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "20", status } = req.query as Record<string, string | undefined>;
    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const offset   = (pageNum - 1) * limitNum;

    const conditions = [];
    if (status) conditions.push(eq(rentalRequestsTable.status, status as any));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [requests, countResult] = await Promise.all([
      db.select({
        id:             rentalRequestsTable.id,
        propertyId:     rentalRequestsTable.propertyId,
        userId:         rentalRequestsTable.userId,
        status:         rentalRequestsTable.status,
        applicantName:  rentalRequestsTable.applicantName,
        applicantEmail: rentalRequestsTable.applicantEmail,
        message:        rentalRequestsTable.message,
        createdAt:      rentalRequestsTable.createdAt,
        propertyTitle:  propertiesTable.title,
        propertyCity:   propertiesTable.city,
      })
      .from(rentalRequestsTable)
      .leftJoin(propertiesTable, eq(rentalRequestsTable.propertyId, propertiesTable.id))
      .where(whereClause)
      .orderBy(desc(rentalRequestsTable.createdAt))
      .limit(limitNum)
      .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(rentalRequestsTable).where(whereClause),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    res.json({ data: requests, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
