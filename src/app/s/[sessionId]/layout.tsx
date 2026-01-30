import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { SessionProvider } from "@/components/shared/session-provider";
import { StateGuard } from "@/components/shared/state-guard";
import type { SessionState } from "@/lib/schemas/session";

export default async function SessionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
  });

  if (!session) {
    notFound();
  }

  if (session.expiresAt && session.expiresAt < new Date()) {
    notFound();
  }

  return (
    <SessionProvider
      session={{
        id: session.id,
        exportToken: session.exportToken,
        currentState: session.currentState as SessionState,
      }}
    >
      <StateGuard>
        <div className="min-h-screen">{children}</div>
      </StateGuard>
    </SessionProvider>
  );
}
