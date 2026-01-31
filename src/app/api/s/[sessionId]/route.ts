import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { SessionState } from "@/lib/schemas/session";
import {
  assertTransition,
  InvalidTransitionError,
} from "@/lib/session/state-machine";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  const { sessionId } = await context.params;
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.expiresAt && session.expiresAt < new Date()) {
    return NextResponse.json({ error: "Session expired" }, { status: 410 });
  }

  return NextResponse.json({
    id: session.id,
    exportToken: session.exportToken,
    currentState: session.currentState,
    createdAt: session.createdAt.toISOString(),
    expiresAt: session.expiresAt?.toISOString() ?? null,
  });
}

const TransitionBody = z.object({
  targetState: SessionState,
});

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  const { sessionId } = await context.params;

  const body = await request.json();
  const parsed = TransitionBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.expiresAt && session.expiresAt < new Date()) {
    return NextResponse.json({ error: "Session expired" }, { status: 410 });
  }

  const from = session.currentState as SessionState;
  const to = parsed.data.targetState;

  try {
    assertTransition(from, to);
  } catch (err) {
    if (err instanceof InvalidTransitionError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }

  await db
    .update(sessions)
    .set({ currentState: to })
    .where(eq(sessions.id, sessionId));

  return NextResponse.json({
    id: session.id,
    previousState: from,
    currentState: to,
  });
}
