import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { db } from "@workspace/db";
import { profilesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export function requireAdmin() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sessionData = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      if (!sessionData?.user) {
        res.status(401).json({ error: "Non autorisé" });
        return;
      }
      req.authUser = {
        id: sessionData.user.id,
        email: sessionData.user.email,
        name: sessionData.user.name,
        emailVerified: sessionData.user.emailVerified,
        image: sessionData.user.image,
      };
      const [profile] = await db
        .select({ role: profilesTable.role })
        .from(profilesTable)
        .where(eq(profilesTable.userId, sessionData.user.id));
      if (!profile || profile.role !== "admin") {
        res.status(403).json({ error: "Accès réservé aux administrateurs" });
        return;
      }
      next();
    } catch {
      res.status(401).json({ error: "Non autorisé" });
    }
  };
}
