import { createInsertSchema } from "drizzle-zod";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const analysisStatusEnum = pgEnum("analysis_status", [
  "draft",
  "analyzing",
  "ready",
  "failed",
]);

export const analysesTable = pgTable(
  "analyses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    decision: text("decision").notNull(),
    objective: text("objective"),
    horizon: text("horizon").notNull().default("12 months"),
    status: analysisStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("analyses_updated_at_idx").on(table.updatedAt),
    index("analyses_status_idx").on(table.status),
  ],
);

export const insertAnalysisSchema = createInsertSchema(analysesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analysesTable.$inferSelect;