import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "cancelled",
  "past_due",
  "trialing",
]);

export const subscriptionsTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id").notNull().unique(),
  planId: text("plan_id").notNull().default("starter"),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  currentPeriodEnd: timestamp("current_period_end"),
  propertiesUsed: integer("properties_used").notNull().default(0),
  managersUsed: integer("managers_used").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Subscription = typeof subscriptionsTable.$inferSelect;
