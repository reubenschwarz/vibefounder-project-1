"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { SessionState } from "@/lib/schemas/session";
import { useSessionContext } from "./session-provider";

const STATE_ROUTES: Record<SessionState, string> = {
  S0: "/session/new",
  S1: "inputs",
  S2: "clarifiers",
  S3: "hypotheses",
  S4: "research",
  S5: "persona",
  S6: "report",
};

export function StateGuard({ children }: { children: React.ReactNode }) {
  const session = useSessionContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const expected = STATE_ROUTES[session.currentState];
    if (expected && !pathname.endsWith(expected)) {
      router.replace(`/s/${session.id}/${expected}`);
    }
  }, [session, pathname, router]);

  return <>{children}</>;
}
