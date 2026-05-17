import { pool } from "@workspace/db";
import { logger } from "./logger";

const COLIVING_ROOMS: Record<number, { number: number; price: number; status: string; availableFrom: string | null }[]> = {
  25: [
    { number: 1, price: 850, status: "rented", availableFrom: null },
    { number: 2, price: 875, status: "available", availableFrom: "2026-06-01" },
    { number: 3, price: 875, status: "available", availableFrom: "2026-05-15" },
    { number: 4, price: 900, status: "soon", availableFrom: "2026-07-15" },
  ],
  26: [
    { number: 1, price: 780, status: "rented", availableFrom: null },
    { number: 2, price: 800, status: "available", availableFrom: "2026-06-01" },
    { number: 3, price: 820, status: "available", availableFrom: "2026-06-01" },
  ],
  27: [
    { number: 1, price: 650, status: "rented", availableFrom: null },
    { number: 2, price: 650, status: "rented", availableFrom: null },
    { number: 3, price: 675, status: "available", availableFrom: "2026-05-15" },
    { number: 4, price: 675, status: "available", availableFrom: "2026-06-01" },
    { number: 5, price: 700, status: "soon", availableFrom: "2026-08-01" },
  ],
  28: [
    { number: 1, price: 1100, status: "rented", availableFrom: null },
    { number: 2, price: 1100, status: "available", availableFrom: "2026-06-01" },
    { number: 3, price: 1150, status: "available", availableFrom: "2026-06-15" },
    { number: 4, price: 1200, status: "soon", availableFrom: "2026-07-01" },
  ],
  29: [
    { number: 1, price: 750, status: "rented", availableFrom: null },
    { number: 2, price: 770, status: "available", availableFrom: "2026-06-01" },
    { number: 3, price: 790, status: "available", availableFrom: "2026-05-20" },
  ],
};

async function addColumnIfMissing(client: any, column: string, definition: string) {
  const res = await client.query(
    `SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = $1`,
    [column]
  );
  if (res.rowCount === 0) {
    logger.info(`Adding '${column}' column to properties table…`);
    await client.query(`ALTER TABLE properties ADD COLUMN ${column} ${definition}`);
    logger.info(`'${column}' column added.`);
  }
}

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    /* ── pro_otp table ─────────────────────────────────────── */
    await client.query(`
      CREATE TABLE IF NOT EXISTS pro_otp (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        phone TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    /* ── subscriptions: stripe columns ────────────────────── */
    const subStripeCols: [string, string][] = [
      ["stripe_customer_id",     "text"],
      ["stripe_subscription_id", "text"],
    ];
    for (const [col, def] of subStripeCols) {
      const check = await client.query(
        `SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = $1`,
        [col]
      );
      if (check.rowCount === 0) {
        logger.info(`Adding '${col}' column to subscriptions table…`);
        await client.query(`ALTER TABLE subscriptions ADD COLUMN ${col} ${def}`);
      }
    }

    /* ── new profile columns ───────────────────────────────── */
    const profileCols: [string, string][] = [
      ["pro_email",            "text"],
      ["residential_address",  "text"],
    ];
    for (const [col, def] of profileCols) {
      const check = await client.query(
        `SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = $1`,
        [col]
      );
      if (check.rowCount === 0) {
        logger.info(`Adding '${col}' column to profiles table…`);
        await client.query(`ALTER TABLE profiles ADD COLUMN ${col} ${def}`);
      }
    }
    await addColumnIfMissing(client, "rooms",               "jsonb NOT NULL DEFAULT '[]'::jsonb");
    await addColumnIfMissing(client, "floor",               "integer");
    await addColumnIfMissing(client, "floor_plan",          "text");
    await addColumnIfMissing(client, "nearby_places",       "jsonb NOT NULL DEFAULT '[]'::jsonb");
    await addColumnIfMissing(client, "apartment_number",    "text");
    await addColumnIfMissing(client, "building_floors",     "integer");
    await addColumnIfMissing(client, "housing_aid_eligible","boolean NOT NULL DEFAULT false");
    await addColumnIfMissing(client, "dpe_class",           "text");
    await addColumnIfMissing(client, "dpe_annual_cost_min", "integer");
    await addColumnIfMissing(client, "dpe_annual_cost_max", "integer");
    await addColumnIfMissing(client, "attachments",         "jsonb NOT NULL DEFAULT '[]'::jsonb");
    await addColumnIfMissing(client, "move_in_date",        "text");
    await addColumnIfMissing(client, "rental_offer",        "text");

    /* ── Remove 'industrial' from property_type enum ───────────────────── */
    const industrialExists = await client.query(`
      SELECT 1 FROM pg_enum
      WHERE enumlabel = 'industrial'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'property_type')
    `);
    if (industrialExists.rowCount && industrialExists.rowCount > 0) {
      logger.info("Removing 'industrial' from property_type enum…");
      await client.query(`UPDATE properties SET type = 'commercial' WHERE type = 'industrial'`);
      await client.query(`ALTER TYPE property_type RENAME TO property_type_old`);
      await client.query(`CREATE TYPE property_type AS ENUM ('house', 'apartment', 'co-living', 'commercial', 'office')`);
      await client.query(`ALTER TABLE properties ALTER COLUMN type TYPE property_type USING type::text::property_type`);
      await client.query(`DROP TYPE property_type_old`);
      logger.info("'industrial' enum value removed.");
    }

    const colivingRes = await client.query(
      `SELECT id FROM properties WHERE type = 'co-living' AND (rooms IS NULL OR rooms::text = '[]') AND id = ANY($1)`,
      [Object.keys(COLIVING_ROOMS).map(Number)]
    );

    if (colivingRes.rowCount && colivingRes.rowCount > 0) {
      logger.info({ count: colivingRes.rowCount }, "Seeding rooms for co-living properties…");
      for (const row of colivingRes.rows) {
        const id = row.id as number;
        const rooms = COLIVING_ROOMS[id];
        if (!rooms) continue;
        await client.query(
          `UPDATE properties SET rooms = $1::jsonb, bedrooms = $2 WHERE id = $3`,
          [JSON.stringify(rooms), rooms.length, id]
        );
      }
      logger.info("Co-living rooms seeded.");
    }
  } catch (err) {
    logger.error({ err }, "Migration error");
  } finally {
    client.release();
  }
}
