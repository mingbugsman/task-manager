"use client";

import { useSession } from "next-auth/react";

/** Chỉ gọi API backend khi NextAuth đã có access token hợp lệ. */
export function useAuthReady() {
  const { data: session, status } = useSession();

  const isReady =
    status === "authenticated" &&
    Boolean(session?.accessToken) &&
    session?.error !== "RefreshAccessTokenError";

  return { session, status, isReady };
}
