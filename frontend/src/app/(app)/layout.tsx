"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserSidebar } from "@/src/components/layout/UserSidebar";
import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { notificationApi } from "@/src/features/notifications/api/notification.api";
import { PAGE_BG } from "@/src/lib/constants";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status, isReady } = useAuthReady();
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!isReady) return;

    notificationApi
      .getUnreadCount()
      .then((res) => setUnreadCount(res.data.data.unread_count))
      .catch(() => setUnreadCount(0));
  }, [isReady]);

  if (status === "loading" || !isReady || loading) {
    return (
      <section
        className="flex min-h-screen items-center justify-center"
        style={{ background: PAGE_BG }}
      >
        <section className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </section>
    );
  }

  return (
    <section className="min-h-screen" style={{ background: PAGE_BG }}>
      <UserSidebar user={user} unreadCount={unreadCount} />
      <main className="ml-[260px] min-h-screen p-6 lg:p-8">{children}</main>
    </section>
  );
}
