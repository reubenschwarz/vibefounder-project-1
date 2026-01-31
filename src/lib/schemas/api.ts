import { z } from "zod/v4";

export const CreateSessionResponse = z.object({
  sessionId: z.string(),
  exportToken: z.string(),
});
export type CreateSessionResponse = z.infer<typeof CreateSessionResponse>;

export const JobStatusResponse = z.object({
  id: z.string(),
  type: z.string(),
  status: z.enum(["queued", "running", "completed", "failed"]),
  result: z.unknown().optional(),
  error: z.string().optional(),
});
export type JobStatusResponse = z.infer<typeof JobStatusResponse>;

export const ClarifierAnswerRequest = z.object({
  answers: z.array(
    z.object({
      category: z.string(),
      answer: z.string(),
    })
  ),
});
export type ClarifierAnswerRequest = z.infer<typeof ClarifierAnswerRequest>;
