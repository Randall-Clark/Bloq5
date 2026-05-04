import { Router } from "express";
import { requireAuth, getAuthUser } from "../middlewares/requireAuth";
import { db } from "@workspace/db";
import { propertiesTable, rentalRequestsTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";
import type { Request, Response } from "express";

const router = Router();

router.get("/api/dashboard/stats", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);

    const properties = await db.select().from(propertiesTable).where(eq(propertiesTable.ownerId, userId));
    const propertyIds = properties.map((p) => p.id);

    let totalRequests = 0;
    let activeRequests = 0;
    let approvedRequests = 0;

    if (propertyIds.length > 0) {
      const idList = propertyIds.join(",");
      const requests = await db
        .select()
        .from(rentalRequestsTable)
        .where(sql`${rentalRequestsTable.propertyId} IN (${sql.raw(idList)})`);

      totalRequests = requests.length;
      activeRequests = requests.filter((r) => ["pending", "in_review", "awaiting_documents"].includes(r.status)).length;
      approvedRequests = requests.filter((r) => r.status === "approved").length;
    }

    const totalProperties = properties.length;
    const totalViews = properties.reduce((sum, p) => sum + (p.views ?? 0), 0);
    const propertiesAvailable = properties.filter((p) => p.status === "available").length;
    const propertiesRented = properties.filter((p) => p.status === "rented").length;
    const occupancyRate = totalProperties > 0 ? Math.round((propertiesRented / totalProperties) * 100) : 0;
    const estimatedRevenue = properties.filter((p) => p.status === "rented").reduce((sum, p) => sum + parseFloat(String(p.price)), 0);

    res.json({ totalProperties, totalViews, totalRequests, activeRequests, approvedRequests, estimatedRevenue, propertiesAvailable, propertiesRented, occupancyRate });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/api/dashboard/properties", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = getAuthUser(req);

    const properties = await db.select().from(propertiesTable).where(eq(propertiesTable.ownerId, userId)).orderBy(propertiesTable.createdAt);

    const result = await Promise.all(properties.map(async (p) => {
      const [reqCount] = await db.select({ count: sql<number>`count(*)` }).from(rentalRequestsTable).where(eq(rentalRequestsTable.propertyId, p.id));
      return {
        ...p,
        requestsCount: Number(reqCount?.count ?? 0),
        estimatedRevenue: p.status === "rented" ? parseFloat(String(p.price)) : 0,
      };
    }));

    res.json(result);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
