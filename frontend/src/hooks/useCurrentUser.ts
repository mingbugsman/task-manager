"use client";

import { useEffect, useState } from "react";
import { userApi } from "@/src/features/users/api/user.api";
import type { UserDetail } from "@/src/types/api.types";
import { useAuthReady } from "./useAuthReady";

export function useCurrentUser() {
  const { isReady } = useAuthReady();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    let cancelled = false;
    setLoading(true);

    userApi
      .getMe()
      .then((res) => {
        if (!cancelled) setUser(res.data.data);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;

    const refresh = () => {
      userApi
        .getMe()
        .then((res) => setUser(res.data.data))
        .catch(() => setUser(null));
    };

    window.addEventListener("user-profile-updated", refresh);
    return () => window.removeEventListener("user-profile-updated", refresh);
  }, [isReady]);

  return { user, loading: !isReady || loading };
}
