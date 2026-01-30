import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  exportToken: text("export_token").notNull().unique(),
  currentState: text("current_state", {
    enum: ["S0", "S1", "S2", "S3", "S4", "S5", "S6"],
  })
    .notNull()
    .default("S0"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
});

export const cvpInputs = sqliteTable("cvp_inputs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id),
  forWho: text("for_who"),
  inSituation: text("in_situation"),
  strugglesWith: text("struggles_with"),
  currentWorkaround: text("current_workaround"),
  weOffer: text("we_offer"),
  soTheyGet: text("so_they_get"),
  unlike: text("unlike"),
  because: text("because"),
});

export const pitches = sqliteTable("pitches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id),
  transcriptText: text("transcript_text"),
  transcriptConfidence: real("transcript_confidence"),
  editedTranscriptText: text("edited_transcript_text"),
});

export const clarifierResponses = sqliteTable("clarifier_responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id),
  category: text("category", {
    enum: [
      "customer_specificity",
      "trigger_context",
      "problem_consequence",
      "workaround",
      "outcome_value",
    ],
  }).notNull(),
  question: text("question").notNull(),
  answer: text("answer"),
});

export const hypotheses = sqliteTable("hypotheses", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id),
  domain: text("domain", {
    enum: [
      "segment_reachability",
      "pain_severity_frequency",
      "workaround_inadequacy",
      "buyer_payment",
      "adoption_switching",
    ],
  }).notNull(),
  segment: text("segment").notNull(),
  context: text("context").notNull(),
  claim: text("claim").notNull(),
  measure: text("measure").notNull(),
  disproof: text("disproof").notNull(),
  evidenceSources: text("evidence_sources").default("[]"), // JSON array
  status: text("status", {
    enum: ["unknown", "supported", "weakened", "contradicted"],
  })
    .notNull()
    .default("unknown"),
  confidence: text("confidence", { enum: ["low", "med", "high"] })
    .notNull()
    .default("low"),
  rationale: text("rationale"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
  isLocked: integer("is_locked", { mode: "boolean" }).notNull().default(false),
  poolOrder: integer("pool_order"),
});

export const wedgeOverrides = sqliteTable("wedge_overrides", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id),
  segment: text("segment"),
  context: text("context"),
  buyerVsUser: text("buyer_vs_user", {
    enum: ["same", "different", "unknown"],
  }),
});

export const artifacts = sqliteTable("artifacts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id),
  type: text("type", {
    enum: [
      "vagueness_report",
      "claim_map",
      "hypothesis_pool",
      "research_brief",
      "persona_pack",
      "chat_extract",
      "psf_report",
    ],
  }).notNull(),
  payload: text("payload").notNull(), // JSON
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id),
  type: text("type").notNull(),
  status: text("status", {
    enum: ["queued", "running", "completed", "failed"],
  })
    .notNull()
    .default("queued"),
  result: text("result"), // JSON
  error: text("error"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  startedAt: integer("started_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const exports = sqliteTable("exports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id),
  token: text("token").notNull().unique(),
  format: text("format", { enum: ["pdf", "markdown"] }).notNull(),
  payload: text("payload").notNull(), // stored as text for now
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
});
