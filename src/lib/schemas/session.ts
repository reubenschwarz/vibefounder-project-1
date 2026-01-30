import { z } from "zod/v4";

export const SessionState = z.enum(["S0", "S1", "S2", "S3", "S4", "S5", "S6"]);
export type SessionState = z.infer<typeof SessionState>;

export const CvpFields = z.object({
  forWho: z.string().max(100).optional(),
  inSituation: z.string().max(200).optional(),
  strugglesWith: z.string().max(200).optional(),
  currentWorkaround: z.string().max(200).optional(),
  weOffer: z.string().max(200).optional(),
  soTheyGet: z.string().max(200).optional(),
  unlike: z.string().max(200).optional(),
  because: z.string().max(200).optional(),
});
export type CvpFields = z.infer<typeof CvpFields>;

export const ClarifierCategory = z.enum([
  "customer_specificity",
  "trigger_context",
  "problem_consequence",
  "workaround",
  "outcome_value",
]);
export type ClarifierCategory = z.infer<typeof ClarifierCategory>;
