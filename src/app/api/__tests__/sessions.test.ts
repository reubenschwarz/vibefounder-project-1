import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import * as schema from "@/lib/db/schema";

// Mock @/lib/db with an in-memory SQLite database.
// The factory runs in isolation so we inline the setup.
vi.mock("@/lib/db", async () => {
  const Database = await import("better-sqlite3");
  const { drizzle } = await import("drizzle-orm/better-sqlite3");
  const s = await import("@/lib/db/schema");

  const sqlite = new Database.default(":memory:");
  sqlite.pragma("journal_mode = WAL");
  const db = drizzle(sqlite, { schema: s });

  // Create the sessions table.
  db.run(sql`CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    export_token TEXT NOT NULL UNIQUE,
    current_state TEXT NOT NULL DEFAULT 'S0',
    created_at INTEGER NOT NULL,
    expires_at INTEGER
  )`);

  return { db };
});

// Import route handlers — they'll use the mocked db.
import { POST as createSession } from "@/app/api/sessions/route";
import {
  GET as getSession,
  PATCH as patchSession,
} from "@/app/api/s/[sessionId]/route";

// Also import the mocked db so we can insert test fixtures directly.
const { db: testDb } = await import("@/lib/db");

function makeParams(sessionId: string) {
  return { params: Promise.resolve({ sessionId }) };
}

function makeRequest(body: object): NextRequest {
  return new NextRequest("http://localhost", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/sessions", () => {
  it("creates a session and returns 201 with sessionId + exportToken", async () => {
    const res = await createSession();
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.sessionId).toBeDefined();
    expect(typeof data.sessionId).toBe("string");
    expect(data.exportToken).toBeDefined();
    expect(typeof data.exportToken).toBe("string");
    expect(data.exportToken.length).toBe(32);
  });

  it("creates sessions with unique IDs", async () => {
    const res1 = await createSession();
    const res2 = await createSession();
    const d1 = await res1.json();
    const d2 = await res2.json();
    expect(d1.sessionId).not.toBe(d2.sessionId);
    expect(d1.exportToken).not.toBe(d2.exportToken);
  });
});

describe("GET /api/s/[sessionId]", () => {
  let sessionId: string;

  beforeAll(async () => {
    const res = await createSession();
    const data = await res.json();
    sessionId = data.sessionId;
  });

  it("returns session data for a valid session", async () => {
    const req = new NextRequest("http://localhost");
    const res = await getSession(req, makeParams(sessionId));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe(sessionId);
    expect(data.currentState).toBe("S0");
    expect(data.exportToken).toBeDefined();
    expect(data.createdAt).toBeDefined();
    expect(data.expiresAt).toBeDefined();
  });

  it("returns 404 for non-existent session", async () => {
    const req = new NextRequest("http://localhost");
    const res = await getSession(req, makeParams("nonexistent-id"));
    expect(res.status).toBe(404);
  });

  it("returns 410 for expired session", async () => {
    const expiredId = "expired-test-session";
    const past = new Date(Date.now() - 86400000);
    testDb.insert(schema.sessions).values({
      id: expiredId,
      exportToken: "expired-token-unique-12345678901",
      currentState: "S0",
      createdAt: past,
      expiresAt: past,
    }).run();

    const req = new NextRequest("http://localhost");
    const res = await getSession(req, makeParams(expiredId));
    expect(res.status).toBe(410);
  });
});

describe("PATCH /api/s/[sessionId] (state transitions)", () => {
  let sessionId: string;

  beforeEach(async () => {
    const res = await createSession();
    const data = await res.json();
    sessionId = data.sessionId;
  });

  it("transitions S0 → S1", async () => {
    const req = makeRequest({ targetState: "S1" });
    const res = await patchSession(req , makeParams(sessionId));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.previousState).toBe("S0");
    expect(data.currentState).toBe("S1");
  });

  it("rejects invalid transition S0 → S3 with 409", async () => {
    const req = makeRequest({ targetState: "S3" });
    const res = await patchSession(req , makeParams(sessionId));
    expect(res.status).toBe(409);
  });

  it("rejects invalid body with 400", async () => {
    const req = makeRequest({ targetState: "INVALID" });
    const res = await patchSession(req , makeParams(sessionId));
    expect(res.status).toBe(400);
  });

  it("returns 404 for non-existent session", async () => {
    const req = makeRequest({ targetState: "S1" });
    const res = await patchSession(req , makeParams("no-such-session"));
    expect(res.status).toBe(404);
  });

  it("allows full valid path S0→S1→S2→S3→S4→S5→S6", async () => {
    const transitions = ["S1", "S2", "S3", "S4", "S5", "S6"];
    for (const target of transitions) {
      const req = makeRequest({ targetState: target });
      const res = await patchSession(req , makeParams(sessionId));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.currentState).toBe(target);
    }
  });

  it("allows skip path S0→S1→S3 (skip clarifiers)", async () => {
    const req1 = makeRequest({ targetState: "S1" });
    await patchSession(req1 , makeParams(sessionId));

    const req2 = makeRequest({ targetState: "S3" });
    const res = await patchSession(req2 , makeParams(sessionId));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.currentState).toBe("S3");
  });

  it("rejects backward transition with 409", async () => {
    const req1 = makeRequest({ targetState: "S1" });
    await patchSession(req1 , makeParams(sessionId));

    const req2 = makeRequest({ targetState: "S0" });
    const res = await patchSession(req2 , makeParams(sessionId));
    expect(res.status).toBe(409);
  });

  it("returns 410 for expired session on PATCH", async () => {
    const expiredId = "expired-patch-test";
    const past = new Date(Date.now() - 86400000);
    testDb.insert(schema.sessions).values({
      id: expiredId,
      exportToken: "expired-patch-token-123456789012",
      currentState: "S0",
      createdAt: past,
      expiresAt: past,
    }).run();

    const req = makeRequest({ targetState: "S1" });
    const res = await patchSession(req , makeParams(expiredId));
    expect(res.status).toBe(410);
  });
});
