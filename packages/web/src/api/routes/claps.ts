import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import { counters } from "../database/schema";

const ID = "claps";

export const claps = {
  get: base.handler(async () => {
    const [row] = await db.select().from(counters).where(eq(counters.id, ID));
    return { count: row?.count ?? 0 };
  }),
  // Atomic: single UPSERT statement, count = count + n evaluated inside the DB.
  add: base
    .input(z.object({ n: z.number().int().min(1).max(50) }))
    .handler(async ({ input }) => {
      const [row] = await db
        .insert(counters)
        .values({ id: ID, count: input.n })
        .onConflictDoUpdate({
          target: counters.id,
          set: { count: sql`${counters.count} + ${input.n}` },
        })
        .returning({ count: counters.count });
      return { count: row.count };
    }),
};
