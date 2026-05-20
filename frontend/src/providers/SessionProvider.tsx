"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider refetchOnWindowFocus={true} refetchInterval={4 * 60}>
      {children}
    </NextAuthSessionProvider>
  );
}
