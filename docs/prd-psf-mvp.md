# Vibe-Founding Tool — PSF Module (MVP) PRD

## Goal
Turn an early founder’s CVP + 30–45s pitch into a small set of **PSF hypotheses** plus **how to test them**, using:
1) structured clarification (minimal),
2) desktop research with citations (plausibility + refinement),
3) one lifelike persona chat (practice + constraint discovery),
4) an exportable PSF report.

This MVP is **single session + export link** (no accounts).

## Non-goals (MVP)
- Multi-idea comparison/pipeline
- Multiple personas per session
- Guided interview mode (only free chat)
- “Validated” claims; the tool never asserts real-world validation
- Full workshop features

---

## Primary user flow (state machine)
**S0 Start**
- Create `session_id` + `export_token`

**S1 Inputs**
1) CVP form (8 fields, word-limited)
2) Pitch record + transcription + transcript edit
→ Run: `analyze_inputs`

**S2 Blocking clarifiers (only if needed)**
- Ask up to 5 blocking questions across fixed categories:
  1. Customer specificity (For)
  2. Trigger context (In situation)
  3. Problem + consequence (Struggles)
  4. Current workaround (Workaround)
  5. Outcome/value (So they get)
→ User answers (1–2 sentences each)
→ Run: `re_analyze_inputs` (if any blockers answered)

**S3 Hypotheses**
- Generate Hypothesis Pool (~30), auto-select Active 5 (one per domain)
Domains (always cover):
1) Segment reachability
2) Pain severity/frequency
3) Workaround inadequacy
4) Buyer/payment path
5) Adoption/switching constraints
- User can swap/edit/lock hypotheses
- Show inferred wedge/ICP with **Edit Override** (segment/context/buyer-user)
→ Run (after user confirms or edits wedge): `start_research`

**S4 Desktop research (≤5 min)**
- Parallel jobs:
  - segment language + where-to-find channels
  - alternative/workaround mapping
  - constraints + buying/process realities
- For each Active 5 hypothesis, update status:
  - `supported | weakened | contradicted | unknown`
- Auto-replace any `contradicted` hypothesis if not locked (from pool); user can override.
Citations visible in UI.

**S5 Persona pack + free chat (1 persona)**
- Generate one persona pack grounded in research (+ citations)
- Free chat with persona
- Extract insights and update Active 5 statuses (conservative rules below)

**S6 Output**
- PSF Report:
  - Active 5 hypotheses + status + what would disprove
  - “What to test next with real humans”: 1 test per hypothesis with pass/fail + 2 interview questions
  - Key risks + unknowns
- Export: PDF + Markdown (Notion-ready)
- Provide shareable export link (tokenized)

---

## Screens (MVP)
### 1. CVP Input
Fields (required, word limits enforced):
- For (who)
- In situation (trigger/context)
- Who struggles with (problem + consequence)
- Current workaround
- We offer (mechanism, not features)
- So they get (measurable outcome)
- Unlike (best alternative)
- Because (why believable)

Actions:
- Save
- Continue to pitch

### 2. Pitch Input
- Record audio (30–45s cap)
- Transcribe (built-in provider)
- Transcript editor (required confirm)
Policy:
- Delete audio after transcription succeeds

Actions:
- Generate PSF hypotheses

### 3. Clarifiers (blocking)
- Show non-blocking warnings (“Vagueness report”)
- Show up to 5 blocking questions, each mapped to a fixed category

Action:
- Re-run analysis → continue

### 4. Hypotheses Manager
- Active 5 (always visible)
- Hypothesis pool (~30)
- Actions per hypothesis:
  - Swap into Active
  - Edit text
  - Lock/unlock
- Each hypothesis card shows:
  - Domain
  - Statement (rendered)
  - Disproof condition
  - Suggested evidence sources (desktop/persona/human)
  - Confidence + rationale (short)

### 5. Wedge/ICP Edit Override
Displays inferred:
- Segment (who)
- Context (trigger)
- Buyer vs user: same/different/unknown

Edit fields:
- Segment (text)
- Context (text)
- Buyer vs user (enum)

Action:
- Save override → re-run hypothesis generation + research plan

### 6. Research Progress + Results
- Progress indicators for parallel jobs
- For each hypothesis: evidence summary + citations + status
- Auto replacement suggestions for contradicted hypotheses (unless locked)

### 7. Persona Pack
- Persona summary
- KPIs/incentives
- Workflow + tool stack
- Constraints + procurement/buying realities
- Objections + switching triggers
- Language bank
- Citations list

Action:
- Start chat

### 8. Persona Chat (free chat)
- Chat UI
- Side panel: Active 5 hypotheses + suggested questions to probe

After chat:
- “Extracted insights” view (quotes, objections, buying constraints, etc.)

### 9. PSF Report + Export
- Final statuses
- Next tests (pass/fail)
- Export buttons + shareable link

---

## Core objects & schemas (internal)
### Hypothesis (stored object)
- id
- domain: `segment_reachability | pain_severity_frequency | workaround_inadequacy | buyer_payment | adoption_switching`
- segment: string
- context: string
- claim: string
- measure: string|null
- disproof: string
- evidence_sources: array[`desktop`,`persona`,`human`]
- tests: array (filled later; MVP can be generated at output time)
- status: `unknown|supported|weakened|contradicted`
- confidence: `low|med|high`
- rationale: string (short)

Rendered sentence:
> “For **{segment}** in **{context}**, **{claim}**, evidenced by **{measure}**; contradicted if **{disproof}**.”

### Artifacts (JSON payloads)
Types:
- vagueness_report
- claim_map
- hypothesis_pool
- research_brief
- persona_pack
- chat_extract
- psf_report

### Session
- session_id
- export_token
- created_at, expires_at
- current_state

### Pitch
- transcript_text
- transcript_confidence
- edited_transcript_text
(No audio persisted post-transcription)

---

## Blocking clarifier logic (deterministic)
Ask a blocker question only when the corresponding CVP/pitch content is missing/too vague.

Categories and detection heuristics (MVP-level):
1) Customer specificity: “For” is generic (“everyone”, “SMBs”, “people”) without role/segment.
2) Trigger context: “In situation” missing or generic (“when they need it”).
3) Problem+consequence: “Struggles” lacks consequence (“hard”, “inefficient” without impact).
4) Workaround: missing or “they do nothing” without explanation.
5) Outcome/value: “So they get” not measurable or purely aspirational.

Cap total blockers at 5.

---

## Evidence status update rules (conservative)
### Desktop research
- `contradicted` only when strong, general constraints conflict with the claim (e.g., infeasible buyer set, clear regulatory impossibility, “already solved free” + negligible switching).
- Otherwise prefer `unknown|weakened|supported`.

### Persona chat
- Treat as simulated plausibility + practice.
- `contradicted` only if persona pack includes hard constraints that directly negate the claim.
- Otherwise use `weakened|unknown|supported`.

---

## Background jobs (async, parallel)
Required jobs:
1) `analyze_inputs(session_id)` → vagueness_report, claim_map
2) `generate_hypotheses(session_id)` → hypothesis_pool + Active 5 suggestion
3) `run_desktop_research(session_id, wedge_override)` → research_brief (with citations) + per-hypothesis updates
4) `generate_persona_pack(session_id)` → persona_pack (with citations)
5) `extract_chat_insights(session_id)` → chat_extract + updates
6) `assemble_psf_report(session_id)` → psf_report + export payloads

Target time:
- Research + persona pack ready ≤ 5 minutes.

---

## Exports
- PDF (one-page PSF report)
- Markdown (Notion-ready)
Export link:
- Tokenized URL referencing stored export snapshot
- Optional expiry (e.g., 7–30 days)

---

## Acceptance criteria (MVP)
1) User can complete session end-to-end without accounts and download/export report.
2) Tool asks **no more than 5 blocking questions**, each mapped to the fixed categories.
3) Tool always maintains **Active 5 hypotheses** covering the five domains; user can swap/edit/lock.
4) Desktop research results show **visible citations** for claims.
5) Persona pack is generated and one chat can be conducted; insights extracted into structured outputs.
6) Final report lists:
   - Active 5 hypotheses + status + disproof
   - 1 recommended real-world test per hypothesis with pass/fail
   - 2 interview questions per hypothesis

---

## Privacy & safety
- Audio deleted after transcription.
- Clearly label persona outputs as simulation/practice, not real validation.
- Store minimal PII; encourage users not to paste sensitive customer data.
