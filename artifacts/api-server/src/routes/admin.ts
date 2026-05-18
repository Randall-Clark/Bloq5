import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin";
import { db, pool } from "@workspace/db";
import {
  propertiesTable,
  profilesTable,
  rentalRequestsTable,
  subscriptionsTable,
  messagesTable,
  user as userTable,
} from "@workspace/db/schema";
import { eq, sql, and, desc, inArray } from "drizzle-orm";
import type { Request, Response } from "express";

const router = Router();

/* ══════════════════════════════════════════════════════════════
   AUTH CHECK
══════════════════════════════════════════════════════════════ */
router.get("/api/admin/me", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  res.json({ role: "admin", name: req.authUser!.name, email: req.authUser!.email });
});

/* ══════════════════════════════════════════════════════════════
   STATS — Overview KPIs
══════════════════════════════════════════════════════════════ */
router.get("/api/admin/stats", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const [usersCount, propertiesCount, requestsCount, subsCount, propertiesAvailable, propertiesRented, pendingRequests] = await Promise.all([
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
  } catch (error) { req.log.error(error); res.status(500).json({ error: "Erreur serveur" }); }
});

/* ══════════════════════════════════════════════════════════════
   STATS — Timeline (30 days)
══════════════════════════════════════════════════════════════ */
router.get("/api/admin/stats/timeline", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const days = Math.min(90, Math.max(7, parseInt(String(req.query.days ?? "30")) || 30));
    const result = await pool.query(`
      WITH date_series AS (
        SELECT generate_series(
          date_trunc('day', NOW() - ($1::int || ' days')::interval),
          date_trunc('day', NOW()),
          '1 day'::interval
        ) AS day
      )
      SELECT
        to_char(ds.day, 'YYYY-MM-DD') as day,
        COALESCE(u.count, 0)::int  as users,
        COALESCE(p.count, 0)::int  as properties,
        COALESCE(r.count, 0)::int  as requests
      FROM date_series ds
      LEFT JOIN (
        SELECT date_trunc('day', created_at) as d, COUNT(*) as count
        FROM "user"
        WHERE created_at >= NOW() - ($1::int || ' days')::interval
        GROUP BY d
      ) u ON u.d = ds.day
      LEFT JOIN (
        SELECT date_trunc('day', created_at) as d, COUNT(*) as count
        FROM properties
        WHERE created_at >= NOW() - ($1::int || ' days')::interval
        GROUP BY d
      ) p ON p.d = ds.day
      LEFT JOIN (
        SELECT date_trunc('day', created_at) as d, COUNT(*) as count
        FROM rental_requests
        WHERE created_at >= NOW() - ($1::int || ' days')::interval
        GROUP BY d
      ) r ON r.d = ds.day
      ORDER BY ds.day
    `, [days]);

    res.json({ days, data: result.rows });
  } catch (error) { req.log.error(error); res.status(500).json({ error: "Erreur serveur" }); }
});

/* ══════════════════════════════════════════════════════════════
   USERS
══════════════════════════════════════════════════════════════ */
router.get("/api/admin/users", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const offset = (pageNum - 1) * limitNum;

    const [users, countResult] = await Promise.all([
      db.select({
        id: userTable.id, name: userTable.name, email: userTable.email,
        emailVerified: userTable.emailVerified, image: userTable.image,
        createdAt: userTable.createdAt,
        role: profilesTable.role, companyName: profilesTable.companyName,
      })
      .from(userTable).leftJoin(profilesTable, eq(profilesTable.userId, userTable.id))
      .orderBy(desc(userTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(userTable),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    res.json({ data: users, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) { req.log.error(error); res.status(500).json({ error: "Erreur serveur" }); }
});

router.patch("/api/admin/users/:id/role", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body as { role: string };
    if (!["admin","owner","tenant","manager"].includes(role)) { res.status(400).json({ error: "Rôle invalide" }); return; }
    const [existing] = await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.userId, id));
    if (existing) {
      await db.update(profilesTable).set({ role: role as any }).where(eq(profilesTable.userId, id));
    } else {
      const [u] = await db.select({ email: userTable.email }).from(userTable).where(eq(userTable.id, id));
      if (!u) { res.status(404).json({ error: "Introuvable" }); return; }
      await db.insert(profilesTable).values({ userId: id, email: u.email, role: role as any });
    }
    res.json({ ok: true });
  } catch (error) { req.log.error(error); res.status(500).json({ error: "Erreur serveur" }); }
});

/* ══════════════════════════════════════════════════════════════
   PROPERTIES
══════════════════════════════════════════════════════════════ */
router.get("/api/admin/properties", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "20", status } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const offset = (pageNum - 1) * limitNum;
    const conditions = status ? [eq(propertiesTable.status, status as any)] : [];
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
    const enriched = properties.map(p => ({ ...p, ownerName: ownerMap[p.ownerId]?.name ?? null, ownerEmail: ownerMap[p.ownerId]?.email ?? null }));

    const total = Number(countResult[0]?.count ?? 0);
    res.json({ data: enriched, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) { req.log.error(error); res.status(500).json({ error: "Erreur serveur" }); }
});

router.patch("/api/admin/properties/:id", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID invalide" }); return; }
    const { isFeatured, status } = req.body as { isFeatured?: boolean; status?: string };
    const updates: Record<string, any> = {};
    if (isFeatured !== undefined) updates.isFeatured = isFeatured;
    if (status     !== undefined) updates.status     = status;
    if (!Object.keys(updates).length) { res.status(400).json({ error: "Aucune modification" }); return; }
    await db.update(propertiesTable).set(updates).where(eq(propertiesTable.id, id));
    res.json({ ok: true });
  } catch (error) { req.log.error(error); res.status(500).json({ error: "Erreur serveur" }); }
});

router.delete("/api/admin/properties/:id", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID invalide" }); return; }
    await db.delete(propertiesTable).where(eq(propertiesTable.id, id));
    res.json({ ok: true });
  } catch (error) { req.log.error(error); res.status(500).json({ error: "Erreur serveur" }); }
});

/* ══════════════════════════════════════════════════════════════
   RENTAL REQUESTS
══════════════════════════════════════════════════════════════ */
router.get("/api/admin/requests", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "20", status } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const offset = (pageNum - 1) * limitNum;
    const conditions = status ? [eq(rentalRequestsTable.status, status as any)] : [];
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [requests, countResult] = await Promise.all([
      db.select({
        id: rentalRequestsTable.id, propertyId: rentalRequestsTable.propertyId,
        userId: rentalRequestsTable.userId, status: rentalRequestsTable.status,
        applicantName: rentalRequestsTable.applicantName, applicantEmail: rentalRequestsTable.applicantEmail,
        message: rentalRequestsTable.message, createdAt: rentalRequestsTable.createdAt,
        propertyTitle: propertiesTable.title, propertyCity: propertiesTable.city,
      })
      .from(rentalRequestsTable).leftJoin(propertiesTable, eq(rentalRequestsTable.propertyId, propertiesTable.id))
      .where(whereClause).orderBy(desc(rentalRequestsTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(rentalRequestsTable).where(whereClause),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    res.json({ data: requests, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) { req.log.error(error); res.status(500).json({ error: "Erreur serveur" }); }
});

/* ══════════════════════════════════════════════════════════════
   SUBSCRIPTIONS
══════════════════════════════════════════════════════════════ */
router.get("/api/admin/subscriptions", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const offset = (pageNum - 1) * limitNum;

    const [subs, countResult] = await Promise.all([
      db.select({
        id: subscriptionsTable.id, ownerId: subscriptionsTable.ownerId,
        planId: subscriptionsTable.planId, status: subscriptionsTable.status,
        currentPeriodEnd: subscriptionsTable.currentPeriodEnd,
        propertiesUsed: subscriptionsTable.propertiesUsed,
        managersUsed: subscriptionsTable.managersUsed,
        createdAt: subscriptionsTable.createdAt,
        userName: userTable.name, userEmail: userTable.email,
      })
      .from(subscriptionsTable).leftJoin(userTable, eq(userTable.id, subscriptionsTable.ownerId))
      .orderBy(desc(subscriptionsTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(subscriptionsTable),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    res.json({ data: subs, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) { req.log.error(error); res.status(500).json({ error: "Erreur serveur" }); }
});

router.patch("/api/admin/subscriptions/:id", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID invalide" }); return; }
    const { planId, status } = req.body as { planId?: string; status?: string };
    const updates: Record<string, any> = {};
    if (planId) updates.planId = planId;
    if (status) updates.status = status;
    if (!Object.keys(updates).length) { res.status(400).json({ error: "Aucune modification" }); return; }
    await db.update(subscriptionsTable).set(updates).where(eq(subscriptionsTable.id, id));
    res.json({ ok: true });
  } catch (error) { req.log.error(error); res.status(500).json({ error: "Erreur serveur" }); }
});

/* ══════════════════════════════════════════════════════════════
   MESSAGES / CONVERSATIONS
══════════════════════════════════════════════════════════════ */
router.get("/api/admin/conversations", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const offset = (pageNum - 1) * limitNum;

    const result = await pool.query(`
      SELECT
        m.request_id,
        rr.applicant_name,
        rr.applicant_email,
        p.title  AS property_title,
        p.city   AS property_city,
        COUNT(m.id)::int                                                AS message_count,
        MAX(m.created_at)                                               AS last_message_at,
        (SELECT content FROM messages WHERE request_id = m.request_id ORDER BY created_at DESC LIMIT 1) AS last_message
      FROM messages m
      LEFT JOIN rental_requests rr ON rr.id = m.request_id
      LEFT JOIN properties p ON p.id = rr.property_id
      GROUP BY m.request_id, rr.applicant_name, rr.applicant_email, p.title, p.city
      ORDER BY last_message_at DESC
      LIMIT $1 OFFSET $2
    `, [limitNum, offset]);

    const countResult = await pool.query(`SELECT COUNT(DISTINCT request_id)::int as count FROM messages`);
    const total = Number(countResult.rows[0]?.count ?? 0);

    res.json({ data: result.rows, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) { req.log.error(error); res.status(500).json({ error: "Erreur serveur" }); }
});

router.delete("/api/admin/conversations/:requestId", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const requestId = parseInt(req.params.requestId);
    if (isNaN(requestId)) { res.status(400).json({ error: "ID invalide" }); return; }
    await db.delete(messagesTable).where(eq(messagesTable.requestId, requestId));
    res.json({ ok: true });
  } catch (error) { req.log.error(error); res.status(500).json({ error: "Erreur serveur" }); }
});

/* ══════════════════════════════════════════════════════════════
   SITE SETTINGS
══════════════════════════════════════════════════════════════ */
router.get("/api/admin/settings", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`SELECT key, value, label, description, updated_at FROM site_settings ORDER BY key`);
    res.json(result.rows);
  } catch (error) { req.log.error(error); res.status(500).json({ error: "Erreur serveur" }); }
});

router.put("/api/admin/settings/:key", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const { value } = req.body as { value: unknown };
    await pool.query(
      `INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2::jsonb, updated_at = NOW()`,
      [key, JSON.stringify(value)]
    );
    res.json({ ok: true });
  } catch (error) { req.log.error(error); res.status(500).json({ error: "Erreur serveur" }); }
});

/* ══════════════════════════════════════════════════════════════
   CITIES
══════════════════════════════════════════════════════════════ */
router.get("/api/admin/cities", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT
        p.city                              AS name,
        COUNT(*)::int                       AS property_count,
        COALESCE(ac.is_active, true)        AS is_active
      FROM properties p
      LEFT JOIN admin_cities ac ON ac.name = p.city
      WHERE p.city IS NOT NULL AND p.city <> ''
      GROUP BY p.city, ac.is_active
      ORDER BY COUNT(*) DESC
    `);
    res.json(result.rows);
  } catch (error) { req.log.error(error); res.status(500).json({ error: "Erreur serveur" }); }
});

router.patch("/api/admin/cities", requireAdmin(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, isActive } = req.body as { name: string; isActive: boolean };
    if (!name) { res.status(400).json({ error: "Nom requis" }); return; }
    await pool.query(
      `INSERT INTO admin_cities (name, is_active) VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET is_active = $2`,
      [name, isActive]
    );
    res.json({ ok: true });
  } catch (error) { req.log.error(error); res.status(500).json({ error: "Erreur serveur" }); }
});

export default router;
