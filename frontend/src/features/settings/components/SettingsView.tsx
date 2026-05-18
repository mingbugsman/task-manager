"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Bell,
  ChevronRight,
  Globe,
  KeyRound,
  LogOut,
  Monitor,
  Shield,
  User,
} from "lucide-react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { userApi } from "@/src/features/users/api/user.api";
import { authApi } from "@/src/features/auth/api/auth.api";
import { notificationApi } from "@/src/features/notifications/api/notification.api";
import { AppHeader } from "@/src/components/layout/AppHeader";
import type { UserDetail } from "@/src/types/api.types";

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}

function SettingRow({ icon, title, description, href, onClick, danger }: SettingRowProps) {
  const content = (
    <section
      className={`flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50 ${
        danger ? "text-red-600 hover:bg-red-50/50" : ""
      }`}
    >
      <section
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          danger ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600"
        }`}
      >
        {icon}
      </section>
      <section className="min-w-0 flex-1">
        <p className={`font-medium ${danger ? "text-red-700" : "text-slate-900"}`}>{title}</p>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </section>
      {!danger && <ChevronRight size={18} className="shrink-0 text-slate-300" />}
    </section>
  );

  if (href) {
    return (
      <Link href={href} className="block border-b border-slate-50 last:border-0">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full border-b border-slate-50 last:border-0"
    >
      {content}
    </button>
  );
}

export function SettingsView() {
  const { isReady } = useAuthReady();
  const { data: session } = useSession();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    userApi
      .getMe()
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null));
    notificationApi
      .getUnreadCount()
      .then((res) => setUnreadCount(res.data.data.unread_count))
      .catch(() => setUnreadCount(0));
  }, [isReady]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      /* vẫn đăng xuất client */
    }
    await signOut({ callbackUrl: "/login" });
  };

  const handleLogoutAll = async () => {
    if (!user?.userId) return;
    if (!confirm("Đăng xuất khỏi tất cả thiết bị?")) return;
    setLoggingOut(true);
    try {
      await authApi.logoutAll(Number(user.userId));
    } catch {
      /* ignore */
    }
    await signOut({ callbackUrl: "/login" });
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <AppHeader title="Cài Đặt" subtitle="Tài khoản, bảo mật và tùy chọn ứng dụng" showFilter={false} />

      <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <section className="border-b border-slate-100 bg-slate-50/80 px-6 py-3">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Tài khoản</h2>
        </section>
        <SettingRow
          icon={<User size={18} />}
          title="Trang cá nhân"
          description="Tên hiển thị, ảnh đại diện"
          href="/profile"
        />
        <SettingRow
          icon={<KeyRound size={18} />}
          title="Đổi mật khẩu"
          description="Gửi mã OTP qua email để đặt lại mật khẩu"
          href="/forgot-password"
        />
        {session?.isAdmin && (
          <SettingRow
            icon={<Shield size={18} />}
            title="Admin Panel"
            description="Quản trị hệ thống"
            href="/admin"
          />
        )}
      </article>

      <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <section className="border-b border-slate-100 bg-slate-50/80 px-6 py-3">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Thông báo</h2>
        </section>
        <SettingRow
          icon={<Bell size={18} />}
          title="Quản lý thông báo"
          description={
            unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : "Xem tất cả thông báo"
          }
          href="/notifications"
        />
      </article>

      <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <section className="border-b border-slate-100 bg-slate-50/80 px-6 py-3">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Phiên đăng nhập</h2>
        </section>
        <SettingRow
          icon={<LogOut size={18} />}
          title="Đăng xuất"
          description="Thoát khỏi thiết bị hiện tại"
          onClick={handleLogout}
          danger
        />
        <SettingRow
          icon={<Monitor size={18} />}
          title="Đăng xuất tất cả thiết bị"
          description="Hủy mọi phiên đăng nhập của tài khoản"
          onClick={handleLogoutAll}
          danger
        />
      </article>

      <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <section className="border-b border-slate-100 bg-slate-50/80 px-6 py-3">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Hệ thống</h2>
        </section>
        <section className="divide-y divide-slate-50 px-6 py-4 text-sm">
          <section className="flex items-center justify-between py-2">
            <section className="flex items-center gap-3 text-slate-600">
              <Globe size={16} />
              API Backend
            </section>
            <span className="font-mono text-xs text-slate-800">{apiUrl}</span>
          </section>
          <section className="flex items-center justify-between py-2">
            <span className="text-slate-600">Phiên bản</span>
            <span className="text-slate-800">TaskManager 1.0</span>
          </section>
        </section>
      </article>

      {loggingOut && (
        <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <section className="rounded-xl bg-white px-6 py-4 shadow-lg">Đang đăng xuất...</section>
        </section>
      )}

      <section className="flex justify-center pb-8">
        <Link
          href="/dashboard"
          className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium hover:bg-slate-50"
        >
          Về Dashboard
        </Link>
      </section>
    </section>
  );
}
