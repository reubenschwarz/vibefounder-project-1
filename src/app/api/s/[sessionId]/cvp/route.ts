import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions, cvpInputs } from "@/lib/db/schema";
import { CvpFields } from "@/lib/schemas/session";

type RouteContext = { params: Promise<{ sessionId: string }> };

async function getSession(sessionId: string) {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
  });
  if (!session) return null;
  if (session.expiresAt && session.expiresAt < new Date()) return null;
  return session;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  const { sessionId } = await context.params;
  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const cvp = await db.query.cvpInputs.findFirst({
    where: eq(cvpInputs.sessionId, sessionId),
  });

  if (!cvp) {
    return NextResponse.json({
      forWho: "",
      inSituation: "",
      strugglesWith: "",
      currentWorkaround: "",
      weOffer: "",
      soTheyGet: "",
      unlike: "",
      because: "",
    });
  }

  return NextResponse.json({
    forWho: cvp.forWho ?? "",
    inSituation: cvp.inSituation ?? "",
    strugglesWith: cvp.strugglesWith ?? "",
    currentWorkaround: cvp.currentWorkaround ?? "",
    weOffer: cvp.weOffer ?? "",
    soTheyGet: cvp.soTheyGet ?? "",
    unlike: cvp.unlike ?? "",
    because: cvp.because ?? "",
  });
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  const { sessionId } = await context.params;
  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = CvpFields.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const existing = await db.query.cvpInputs.findFirst({
    where: eq(cvpInputs.sessionId, sessionId),
  });

  if (existing) {
    await db
      .update(cvpInputs)
      .set({
        forWho: data.forWho ?? null,
        inSituation: data.inSituation ?? null,
        strugglesWith: data.strugglesWith ?? null,
        currentWorkaround: data.currentWorkaround ?? null,
        weOffer: data.weOffer ?? null,
        soTheyGet: data.soTheyGet ?? null,
        unlike: data.unlike ?? null,
        because: data.because ?? null,
      })
      .where(eq(cvpInputs.sessionId, sessionId));
  } else {
    await db.insert(cvpInputs).values({
      sessionId,
      forWho: data.forWho ?? null,
      inSituation: data.inSituation ?? null,
      strugglesWith: data.strugglesWith ?? null,
      currentWorkaround: data.currentWorkaround ?? null,
      weOffer: data.weOffer ?? null,
      soTheyGet: data.soTheyGet ?? null,
      unlike: data.unlike ?? null,
      because: data.because ?? null,
    });
  }

  return NextResponse.json({
    forWho: data.forWho ?? "",
    inSituation: data.inSituation ?? "",
    strugglesWith: data.strugglesWith ?? "",
    currentWorkaround: data.currentWorkaround ?? "",
    weOffer: data.weOffer ?? "",
    soTheyGet: data.soTheyGet ?? "",
    unlike: data.unlike ?? "",
    because: data.because ?? "",
  });
}
