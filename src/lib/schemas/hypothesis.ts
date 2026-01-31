import { z } from "zod/v4";

export const HypothesisDomain = z.enum([
  "segment_reachability",
  "pain_severity_frequency",
  "workaround_inadequacy",
  "buyer_payment",
  "adoption_switching",
]);
export type HypothesisDomain = z.infer<typeof HypothesisDomain>;

export const EvidenceStatus = z.enum([
  "unknown",
  "supported",
  "weakened",
  "contradicted",
]);
export type EvidenceStatus = z.infer<typeof EvidenceStatus>;

export const Confidence = z.enum(["low", "med", "high"]);
export type Confidence = z.infer<typeof Confidence>;

export const HypothesisSchema = z.object({
  id: z.string(),
  domain: HypothesisDomain,
  segment: z.string(),
  context: z.string(),
  claim: z.string(),
  measure: z.string(),
  disproof: z.string(),
  evidenceSources: z.array(z.string()).default([]),
  status: EvidenceStatus.default("unknown"),
  confidence: Confidence.default("low"),
  rationale: z.string().optional(),
  isActive: z.boolean().default(false),
  isLocked: z.boolean().default(false),
});
export type Hypothesis = z.infer<typeof HypothesisSchema>;
