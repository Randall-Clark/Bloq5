import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        email: string;
        name: string;
        emailVerified: boolean;
        image?: string | null;
      };
    }
  }
}

export function getAuthUser(req: Request) {
  return req.authUser!;
}

export function requireAuth() {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
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
      next();
    } catch {
      res.status(401).json({ error: "Non autorisé" });
    }
  };
}
