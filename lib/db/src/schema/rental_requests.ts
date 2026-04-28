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

export const rentalRequestStatusEnum = pgEnum("rental_request_status", [
  "pending",
  "in_review",
  "awaiting_documents",
  "approved",
  "rejected",
]);

export const rentalRequestsTable = pgTable("rental_requests", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id")
    .notNull()
    .references(() => propertiesTable.id),
  userId: text("user_id").notNull(),
  status: rentalRequestStatusEnum("status").notNull().default("pending"),
  message: text("message").notNull(),
  applicantName: text("applicant_name").notNull(),
  applicantEmail: text("applicant_email").notNull(),
  applicantPhone: text("applicant_phone"),
  statusNote: text("status_note"),
  conversationEnded: integer("conversation_ended").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertRentalRequestSchema = createInsertSchema(
  rentalRequestsTable,
).omit({
  id: true,
  status: true,
  conversationEnded: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertRentalRequest = z.infer<typeof insertRentalRequestSchema>;
export type RentalRequest = typeof rentalRequestsTable.$inferSelect;
