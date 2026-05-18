"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Camera, Mail, Shield, User } from "lucide-react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { userApi } from "@/src/features/users/api/user.api";
import { AppHeader } from "@/src/components/layout/AppHeader";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserDetail } from "@/src/types/api.types";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  BANNED: "Đã khóa",
  INACTIVE: "Chưa kích hoạt",
};

export function ProfileView() {
  const { isReady } = useAuthReady();
  const { data: session } = useSession();
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<UserDetail | null>(null);
  const [userName, setUserName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = () => {
    userApi
      .getMe()
      .then((res) => {
        const data = res.data.data;
        setUser(data);
        setUserName(data.userName);
        setAvatarPreview(data.avatarUrl ?? null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isReady) load();
  }, [isReady]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "err", text: "Chỉ chấp nhận file ảnh" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "err", text: "Ảnh tối đa 5MB" });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setMessage({ type: "err", text: "Tên hiển thị không được để trống" });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await userApi.updateMe({
        userName: userName.trim(),
        avatar: avatarFile ?? undefined,
      });
      setAvatarFile(null);
      setMessage({ type: "ok", text: "Cập nhật hồ sơ thành công" });
      load();
      window.dispatchEvent(new Event("user-profile-updated"));
    } catch {
      setMessage({ type: "err", text: "Không thể cập nhật hồ sơ. Vui lòng thử lại." });
    } finally {
      setSaving(false);
    }
  };

  if (!isReady || loading) {
    return (
      <section className="flex h-64 items-center justify-center">
        <section className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </section>
    );
  }

  if (!user) {
    return (
      <section className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
        <p className="text-slate-500">Không tải được thông tin cá nhân</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <AppHeader
        title="Trang Cá Nhân"
        subtitle="Quản lý thông tin hiển thị và ảnh đại diện"
        showFilter={false}
      />

      <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <section
          className="h-28"
          style={{
            background: "linear-gradient(135deg, #0B1F3A 0%, #2563EB 100%)",
          }}
        />
        <section className="relative px-6 pb-6">
          <section className="-mt-12 mb-4 flex flex-wrap items-end justify-between gap-4">
            <section className="relative">
              <section className="rounded-full ring-4 ring-white">
                <Avatar
                  name={userName || user.userName}
                  src={avatarPreview ?? user.avatarUrl}
                  size="md"
                  className="h-24 w-24 text-base"
                />
              </section>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
                title="Đổi ảnh đại diện"
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </section>
            <section className="flex flex-wrap gap-2 pb-1">
              <Badge variant={user.enabled ? "done" : "outline"}>
                {user.enabled ? "Đã kích hoạt" : "Chưa kích hoạt"}
              </Badge>
              <Badge variant="outline">{STATUS_LABELS[user.status] ?? user.status}</Badge>
              {session?.isAdmin && (
                <Badge variant="progress" className="gap-1">
                  <Shield size={12} />
                  Admin
                </Badge>
              )}
            </section>
          </section>

          <h1 className="text-xl font-bold text-slate-900">{user.userName}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <Mail size={14} />
            {user.email}
          </p>
          <p className="mt-1 text-xs text-slate-400">ID: {user.userId}</p>
        </section>
      </article>

      <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
          <User size={18} className="text-blue-600" />
          Chỉnh sửa hồ sơ
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <section>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tên hiển thị
            </label>
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Tên của bạn"
              maxLength={50}
              disabled={saving}
              className="rounded-xl"
            />
          </section>

          <section>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <Input
              value={user.email}
              disabled
              className="rounded-xl bg-slate-50 text-slate-500"
            />
            <p className="mt-1 text-xs text-slate-400">Email không thể thay đổi tại đây</p>
          </section>

          {message && (
            <section
              className={`rounded-xl px-4 py-3 text-sm ${
                message.type === "ok"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </section>
          )}

          <section className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={saving}
              onClick={() => {
                setUserName(user.userName);
                setAvatarFile(null);
                setAvatarPreview(user.avatarUrl ?? null);
                setMessage(null);
              }}
            >
              Hủy
            </Button>
            <Link href="/settings" className="ml-auto self-center text-sm text-blue-600 hover:underline">
              Sang cài đặt →
            </Link>
          </section>
        </form>
      </article>

      <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
          Thông tin tài khoản
        </h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <section>
            <dt className="text-slate-500">Trạng thái</dt>
            <dd className="font-medium text-slate-800">
              {STATUS_LABELS[user.status] ?? user.status}
            </dd>
          </section>
          <section>
            <dt className="text-slate-500">Vai trò hệ thống</dt>
            <dd className="font-medium text-slate-800">
              {session?.isAdmin ? "Quản trị viên" : "Người dùng"}
            </dd>
          </section>
        </dl>
      </article>
    </section>
  );
}
