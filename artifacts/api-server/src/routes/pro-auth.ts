import { Router } from "express";
import { requireAuth, getAuthUser } from "../middlewares/requireAuth";
import { pool } from "@workspace/db";
import { db } from "@workspace/db";
import { profilesTable } from "@workspace/db/schema";
import { eq, or } from "drizzle-orm";
import type { Request, Response } from "express";

const router = Router();

/* ── helpers ─────────────────────────────────────── */
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-().]/g, "");
}

async function sendSms(phone: string, code: string, log: (obj: unknown, msg: string) => void) {
  /* DEV MODE — log the OTP; replace with Twilio in production:
     const twilio = require("twilio")(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
     await twilio.messages.create({ body: `Votre code bloq5 Pro : ${code}`, from: process.env.TWILIO_FROM, to: phone });
  */
  log({ phone, code }, "⚡ [DEV] SMS OTP (replace with Twilio in production)");
}

async function sendRecoveryEmail(email: string, phone: string, log: (obj: unknown, msg: string) => void) {
  /* DEV MODE — log the recovery info; replace with real email (Resend/SendGrid) in production */
  log({ email, phone }, "⚡ [DEV] Pro account recovery email (replace with email provider in production)");
}

/* ── POST /api/pro/auth/send-otp ─────────────────── */
router.post("/api/pro/auth/send-otp", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);
    const rawPhone = String(req.body.phone ?? "").trim();
    if (!rawPhone) { res.status(400).json({ error: "Numéro de téléphone requis" }); return; }

    const phone = normalizePhone(rawPhone);
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const client = await pool.connect();
    try {
      await client.query(`DELETE FROM pro_otp WHERE user_id = $1`, [userId]);
      await client.query(
        `INSERT INTO pro_otp (user_id, phone, code, expires_at) VALUES ($1, $2, $3, $4)`,
        [userId, phone, code, expiresAt]
      );
    } finally {
      client.release();
    }

    await sendSms(phone, code, req.log.info.bind(req.log));
    res.json({ success: true });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ── POST /api/pro/auth/verify-otp ──────────────── */
router.post("/api/pro/auth/verify-otp", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);
    const rawPhone = String(req.body.phone ?? "").trim();
    const code = String(req.body.code ?? "").trim();
    if (!rawPhone || !code) { res.status(400).json({ error: "Données manquantes" }); return; }

    const phone = normalizePhone(rawPhone);

    const client = await pool.connect();
    let hasProAccount = false;
    try {
      const otpRes = await client.query(
        `SELECT id, code, expires_at, used FROM pro_otp WHERE user_id = $1 AND phone = $2 ORDER BY created_at DESC LIMIT 1`,
        [userId, phone]
      );

      if (otpRes.rowCount === 0) {
        res.status(400).json({ error: "Aucun code envoyé pour ce numéro" }); return;
      }

      const row = otpRes.rows[0];
      if (row.used) { res.status(400).json({ error: "Ce code a déjà été utilisé" }); return; }
      if (new Date(row.expires_at) < new Date()) { res.status(400).json({ error: "Code expiré — veuillez en demander un nouveau" }); return; }
      if (row.code !== code) { res.status(400).json({ error: "Code incorrect" }); return; }

      await client.query(`UPDATE pro_otp SET used = true WHERE id = $1`, [row.id]);

      /* Check if the current user already has a pro profile */
      const [profile] = await db.select({ role: profilesTable.role })
        .from(profilesTable).where(eq(profilesTable.userId, userId));
      hasProAccount = profile?.role === "owner" || profile?.role === "manager";
    } finally {
      client.release();
    }

    res.json({ verified: true, hasProAccount });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ── POST /api/pro/auth/complete ─────────────────── */
router.post("/api/pro/auth/complete", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId, email: authEmail } = getAuthUser(req);
    const { phone, proEmail, firstName, lastName, residentialAddress } = req.body as Record<string, string>;

    if (!phone || !proEmail || !firstName || !lastName || !residentialAddress) {
      res.status(400).json({ error: "Tous les champs sont requis" }); return;
    }

    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE profiles SET
          role = 'owner',
          phone = $2,
          pro_email = $3,
          first_name = $4,
          last_name = $5,
          residential_address = $6,
          updated_at = NOW()
        WHERE clerk_id = $1`,
        [userId, normalizePhone(phone), proEmail, firstName, lastName, residentialAddress]
      );
    } finally {
      client.release();
    }

    res.json({ success: true });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ── POST /api/pro/auth/recover ──────────────────── */
router.post("/api/pro/auth/recover", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const proEmail = String(req.body.proEmail ?? "").trim().toLowerCase();
    if (!proEmail) { res.status(400).json({ error: "Adresse e-mail requise" }); return; }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT phone, email, pro_email FROM profiles WHERE (LOWER(pro_email) = $1 OR LOWER(email) = $1) AND role IN ('owner','manager') LIMIT 1`,
        [proEmail]
      );
      if (result.rowCount && result.rowCount > 0) {
        const row = result.rows[0];
        await sendRecoveryEmail(proEmail, row.phone ?? "non renseigné", req.log.info.bind(req.log));
      }
    } finally {
      client.release();
    }

    res.json({ success: true });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
