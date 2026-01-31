import { describe, it, expect } from "vitest";
import {
  canTransition,
  getNextStates,
  assertTransition,
  InvalidTransitionError,
} from "../state-machine";

describe("canTransition", () => {
  it("allows S0 → S1", () => {
    expect(canTransition("S0", "S1")).toBe(true);
  });

  it("allows S1 → S2 (clarifiers needed)", () => {
    expect(canTransition("S1", "S2")).toBe(true);
  });

  it("allows S1 → S3 (skip clarifiers)", () => {
    expect(canTransition("S1", "S3")).toBe(true);
  });

  it("allows sequential S2 → S3 → S4 → S5 → S6", () => {
    expect(canTransition("S2", "S3")).toBe(true);
    expect(canTransition("S3", "S4")).toBe(true);
    expect(canTransition("S4", "S5")).toBe(true);
    expect(canTransition("S5", "S6")).toBe(true);
  });

  it("rejects backward transitions", () => {
    expect(canTransition("S3", "S1")).toBe(false);
    expect(canTransition("S6", "S0")).toBe(false);
    expect(canTransition("S4", "S2")).toBe(false);
  });

  it("rejects skipping states (except S1 → S3)", () => {
    expect(canTransition("S0", "S2")).toBe(false);
    expect(canTransition("S2", "S4")).toBe(false);
    expect(canTransition("S3", "S5")).toBe(false);
  });

  it("rejects transitions from terminal state S6", () => {
    expect(canTransition("S6", "S0")).toBe(false);
    expect(canTransition("S6", "S1")).toBe(false);
    expect(canTransition("S6", "S6")).toBe(false);
  });

  it("rejects self-transitions", () => {
    expect(canTransition("S0", "S0")).toBe(false);
    expect(canTransition("S3", "S3")).toBe(false);
  });
});

describe("getNextStates", () => {
  it("returns [S1] for S0", () => {
    expect(getNextStates("S0")).toEqual(["S1"]);
  });

  it("returns [S2, S3] for S1 (clarifier skip)", () => {
    expect(getNextStates("S1")).toEqual(["S2", "S3"]);
  });

  it("returns [] for terminal S6", () => {
    expect(getNextStates("S6")).toEqual([]);
  });
});

describe("assertTransition", () => {
  it("does not throw for valid transitions", () => {
    expect(() => assertTransition("S0", "S1")).not.toThrow();
    expect(() => assertTransition("S1", "S3")).not.toThrow();
  });

  it("throws InvalidTransitionError for invalid transitions", () => {
    expect(() => assertTransition("S0", "S3")).toThrow(InvalidTransitionError);
    expect(() => assertTransition("S6", "S0")).toThrow(InvalidTransitionError);
  });

  it("includes from/to in error message", () => {
    expect(() => assertTransition("S3", "S0")).toThrow(
      "Invalid state transition: S3 → S0",
    );
  });
});
