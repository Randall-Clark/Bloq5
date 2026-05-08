import { Router } from "express";
import { requireAuth, getAuthUser } from "../middlewares/requireAuth";
import { pool } from "@workspace/db";
import { db } from "@workspace/db";
import { profilesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { getUncachableResendClient } from "../lib/resend-client";
import {
  otpEmailHtml,
  otpEmailText,
  proRecoveryEmailHtml,
  proRecoveryEmailText,
} from "../lib/email-templates";

const router = Router();

/* ── helpers ─────────────────────────────────────── */
function generateOtp(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous O/0/I/1
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-().]/g, "");
}

async function sendOtpEmail(
  toEmail: string,
  code: string,
  log: (obj: unknown, msg: string) => void
) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    const result = await client.emails.send({
      from: `BLOQ5 Pro <${fromEmail}>`,
      to: [toEmail],
      subject: `Votre code d'accès Pro BLOQ5 : ${code}`,
      html: otpEmailHtml(code, toEmail),
      text: otpEmailText(code),
    });
    log({ to: toEmail, resendId: result.data?.id }, "[EMAIL] OTP Pro envoyé");
  } catch (err) {
    log({ err, to: toEmail, code }, "[EMAIL] Échec envoi OTP — code affiché en fallback");
    throw err;
  }
}

async function sendRecoveryEmail(
  toEmail: string,
  phone: string,
  log: (obj: unknown, msg: string) => void
) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    const result = await client.emails.send({
      from: `BLOQ5 <${fromEmail}>`,
      to: [toEmail],
      subject: "Récupération de votre accès Pro BLOQ5",
      html: proRecoveryEmailHtml(phone, toEmail),
      text: proRecoveryEmailText(phone),
    });
    log({ to: toEmail, resendId: result.data?.id }, "[EMAIL] Récupération Pro envoyée");
  } catch (err) {
    log({ err, to: toEmail }, "[EMAIL] Échec envoi récupération Pro");
    throw err;
  }
}

/* ── POST /api/pro/auth/send-otp ─────────────────── */
router.post("/api/pro/auth/send-otp", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId, email: userEmail } = getAuthUser(req);

    if (!userEmail) {
      res.status(400).json({ error: "Aucune adresse e-mail associée à votre compte" });
      return;
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const client = await pool.connect();
    try {
      // Delete all previous OTPs for this user + purge globally expired ones
      await client.query(`DELETE FROM pro_otp WHERE user_id = $1 OR expires_at < NOW()`, [userId]);
      await client.query(
        `INSERT INTO pro_otp (user_id, phone, code, expires_at) VALUES ($1, $2, $3, $4)`,
        [userId, userEmail, code, expiresAt]
      );
    } finally {
      client.release();
    }

    await sendOtpEmail(userEmail, code, req.log.info.bind(req.log));
    res.json({ success: true, sentTo: userEmail });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur lors de l'envoi du code. Réessayez." });
  }
});

/* ── POST /api/pro/auth/verify-otp ──────────────── */
router.post("/api/pro/auth/verify-otp", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId, email: userEmail } = getAuthUser(req);
    const code = String(req.body.code ?? "").trim().toUpperCase();

    if (!code) {
      res.status(400).json({ error: "Code manquant" });
      return;
    }

    const client = await pool.connect();
    let hasProAccount = false;
    try {
      const otpRes = await client.query(
        `SELECT id, code, expires_at, used FROM pro_otp WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );

      if (otpRes.rowCount === 0) {
        res.status(400).json({ error: "Aucun code envoyé — demandez un nouveau code" });
        return;
      }

      const row = otpRes.rows[0];
      if (row.used) {
        res.status(400).json({ error: "Ce code a déjà été utilisé" });
        return;
      }
      if (new Date(row.expires_at) < new Date()) {
        res.status(400).json({ error: "Code expiré — demandez un nouveau code" });
        return;
      }
      if (row.code !== code) {
        res.status(400).json({ error: "Code incorrect" });
        return;
      }

      // Delete after use — OTPs are single-use and temporary, not stored permanently
      await client.query(`DELETE FROM pro_otp WHERE id = $1`, [row.id]);

      const [profile] = await db
        .select({ role: profilesTable.role })
        .from(profilesTable)
        .where(eq(profilesTable.userId, userId));
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
    const { id: userId } = getAuthUser(req);
    const { phone, proEmail, firstName, lastName, residentialAddress } = req.body as Record<string, string>;

    if (!proEmail || !firstName || !lastName || !residentialAddress) {
      res.status(400).json({ error: "Tous les champs sont requis" });
      return;
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
        [userId, phone ? normalizePhone(phone) : null, proEmail, firstName, lastName, residentialAddress]
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
    if (!proEmail) {
      res.status(400).json({ error: "Adresse e-mail requise" });
      return;
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT phone, email, pro_email FROM profiles WHERE (LOWER(pro_email) = $1 OR LOWER(email) = $1) AND role IN ('owner','manager') LIMIT 1`,
        [proEmail]
      );
      if (result.rowCount && result.rowCount > 0) {
        const row = result.rows[0];
        await sendRecoveryEmail(proEmail, row.phone ?? "", req.log.info.bind(req.log));
      }
      // Always return success (security: don't reveal if email exists)
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
