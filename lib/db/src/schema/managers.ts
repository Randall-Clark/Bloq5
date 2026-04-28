import {
  pgTable,
  serial,
  text,
  timestamp,
  pgEnum,
  json,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const managerStatusEnum = pgEnum("manager_status", [
  "pending",
  "verified",
  "rejected",
]);

export const managersTable = pgTable("managers", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  managerEmail: text("manager_email").notNull(),
  managerName: text("manager_name").notNull(),
  managerPhone: text("manager_phone"),
  ownerEmail: text("owner_email").notNull(),
  ownerPhone: text("owner_phone"),
  permissions: json("permissions").$type<string[]>().notNull().default([
    "view_properties",
    "manage_requests",
    "message_tenants",
  ]),
  assignedProperties: json("assigned_properties")
    .$type<number[]>()
    .notNull()
    .default([]),
  status: managerStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertManagerSchema = createInsertSchema(managersTable).omit({
  id: true,
  status: true,
  createdAt: true,
});
export type InsertManager = z.infer<typeof insertManagerSchema>;
export type Manager = typeof managersTable.$inferSelect;
