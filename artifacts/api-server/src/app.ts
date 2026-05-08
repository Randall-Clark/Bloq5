import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { WebhookHandlers } from "./lib/webhookHandlers";

const app: Express = express();

/* ── Security headers ──────────────────────────────── */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "same-site" },
  contentSecurityPolicy: false, // API-only server, CSP managed by frontend
}));

/* ── CORS — explicit origin allowlist ──────────────── */
const allowedOrigins = (() => {
  const s = new Set<string>();
  if (process.env.REPLIT_DEV_DOMAIN) s.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
  if (process.env.REPLIT_DOMAINS) {
    process.env.REPLIT_DOMAINS.split(",").forEach(d => { const t = d.trim(); if (t) s.add(`https://${t}`); });
  }
  if (process.env.NODE_ENV !== "production") {
    [3000, 5173, 8080, 18839].forEach(p => s.add(`http://localhost:${p}`));
  }
  return s;
})();

app.use(cors({
  credentials: true,
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // same-origin or server-to-server
    if (allowedOrigins.has(origin)) return cb(null, true);
    if (allowedOrigins.size === 0) return cb(null, true); // no config — dev fallback
    cb(new Error("Not allowed by CORS"));
  },
}));

/* ── Logging ───────────────────────────────────────── */
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) { return { id: req.id, method: req.method, url: req.url?.split("?")[0] }; },
      res(res) { return { statusCode: res.statusCode }; },
    },
  }),
);

/* ── Rate limiting ─────────────────────────────────── */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de tentatives. Réessayez dans 15 minutes." },
  skip: () => process.env.NODE_ENV !== "production",
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de codes envoyés. Réessayez dans 15 minutes." },
  skip: () => process.env.NODE_ENV !== "production",
});

app.use("/api/auth/sign-in/email", authLimiter);
app.use("/api/auth/sign-up/email", authLimiter);
app.use("/api/auth/forget-password", authLimiter);
app.use("/api/auth/reset-password", authLimiter);
app.use("/api/pro/auth/send-otp", otpLimiter);
app.use("/api/pro/auth/verify-otp", authLimiter);
app.use("/api/profile/request-password-change", otpLimiter);
app.use("/api/profile/set-password", authLimiter);
app.use("/api/profile/request-email-change", otpLimiter);

/* ── Stripe webhook — MUST be before express.json() ── */
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) { res.status(400).json({ error: "Missing stripe-signature" }); return; }
    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;
      await WebhookHandlers.processWebhook(req.body as Buffer, sig);
      res.status(200).json({ received: true });
    } catch (err: any) {
      logger.error({ err }, "Stripe webhook error");
      res.status(400).json({ error: "Webhook processing error" });
    }
  },
);

/* ── Body parsers ──────────────────────────────────── */
// 20 MB to support base64 image uploads on property routes; all others 2 MB
app.use((req, _res, next) => {
  if (req.path.startsWith("/api/properties") || req.path.startsWith("/api/pro/properties")) {
    express.json({ limit: "20mb" })(req, _res, next);
  } else {
    express.json({ limit: "2mb" })(req, _res, next);
  }
});
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use(router);

export default app;
