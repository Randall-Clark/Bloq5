import pg from "pg";

let _pool: pg.Pool | null = null;

function getLocalPool(): pg.Pool {
  if (!_pool) {
    _pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  }
  return _pool;
}

export async function findPriceIdForPlan(planId: string): Promise<string | null> {
  try {
    const pool = getLocalPool();
    const result = await pool.query(
      `SELECT pr.id as price_id
       FROM stripe.products p
       JOIN stripe.prices pr ON pr.product = p.id
       WHERE p.metadata->>'planId' = $1
         AND p.active = true
         AND pr.active = true
       ORDER BY pr.unit_amount ASC
       LIMIT 1`,
      [planId],
    );
    return (result.rows[0]?.price_id as string) ?? null;
  } catch {
    return null;
  }
}

export async function getStripeSubscriptionStatus(subscriptionId: string): Promise<string | null> {
  try {
    const pool = getLocalPool();
    const result = await pool.query(
      `SELECT status FROM stripe.subscriptions WHERE id = $1 LIMIT 1`,
      [subscriptionId],
    );
    return (result.rows[0]?.status as string) ?? null;
  } catch {
    return null;
  }
}
