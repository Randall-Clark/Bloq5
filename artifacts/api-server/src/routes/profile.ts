import { Router } from "express";
import { scryptSync, randomBytes } from "node:crypto";
import { requireAuth, getAuthUser } from "../middlewares/requireAuth";
import { db } from "@workspace/db";
import { profilesTable, user, verification, account } from "@workspace/db/schema";
import { propertiesTable } from "@workspace/db/schema";
import { eq, count, and } from "drizzle-orm";
import type { Request, Response } from "express";

const router = Router();

/* ── Scrypt hash compatible with better-auth ──────── */
function buildPasswordHash(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(
    password.normalize("NFKC"),
    salt,
    64,
    { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 },
  );
  return `${salt}:${hash.toString("hex")}`;
}

/* ── GET /api/profile ─────────────────────────────── */
router.get("/api/profile", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId, email, name } = getAuthUser(req);

    let [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId));

    const nameParts = (name ?? "").trim().split(/\s+/);
    const nameFirst = nameParts[0] ?? "";
    const nameLast = nameParts.slice(1).join(" ");

    if (!profile) {
      [profile] = await db.insert(profilesTable).values({
        userId,
        email,
        firstName: nameFirst,
        lastName: nameLast,
      }).returning();
    } else if (!profile.firstName && !profile.lastName && (nameFirst || nameLast)) {
      [profile] = await db.update(profilesTable)
        .set({ firstName: nameFirst, lastName: nameLast, updatedAt: new Date() })
        .where(eq(profilesTable.userId, userId))
        .returning();
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

/* ── PUT /api/profile ─────────────────────────────── */
router.put("/api/profile", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId, email: authEmail } = getAuthUser(req);

    const {
      firstName, lastName, phone, role, avatarUrl, email: bodyEmail,
      companyName, companyType, companyNumber, companyAddress,
      companyWebsite, companyDescription, companySize,
    } = req.body as Record<string, unknown>;

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
      ...(firstName    !== undefined && { firstName }),
      ...(lastName     !== undefined && { lastName }),
      ...(phone        !== undefined && { phone }),
      ...(role         !== undefined && { role }),
      ...(avatarUrl    !== undefined && { avatarUrl }),
      ...(bodyEmail    !== undefined && { email: bodyEmail }),
      ...(companyName  !== undefined && { companyName }),
      ...(companyType  !== undefined && { companyType }),
      ...(companyNumber !== undefined && { companyNumber }),
      ...(companyAddress !== undefined && { companyAddress }),
      ...(companyWebsite !== undefined && { companyWebsite }),
      ...(companyDescription !== undefined && { companyDescription }),
      ...(companySize  !== undefined && { companySize }),
    };

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

/* ── POST /api/profile/request-email-change ────────── */
router.post("/api/profile/request-email-change", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);
    const { newEmail } = req.body as { newEmail?: string };

    if (!newEmail || typeof newEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      res.status(400).json({ error: "Adresse e-mail invalide" });
      return;
    }

    const [existing] = await db.select().from(user).where(eq(user.email, newEmail.toLowerCase()));
    if (existing) {
      res.status(400).json({ error: "Cette adresse e-mail est déjà utilisée par un autre compte" });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const identifier = `email-change:${userId}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.delete(verification).where(eq(verification.identifier, identifier));
    await db.insert(verification).values({
      id: crypto.randomUUID(),
      identifier,
      value: `${newEmail.toLowerCase()}:${otp}`,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    req.log.info({ userId, newEmail }, "Code de vérification e-mail envoyé");
    if (process.env.NODE_ENV !== "production") {
      req.log.warn({ userId, newEmail }, "[DEV] email-change OTP logged — remove before production");
    }

    res.json({ success: true });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ── POST /api/profile/confirm-email-change ─────────── */
router.post("/api/profile/confirm-email-change", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);
    const { newEmail, otp } = req.body as { newEmail?: string; otp?: string };

    if (!newEmail || !otp) {
      res.status(400).json({ error: "Données manquantes" });
      return;
    }

    const identifier = `email-change:${userId}`;
    const [verif] = await db.select().from(verification).where(eq(verification.identifier, identifier));

    if (!verif) {
      res.status(400).json({ error: "Aucune demande de modification en cours. Recommencez depuis l'étape 1." });
      return;
    }

    if (verif.expiresAt < new Date()) {
      await db.delete(verification).where(eq(verification.identifier, identifier));
      res.status(400).json({ error: "Le code a expiré (10 minutes). Recommencez depuis l'étape 1." });
      return;
    }

    const colonIdx = verif.value.indexOf(":");
    const storedEmail = verif.value.slice(0, colonIdx);
    const storedOtp = verif.value.slice(colonIdx + 1);

    if (storedEmail !== newEmail.toLowerCase() || storedOtp !== otp.trim()) {
      res.status(400).json({ error: "Code incorrect. Vérifiez et réessayez." });
      return;
    }

    await db.update(user)
      .set({ email: newEmail.toLowerCase(), updatedAt: new Date() })
      .where(eq(user.id, userId));

    await db.update(profilesTable)
      .set({ email: newEmail.toLowerCase(), updatedAt: new Date() })
      .where(eq(profilesTable.userId, userId));

    await db.delete(verification).where(eq(verification.identifier, identifier));

    req.log.info({ userId, newEmail }, "E-mail modifié avec succès");
    res.json({ success: true });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ── POST /api/profile/request-password-change ──────── */
router.post("/api/profile/request-password-change", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId, email } = getAuthUser(req);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const identifier = `pwd-change:${userId}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.delete(verification).where(eq(verification.identifier, identifier));
    await db.insert(verification).values({
      id: crypto.randomUUID(),
      identifier,
      value: otp,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    req.log.info({ userId }, "Code de changement de mot de passe envoyé");
    if (process.env.NODE_ENV !== "production") {
      req.log.warn({ userId }, "[DEV] password-change OTP logged — remove before production");
    }

    res.json({ success: true });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ── POST /api/profile/set-password ─────────────────── */
router.post("/api/profile/set-password", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);
    const { newPassword, otp } = req.body as { newPassword?: string; otp?: string };

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères." });
      return;
    }
    if (!otp || typeof otp !== "string") {
      res.status(400).json({ error: "Code de vérification manquant." });
      return;
    }

    const identifier = `pwd-change:${userId}`;
    const [verif] = await db.select().from(verification).where(eq(verification.identifier, identifier));

    if (!verif) {
      res.status(400).json({ error: "Aucune demande en cours. Recommencez depuis l'étape 1." });
      return;
    }
    if (verif.expiresAt < new Date()) {
      await db.delete(verification).where(eq(verification.identifier, identifier));
      res.status(400).json({ error: "Le code a expiré. Recommencez depuis l'étape 1." });
      return;
    }
    if (verif.value !== otp.trim()) {
      res.status(400).json({ error: "Code incorrect. Vérifiez et réessayez." });
      return;
    }

    const hashedPassword = buildPasswordHash(newPassword);

    const [existingCred] = await db
      .select()
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.providerId, "credential")));

    if (existingCred) {
      await db.update(account)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(account.id, existingCred.id));
    } else {
      await db.insert(account).values({
        id: crypto.randomUUID(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await db.delete(verification).where(eq(verification.identifier, identifier));
    req.log.info({ userId }, "Mot de passe mis à jour avec succès");
    res.json({ success: true });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ── GET /api/auth/has-credential ─────────────────── */
router.get("/api/auth/has-credential", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);
    const [credAccount] = await db
      .select({ id: account.id })
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.providerId, "credential")));
    res.json({ hasCredential: !!credAccount });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
