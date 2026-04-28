import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { propertiesTable } from "./properties";

export const favoritesTable = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  propertyId: integer("property_id")
    .notNull()
    .references(() => propertiesTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Favorite = typeof favoritesTable.$inferSelect;
