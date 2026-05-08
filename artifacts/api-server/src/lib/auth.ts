import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@workspace/db";
import { user, session, account, verification } from "@workspace/db/schema";
import { getUncachableResendClient } from "./resend-client";
import { resetPasswordEmailHtml, resetPasswordEmailText, welcomeEmailHtml, welcomeEmailText } from "./email-templates";
import { logger } from "./logger";

const baseURL =
  process.env.BETTER_AUTH_URL ??
  (process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : "http://localhost");

export const auth = betterAuth({
  secret: process.env.SESSION_SECRET ?? "dev-secret-bloq5-change-in-prod",
  baseURL,
  basePath: "/api/auth",
  trustedOrigins: [
    baseURL,
    ...(process.env.REPLIT_DOMAINS ? process.env.REPLIT_DOMAINS.split(",").map((d) => `https://${d.trim()}`) : []),
    "http://localhost",
    "http://localhost:80",
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    sendResetPassword: async ({ user: u, url }) => {
      try {
        const { client, fromEmail } = await getUncachableResendClient();
        await client.emails.send({
          from: `BLOQ5 <${fromEmail}>`,
          to: [u.email],
          subject: "Réinitialisation de votre mot de passe BLOQ5",
          html: resetPasswordEmailHtml(url, u.name ?? ""),
          text: resetPasswordEmailText(url),
        });
        logger.info({ to: u.email }, "[EMAIL] Lien reset mot de passe envoyé");
      } catch (err) {
        logger.error({ err, email: u.email, url }, "[EMAIL] Échec envoi reset password — lien loggé");
      }
    },
  },
  user: {
    additionalFields: {},
  },
  databaseHooks: {
    user: {
      create: {
        after: async (newUser) => {
          try {
            const { client, fromEmail } = await getUncachableResendClient();
            await client.emails.send({
              from: `BLOQ5 <${fromEmail}>`,
              to: [newUser.email],
              subject: "Bienvenue sur BLOQ5 !",
              html: welcomeEmailHtml(newUser.name ?? "", newUser.email),
              text: welcomeEmailText(newUser.name ?? ""),
            });
            logger.info({ to: newUser.email }, "[EMAIL] Email de bienvenue envoyé");
          } catch (err) {
            logger.error({ err, email: newUser.email }, "[EMAIL] Échec envoi email de bienvenue");
          }
        },
      },
    },
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },
  advanced: {
    cookiePrefix: "bloq5",
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
    crossSubDomainCookies: { enabled: false },
    generateId: false,
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
