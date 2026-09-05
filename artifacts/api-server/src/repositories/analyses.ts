import { desc, eq } from "drizzle-orm";
import {
  analysesTable,
  db,
  type Analysis,
  type InsertAnalysis,
} from "@workspace/db";

type AnalysisUpdate = Partial<
  Pick<InsertAnalysis, "title" | "decision" | "objective" | "horizon">
>;

export async function listAnalyses(): Promise<Analysis[]> {
  return db
    .select()
    .from(analysesTable)
    .orderBy(desc(analysesTable.updatedAt));
}

export async function createAnalysis(
  input: InsertAnalysis,
): Promise<Analysis> {
  const [analysis] = await db
    .insert(analysesTable)
    .values(input)
    .returning();

  if (!analysis) {
    throw new Error("Analysis insert returned no record");
  }

  return analysis;
}

export async function getAnalysis(id: string): Promise<Analysis | undefined> {
  const [analysis] = await db
    .select()
    .from(analysesTable)
    .where(eq(analysesTable.id, id));

  return analysis;
}

export async function updateAnalysis(
  id: string,
  updates: AnalysisUpdate,
): Promise<Analysis | undefined> {
  const [analysis] = await db
    .update(analysesTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(analysesTable.id, id))
    .returning();

  return analysis;
}