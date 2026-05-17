import {
  pgTable,
  serial,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  pgEnum,
  json,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const propertyTypeEnum = pgEnum("property_type", [
  "house",
  "apartment",
  "co-living",
  "commercial",
  "office",
]);

export const propertyStatusEnum = pgEnum("property_status", [
  "available",
  "rented",
  "unavailable",
]);

export const propertiesTable = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: propertyTypeEnum("type").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull().default("Canada"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  area: numeric("area", { precision: 10, scale: 2 }),
  images: json("images").$type<string[]>().notNull().default([]),
  virtualTourUrl: text("virtual_tour_url"),
  status: propertyStatusEnum("status").notNull().default("available"),
  isFeatured: boolean("is_featured").notNull().default(false),
  views: integer("views").notNull().default(0),
  amenities: json("amenities").$type<string[]>().notNull().default([]),
  availableDates: json("available_dates").$type<string[]>().notNull().default([]),
  rooms: json("rooms").$type<Array<{
    number: number;
    price: number | null;
    status: "available" | "rented" | "soon";
    availableFrom?: string;
  }>>().notNull().default([]),
  floor: integer("floor"),
  floorPlan: text("floor_plan"),
  nearbyPlaces: json("nearby_places").$type<string[]>().notNull().default([]),
  /* ── New fields ── */
  apartmentNumber: text("apartment_number"),
  buildingFloors: integer("building_floors"),
  housingAidEligible: boolean("housing_aid_eligible").notNull().default(false),
  dpeClass: text("dpe_class"),
  dpeAnnualCostMin: integer("dpe_annual_cost_min"),
  dpeAnnualCostMax: integer("dpe_annual_cost_max"),
  attachments: json("attachments").$type<Array<{ name: string; url: string }>>().notNull().default([]),
  moveInDate: text("move_in_date"),
  rentalOffer: text("rental_offer"),
  ownerId: text("owner_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPropertySchema = createInsertSchema(propertiesTable).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof propertiesTable.$inferSelect;
