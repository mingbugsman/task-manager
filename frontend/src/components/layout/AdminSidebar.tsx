"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Shield, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "@/src/lib/constants";
import { NavIcon } from "./NavIcon";
import { Avatar } from "@/components/ui/avatar";
import type { UserDetail } from "@/src/types/api.types";

interface AdminSidebarProps {
  user?: UserDetail | null;
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-slate-200 bg-white">
      <section className="flex items-center gap-3 border-b border-slate-100 px-5 py-6">
        <section className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Shield size={20} />
        </section>
        <section>
          <p className="text-sm font-bold text-slate-900">Admin Panel</p>
          <p className="text-[11px] text-slate-500">MIJTAP Management</p>
        </section>
      </section>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {ADMIN_NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <section className="border-t border-slate-100 p-4">
        <section className="mb-3 flex items-center gap-3">
          <Avatar name={user?.userName ?? "Admin"} src={user?.avatarUrl} size="md" />
          <section className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user?.userName ?? "Admin"}
            </p>
            <p className="truncate text-[11px] text-slate-500">{user?.email ?? ""}</p>
          </section>
        </section>

        <Link
          href="/dashboard"
          className="mb-2 flex w-full items-center justify-center rounded-xl bg-blue-50 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-100"
        >
          Về trang User
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100"
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </section>
    </aside>
  );
}
