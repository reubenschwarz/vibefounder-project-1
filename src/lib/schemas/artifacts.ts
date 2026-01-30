import { z } from "zod/v4";

export const ArtifactType = z.enum([
  "vagueness_report",
  "claim_map",
  "hypothesis_pool",
  "research_brief",
  "persona_pack",
  "chat_extract",
  "psf_report",
]);
export type ArtifactType = z.infer<typeof ArtifactType>;

export const VaguenessReport = z.object({
  issues: z.array(
    z.object({
      category: z.string(),
      field: z.string(),
      description: z.string(),
      question: z.string(),
    })
  ),
});
export type VaguenessReport = z.infer<typeof VaguenessReport>;

export const ClaimMap = z.object({
  claims: z.array(
    z.object({
      source: z.string(),
      text: z.string(),
      domain: z.string(),
    })
  ),
});
export type ClaimMap = z.infer<typeof ClaimMap>;
