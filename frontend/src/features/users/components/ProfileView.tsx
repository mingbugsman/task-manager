"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Camera, Eye, Mail, Shield, User, X } from "lucide-react";
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
  const formRef = useRef<HTMLFormElement>(null);
  const previewObjectUrlRef = useRef<string | null>(null);

  const [user, setUser] = useState<UserDetail | null>(null);
  const [userName, setUserName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [savedAvatarUrl, setSavedAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const revokePreview = () => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }
  };

  const load = () => {
    userApi
      .getMe()
      .then((res) => {
        const data = res.data.data;
        setUser(data);
        setUserName(data.userName);
        setSavedAvatarUrl(data.avatarUrl ?? null);
        revokePreview();
        setPreviewUrl(null);
        setAvatarFile(null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isReady) load();
    return () => revokePreview();
  }, [isReady]);

  const displayAvatarSrc = previewUrl ?? savedAvatarUrl ?? undefined;
  const hasPendingPreview = Boolean(avatarFile && previewUrl);

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

    revokePreview();
    const objectUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = objectUrl;
    setAvatarFile(file);
    setPreviewUrl(objectUrl);
    setMessage(null);
  };

  const clearPreview = () => {
    revokePreview();
    setPreviewUrl(null);
    setAvatarFile(null);
    if (fileRef.current) fileRef.current.value = "";
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
                  src={displayAvatarSrc}
                  size="md"
                  className="h-24 w-24 text-base"
                  isPreview={hasPendingPreview}
                />
              </section>
              {hasPendingPreview ? (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                  Xem trước
                </span>
              ) : null}
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

          <h1 className="text-xl font-bold text-slate-900">{userName || user.userName}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <Mail size={14} />
            {user.email}
          </p>
          <p className="mt-1 text-xs text-slate-400">ID: {user.userId}</p>
        </section>
      </article>

      {hasPendingPreview ? (
        <article className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-5 shadow-sm">
          <section className="mb-4 flex items-center justify-between">
            <section className="flex items-center gap-2 text-sm font-semibold text-blue-800">
              <Eye size={18} />
              Xem trước ảnh đại diện
            </section>
            <button
              type="button"
              onClick={clearPreview}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white"
            >
              <X size={14} />
              Hủy ảnh mới
            </button>
          </section>
          <section className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <img
              src={previewUrl!}
              alt="Xem trước avatar"
              className="h-32 w-32 rounded-2xl border-4 border-white object-cover shadow-lg ring-2 ring-blue-200"
            />
            <section className="text-center sm:text-left">
              <p className="text-sm font-medium text-slate-800">{avatarFile?.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                {avatarFile ? `${(avatarFile.size / 1024).toFixed(0)} KB` : ""} — Nhấn &quot;Lưu thay
                đổi&quot; để áp dụng
              </p>
              <section className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Button
                  type="button"
                  size="sm"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700"
                  onClick={() => formRef.current?.requestSubmit()}
                >
                  Lưu ảnh này
                </Button>
                <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={clearPreview}>
                  Chọn ảnh khác
                </Button>
              </section>
            </section>
          </section>
        </article>
      ) : null}

      <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
          <User size={18} className="text-blue-600" />
          Chỉnh sửa hồ sơ
        </h2>

        <form ref={formRef} id="profile-form" onSubmit={handleSubmit} className="space-y-5">
          <section>
            <label className="mb-2 block text-sm font-medium text-slate-700">Ảnh đại diện</label>
            <section className="flex flex-wrap items-center gap-4">
              <Avatar
                name={userName || user.userName}
                src={displayAvatarSrc}
                size="lg"
                className="h-16 w-16"
                isPreview={hasPendingPreview}
              />
              <section>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => fileRef.current?.click()}
                >
                  Chọn ảnh
                </Button>
                <p className="mt-2 text-xs text-slate-400">PNG, JPG tối đa 5MB</p>
              </section>
            </section>
          </section>

          <section>
            <label className="mb-2 block text-sm font-medium text-slate-700">Tên hiển thị</label>
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
            <Input value={user.email} disabled className="rounded-xl bg-slate-50 text-slate-500" />
            <p className="mt-1 text-xs text-slate-400">Email không thể thay đổi tại đây</p>
          </section>

          {message ? (
            <section
              className={`rounded-xl px-4 py-3 text-sm ${
                message.type === "ok"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </section>
          ) : null}

          <section className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving} className="rounded-xl bg-blue-600 hover:bg-blue-700">
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={saving}
              onClick={() => {
                setUserName(user.userName);
                clearPreview();
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
