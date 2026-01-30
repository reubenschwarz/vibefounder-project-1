import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import type { JobType } from "./queue";
import { analyzeInputs } from "./handlers/analyze-inputs";
import { generateHypotheses } from "./handlers/generate-hypotheses";
import { runDesktopResearch } from "./handlers/run-desktop-research";
import { generatePersonaPack } from "./handlers/generate-persona-pack";
import { extractChatInsights } from "./handlers/extract-chat-insights";
import { assemblePsfReport } from "./handlers/assemble-psf-report";

const handlers: Record<JobType, (sessionId: string) => Promise<void>> = {
  analyze_inputs: analyzeInputs,
  generate_hypotheses: generateHypotheses,
  run_desktop_research: runDesktopResearch,
  generate_persona_pack: generatePersonaPack,
  extract_chat_insights: extractChatInsights,
  assemble_psf_report: assemblePsfReport,
};

export async function processJob(jobId: string): Promise<void> {
  const job = db.select().from(jobs).where(eq(jobs.id, jobId)).get();
  if (!job) return;

  const handler = handlers[job.type as JobType];
  if (!handler) {
    db.update(jobs)
      .set({ status: "failed", error: `Unknown job type: ${job.type}` })
      .where(eq(jobs.id, jobId))
      .run();
    return;
  }

  const now = new Date();
  db.update(jobs)
    .set({ status: "running", startedAt: now })
    .where(eq(jobs.id, jobId))
    .run();

  try {
    await handler(job.sessionId);
    db.update(jobs)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(jobs.id, jobId))
      .run();
  } catch (err) {
    db.update(jobs)
      .set({
        status: "failed",
        error: err instanceof Error ? err.message : String(err),
        completedAt: new Date(),
      })
      .where(eq(jobs.id, jobId))
      .run();
  }
}
