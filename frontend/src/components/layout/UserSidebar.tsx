"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Settings, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { USER_NAV, NAVY_SIDEBAR } from "@/src/lib/constants";
import { NavIcon } from "./NavIcon";
import { Avatar } from "@/components/ui/avatar";
import type { UserDetail } from "@/src/types/api.types";

interface UserSidebarProps {
  user?: UserDetail | null;
  unreadCount?: number;
}

export function UserSidebar({ user, unreadCount = 0 }: UserSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.isAdmin;

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col text-white"
      style={{ background: `linear-gradient(180deg, ${NAVY_SIDEBAR} 0%, #132d4f 100%)` }}
    >
      <header className="flex items-center gap-3 border-b border-white/10 px-5 py-6">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
        >
          <Zap size={20} className="text-white" />
        </span>
        <span>
          <p className="text-sm font-bold leading-tight">TaskManager</p>
          <p className="text-[11px] text-blue-200/80">Pro Workspace</p>
        </span>
      </header>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {USER_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const showBadge = item.badge && unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                  : "text-blue-100/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <NavIcon name={item.icon} />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0B1F3A]" />
              )}
            </Link>
          );
        })}
      </nav>

      <footer className="space-y-1 border-t border-white/10 px-3 py-4">
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-amber-200/90 hover:bg-white/10"
          >
            <Shield size={18} />
            Admin Panel
          </Link>
        )}
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
            pathname.startsWith("/settings")
              ? "bg-blue-600/80 text-white"
              : "text-blue-100/80 hover:bg-white/10 hover:text-white"
          )}
        >
          <Settings size={18} />
          Cài Đặt
        </Link>

        <section className="mt-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <Link
            href="/profile"
            className="flex min-w-0 flex-1 items-center gap-3 transition-opacity hover:opacity-90"
          >
            <Avatar name={user?.userName ?? "User"} src={user?.avatarUrl} size="md" />
            <span className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user?.userName ?? "Người dùng"}</p>
              <p className="truncate text-[11px] text-blue-200/70">{user?.email ?? ""}</p>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg p-1.5 text-blue-200/70 hover:bg-white/10 hover:text-white"
            title="Đăng xuất"
          >
            <LogOut size={16} />
          </button>
        </section>
      </footer>
    </aside>
  );
}
