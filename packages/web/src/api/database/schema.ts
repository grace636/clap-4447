import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const counters = sqliteTable("counters", {
  id: text("id").primaryKey(),
  count: integer("count").notNull().default(0),
});
