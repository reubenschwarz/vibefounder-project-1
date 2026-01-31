import { describe, it, expect, beforeAll, vi } from "vitest";
import { sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import * as schema from "@/lib/db/schema";

vi.mock("@/lib/db", async () => {
  const Database = await import("better-sqlite3");
  const { drizzle } = await import("drizzle-orm/better-sqlite3");
  const s = await import("@/lib/db/schema");

  const sqlite = new Database.default(":memory:");
  sqlite.pragma("journal_mode = WAL");
  const db = drizzle(sqlite, { schema: s });

  db.run(sql`CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    export_token TEXT NOT NULL UNIQUE,
    current_state TEXT NOT NULL DEFAULT 'S0',
    created_at INTEGER NOT NULL,
    expires_at INTEGER
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS cvp_inputs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL REFERENCES sessions(id),
    for_who TEXT,
    in_situation TEXT,
    struggles_with TEXT,
    current_workaround TEXT,
    we_offer TEXT,
    so_they_get TEXT,
    unlike TEXT,
    because TEXT
  )`);

  return { db };
});

import {
  GET as getCvp,
  PUT as putCvp,
} from "@/app/api/s/[sessionId]/cvp/route";

const { db: testDb } = await import("@/lib/db");

function makeParams(sessionId: string) {
  return { params: Promise.resolve({ sessionId }) };
}

function makePut(body: object): NextRequest {
  return new NextRequest("http://localhost", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const TEST_SESSION_ID = "cvp-test-session";

beforeAll(() => {
  testDb
    .insert(schema.sessions)
    .values({
      id: TEST_SESSION_ID,
      exportToken: "cvp-test-export-token-12345678",
      currentState: "S1",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000),
    })
    .run();
});

describe("GET /api/s/[sessionId]/cvp", () => {
  it("returns empty fields for a session with no CVP data", async () => {
    const req = new NextRequest("http://localhost");
    const res = await getCvp(req, makeParams(TEST_SESSION_ID));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.forWho).toBe("");
    expect(data.inSituation).toBe("");
    expect(data.because).toBe("");
  });

  it("returns 404 for non-existent session", async () => {
    const req = new NextRequest("http://localhost");
    const res = await getCvp(req, makeParams("nonexistent"));
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/s/[sessionId]/cvp", () => {
  it("saves CVP data and returns it", async () => {
    const body = {
      forWho: "Early-stage founders",
      inSituation: "trying to validate their idea",
      strugglesWith: "knowing if the problem is real",
      currentWorkaround: "asking friends and family",
      weOffer: "structured hypothesis testing",
      soTheyGet: "confidence in their direction",
      unlike: "generic business plan tools",
      because: "we use evidence-based methods",
    };

    const req = makePut(body);
    const res = await putCvp(req, makeParams(TEST_SESSION_ID));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.forWho).toBe("Early-stage founders");
    expect(data.because).toBe("we use evidence-based methods");
  });

  it("retrieves saved data on GET", async () => {
    const req = new NextRequest("http://localhost");
    const res = await getCvp(req, makeParams(TEST_SESSION_ID));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.forWho).toBe("Early-stage founders");
  });

  it("updates existing CVP data", async () => {
    const body = {
      forWho: "Technical co-founders",
    };

    const req = makePut(body);
    const res = await putCvp(req, makeParams(TEST_SESSION_ID));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.forWho).toBe("Technical co-founders");
  });

  it("rejects data exceeding word limit", async () => {
    const tooManyWords = Array(20).fill("word").join(" ");
    const req = makePut({ forWho: tooManyWords });
    const res = await putCvp(req, makeParams(TEST_SESSION_ID));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Validation failed");
  });

  it("returns 404 for non-existent session", async () => {
    const req = makePut({ forWho: "test" });
    const res = await putCvp(req, makeParams("nonexistent"));
    expect(res.status).toBe(404);
  });
});
