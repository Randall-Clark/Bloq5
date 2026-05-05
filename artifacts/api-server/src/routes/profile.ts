import { Router } from "express";
import { requireAuth, getAuthUser } from "../middlewares/requireAuth";
import { db } from "@workspace/db";
import { profilesTable } from "@workspace/db/schema";
import { propertiesTable } from "@workspace/db/schema";
import { eq, count } from "drizzle-orm";
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

    const [{ value: totalProperties }] = await db
      .select({ value: count() })
      .from(propertiesTable)
      .where(eq(propertiesTable.ownerId, userId));

    res.json({ ...profile, totalProperties });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/api/profile", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId, email: authEmail } = getAuthUser(req);

    const allowed = [
      "firstName", "lastName", "phone", "role", "avatarUrl", "email",
      "companyName", "companyType", "companyNumber", "companyAddress",
      "companyWebsite", "companyDescription", "companySize",
    ];
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

    const [{ value: totalProperties }] = await db
      .select({ value: count() })
      .from(propertiesTable)
      .where(eq(propertiesTable.ownerId, userId));

    res.json({ ...profile, totalProperties });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
