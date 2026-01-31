import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { processJob } from "./runner";

export type JobType =
  | "analyze_inputs"
  | "generate_hypotheses"
  | "run_desktop_research"
  | "generate_persona_pack"
  | "extract_chat_insights"
  | "assemble_psf_report";

export async function enqueueJob(
  sessionId: string,
  type: JobType
): Promise<string> {
  const id = nanoid();
  const now = new Date();
  db.insert(jobs)
    .values({ id, sessionId, type, status: "queued", createdAt: now })
    .run();

  // Fire-and-forget — process in background
  void processJob(id);

  return id;
}
