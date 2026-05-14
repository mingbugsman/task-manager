"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { jwtDecode } from "jwt-decode";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  Users,
  BarChart3,
  Calendar,
  Info,
  Shield,
  type LucideIcon,
} from "lucide-react";

import { userApi } from "@/src/features/user/api/user.api";
import type { UserDetailResponse } from "@/src/types/user.types";

type JwtRolePayload = { role?: string[] };

const navItems: { path: string; icon: LucideIcon; label: string }[] = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/projects", icon: FolderKanban, label: "Dự Án" },
  { path: "/tasks", icon: CheckSquare, label: "Tất Cả Tác Vụ" },
  { path: "/calendar", icon: Calendar, label: "Lịch" },
  { path: "/analytics", icon: BarChart3, label: "Báo Cáo" },
  { path: "/team", icon: Users, label: "Team" },
  { path: "/notifications", icon: Bell, label: "Thông Báo" },
  { path: "/about", icon: Info, label: "Giới Thiệu" },
];

function isPathActive(pathname: string, itemPath: string) {
  if (pathname === itemPath) return true;
  if (itemPath === "/dashboard") {
    return pathname.startsWith("/dashboard/");
  }
  return pathname.startsWith(`${itemPath}/`);
}

function hasAdminRole(accessToken: string | undefined): boolean {
  if (!accessToken) return false;
  try {
    const decoded = jwtDecode<JwtRolePayload>(accessToken);
    const roles = decoded.role ?? [];
    return roles.some((r) => r.replace(/^ROLE_/i, "").toUpperCase() === "ADMIN");
  } catch {
    return false;
  }
}

function defaultAvatarSeed(name: string) {
  return encodeURIComponent(name.trim() || "user");
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [me, setMe] = useState<UserDetailResponse | null>(null);

  const isAdmin = useMemo(
    () => hasAdminRole(session?.accessToken),
    [session?.accessToken],
  );

  useEffect(() => {
    if (status !== "authenticated") {
      setMe(null);
      return;
    }
    let cancelled = false;
    userApi
      .getMe()
      .then((res) => {
        if (!cancelled) setMe(res.data.data);
      })
      .catch(() => {
        if (!cancelled) setMe(null);
      });
    return () => {
      cancelled = true;
    };
  }, [status, session?.accessToken]);

  const unreadCount = 0;

  const handleLogout = () => {
    void signOut({ callbackUrl: "/login" });
  };

  const displayName = me?.userName ?? "…";
  const subtitle = me?.email ?? me?.status ?? "";
  const avatarSrc =
    me?.avatarUrl?.trim() ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${defaultAvatarSeed(displayName)}`;

  return (
    <aside
      className="sticky top-0 flex h-screen shrink-0 flex-col transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? "72px" : "240px",
        background: "linear-gradient(180deg, #0B1F3A 0%, #0F2D5C 50%, #0B1F3A 100%)",
        boxShadow: "4px 0 20px rgba(0,0,0,0.25)",
      }}
    >
      <div
        className="flex items-center gap-3 border-b px-4 py-5"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="flex shrink-0 items-center justify-center rounded-xl"
          style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
            boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
          }}
        >
          <Zap className="text-white" size={20} aria-hidden />
        </div>
        {!collapsed && (
          <div className="min-w-0 overflow-hidden">
            <p className="truncate text-sm font-semibold leading-tight text-white">TaskManager</p>
            <p style={{ color: "#93C5FD", fontSize: "11px" }}>Pro Workspace</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto shrink-0 rounded-lg p-1 transition-colors"
          style={{ color: "#93C5FD", background: "rgba(255,255,255,0.06)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          }}
          aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <p
            style={{
              color: "#475B7A",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              paddingLeft: "8px",
              paddingBottom: "8px",
              textTransform: "uppercase",
            }}
          >
            Menu
          </p>
        )}
        {navItems.map((item) => {
          const isActive = isPathActive(pathname, item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              title={collapsed ? item.label : undefined}
              className="group relative flex items-center gap-3 rounded-xl transition-all duration-200"
              style={{
                padding: "10px 12px",
                background: isActive
                  ? "linear-gradient(135deg, rgba(37,99,235,0.35), rgba(29,78,216,0.25))"
                  : "transparent",
                color: isActive ? "#FFFFFF" : "#93C5FD",
                borderLeft: isActive ? "3px solid #3B82F6" : "3px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "#FFFFFF";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#93C5FD";
                }
              }}
            >
              <div className="relative shrink-0">
                <item.icon size={20} aria-hidden />
                {item.path === "/notifications" && unreadCount > 0 && (
                  <span
                    className="absolute -right-1.5 -top-1.5 flex items-center justify-center rounded-full text-white"
                    style={{
                      width: "16px",
                      height: "16px",
                      fontSize: "9px",
                      background: "#EF4444",
                      fontWeight: 700,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              {!collapsed && (
                <span style={{ fontSize: "13px", fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
              )}
              {isActive && !collapsed && (
                <div
                  className="absolute right-3 rounded-full"
                  style={{ width: "6px", height: "6px", background: "#3B82F6" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t p-3" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {isAdmin && (
          <Link
            href="/admin"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
            style={{ color: "#FBBF24" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(251,191,36,0.1)";
              e.currentTarget.style.color = "#FCD34D";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#FBBF24";
            }}
          >
            <Shield size={18} className="shrink-0" aria-hidden />
            {!collapsed && <span style={{ fontSize: "13px", fontWeight: 600 }}>Admin Panel</span>}
          </Link>
        )}

        <Link
          href="/settings"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
          style={{ color: "#93C5FD" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#93C5FD";
          }}
        >
          <Settings size={18} className="shrink-0" aria-hidden />
          {!collapsed && <span style={{ fontSize: "13px" }}>Cài Đặt</span>}
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
          style={{ background: "rgba(255,255,255,0.04)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          }}
          title="Đăng xuất"
        >
          <img
            src={avatarSrc}
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-full border-2 object-cover"
            style={{ borderColor: "#2563EB" }}
          />
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-white" style={{ fontSize: "12px", fontWeight: 600 }}>
                  {displayName}
                </p>
                <p style={{ color: "#93C5FD", fontSize: "10px" }} className="truncate">
                  {subtitle}
                </p>
              </div>
              <LogOut size={15} style={{ color: "#93C5FD", flexShrink: 0 }} aria-hidden />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
