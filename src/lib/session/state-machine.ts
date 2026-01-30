import type { SessionState } from "@/lib/schemas/session";

/**
 * Valid state transitions for the PSF session flow.
 * S0 (Start) → S1 (Inputs) → S2 (Clarifiers) → S3 (Hypotheses)
 * → S4 (Research) → S5 (Persona) → S6 (Report)
 *
 * S2 may be skipped (S1 → S3) when no blocking clarifiers are needed.
 */
const VALID_TRANSITIONS: Record<SessionState, SessionState[]> = {
  S0: ["S1"],
  S1: ["S2", "S3"], // S2 skip allowed when no clarifiers needed
  S2: ["S3"],
  S3: ["S4"],
  S4: ["S5"],
  S5: ["S6"],
  S6: [],
};

export function canTransition(
  from: SessionState,
  to: SessionState,
): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export function getNextStates(state: SessionState): SessionState[] {
  return VALID_TRANSITIONS[state];
}

export class InvalidTransitionError extends Error {
  constructor(from: SessionState, to: SessionState) {
    super(`Invalid state transition: ${from} → ${to}`);
    this.name = "InvalidTransitionError";
  }
}

export function assertTransition(
  from: SessionState,
  to: SessionState,
): void {
  if (!canTransition(from, to)) {
    throw new InvalidTransitionError(from, to);
  }
}
