import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";

const SESSION_EXPIRY_DAYS = 30;

export async function POST() {
  const id = nanoid();
  const exportToken = nanoid(32);
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  );

  await db.insert(sessions).values({
    id,
    exportToken,
    currentState: "S0",
    createdAt: now,
    expiresAt,
  });

  return NextResponse.json({ sessionId: id, exportToken }, { status: 201 });
}
