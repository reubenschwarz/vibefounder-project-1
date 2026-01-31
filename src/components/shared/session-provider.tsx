"use client";

import { createContext, useContext } from "react";
import type { SessionState } from "@/lib/schemas/session";

export interface SessionData {
  id: string;
  exportToken: string;
  currentState: SessionState;
}

const SessionContext = createContext<SessionData | null>(null);

export function SessionProvider({
  session,
  children,
}: {
  session: SessionData;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext(): SessionData {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSessionContext must be used within SessionProvider");
  return ctx;
}
