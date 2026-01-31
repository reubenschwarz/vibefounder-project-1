import { z } from "zod/v4";

export const SessionState = z.enum(["S0", "S1", "S2", "S3", "S4", "S5", "S6"]);
export type SessionState = z.infer<typeof SessionState>;

function wordCount(s: string): number {
  return s.trim() === "" ? 0 : s.trim().split(/\s+/).length;
}

function wordLimited(max: number) {
  return z
    .string()
    .refine((v) => wordCount(v) <= max, {
      message: `Must be ${max} words or fewer`,
    })
    .optional();
}

export const CVP_WORD_LIMITS = {
  forWho: 15,
  inSituation: 25,
  strugglesWith: 25,
  currentWorkaround: 25,
  weOffer: 25,
  soTheyGet: 25,
  unlike: 25,
  because: 25,
} as const;

export const CvpFields = z.object({
  forWho: wordLimited(CVP_WORD_LIMITS.forWho),
  inSituation: wordLimited(CVP_WORD_LIMITS.inSituation),
  strugglesWith: wordLimited(CVP_WORD_LIMITS.strugglesWith),
  currentWorkaround: wordLimited(CVP_WORD_LIMITS.currentWorkaround),
  weOffer: wordLimited(CVP_WORD_LIMITS.weOffer),
  soTheyGet: wordLimited(CVP_WORD_LIMITS.soTheyGet),
  unlike: wordLimited(CVP_WORD_LIMITS.unlike),
  because: wordLimited(CVP_WORD_LIMITS.because),
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
