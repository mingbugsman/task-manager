"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/src/components/layout/AdminSidebar";
import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { PAGE_BG } from "@/src/lib/constants";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session, status, isReady } = useAuthReady();
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (isReady && !session?.isAdmin) {
      router.replace("/dashboard");
    }
  }, [status, isReady, session, router]);

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

  if (!session?.isAdmin) return null;

  return (
    <section className="min-h-screen" style={{ background: PAGE_BG }}>
      <AdminSidebar user={user} />
      <main className="ml-[260px] min-h-screen p-6 lg:p-8">{children}</main>
    </section>
  );
}
