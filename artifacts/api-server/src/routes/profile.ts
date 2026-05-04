import { Router } from "express";
import { requireAuth, getAuthUser } from "../middlewares/requireAuth";
import { db } from "@workspace/db";
import { profilesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

const router = Router();

router.get("/api/profile", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId, email } = getAuthUser(req);

    let [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId));

    if (!profile) {
      [profile] = await db.insert(profilesTable).values({
        userId,
        email,
        firstName: "",
        lastName: "",
      }).returning();
    }

    res.json(profile);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/api/profile", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId, email: authEmail } = getAuthUser(req);

    const allowed = ["firstName", "lastName", "phone", "role", "avatarUrl", "email"];
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const existing = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId));

    let profile;
    if (existing.length === 0) {
      [profile] = await db.insert(profilesTable).values({
        userId,
        email: String(req.body.email ?? authEmail),
        firstName: String(req.body.firstName ?? ""),
        lastName: String(req.body.lastName ?? ""),
        ...updates,
      }).returning();
    } else {
      [profile] = await db.update(profilesTable).set(updates).where(eq(profilesTable.userId, userId)).returning();
    }

    res.json(profile);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
