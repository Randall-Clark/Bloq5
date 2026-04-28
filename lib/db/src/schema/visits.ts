import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { propertiesTable } from "./properties";

export const visitTypeEnum = pgEnum("visit_type", ["physical", "virtual"]);
export const visitStatusEnum = pgEnum("visit_status", [
  "scheduled",
  "completed",
  "cancelled",
]);

export const visitsTable = pgTable("visits", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id")
    .notNull()
    .references(() => propertiesTable.id),
  userId: text("user_id").notNull(),
  type: visitTypeEnum("type").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: visitStatusEnum("status").notNull().default("scheduled"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVisitSchema = createInsertSchema(visitsTable).omit({
  id: true,
  status: true,
  createdAt: true,
});
export type InsertVisit = z.infer<typeof insertVisitSchema>;
export type Visit = typeof visitsTable.$inferSelect;
