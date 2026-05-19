"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userApi } from "@/src/features/users/api/user.api";
import { getApiErrorMessage } from "@/src/lib/api-error";
import type { UserListItem } from "@/src/types/api.types";

interface AdminUserFormModalProps {
  open: boolean;
  user?: UserListItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export function AdminUserFormModal({ open, user, onClose, onSaved }: AdminUserFormModalProps) {
  const isEdit = Boolean(user);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleGlobal, setRoleGlobal] = useState("USER");
  const [status, setStatus] = useState("ACTIVE");
  const [enabled, setEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setUserName(user?.userName ?? "");
    setEmail(user?.email ?? "");
    setPassword("");
    setRoleGlobal("USER");
    setStatus(user?.status ?? "ACTIVE");
    setEnabled(user?.enabled ?? true);
    setError(null);
  }, [open, user]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !email.trim()) {
      setError("Tên và email là bắt buộc");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        userName: userName.trim(),
        email: email.trim(),
        password: password.trim() || undefined,
        roleGlobal,
        status,
        enabled,
      };
      if (isEdit && user) {
        await userApi.updateForAdmin(Number(user.userId), payload);
      } else {
        await userApi.createForAdmin(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không lưu được người dùng"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <article
        className="w-full max-w-md rounded-2xl border border-slate-100 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            {isEdit ? "Sửa người dùng" : "Tạo người dùng"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <section className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Tên đăng nhập</label>
            <Input value={userName} onChange={(e) => setUserName(e.target.value)} className="rounded-xl" />
          </section>
          <section className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" />
          </section>
          <section className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Mật khẩu {isEdit ? "(để trống nếu không đổi)" : ""}
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl"
              placeholder={isEdit ? "••••••" : "Mặc định 123456 nếu trống"}
            />
          </section>
          <section className="grid grid-cols-2 gap-3">
            <section className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Vai trò</label>
              <select
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
                value={roleGlobal}
                onChange={(e) => setRoleGlobal(e.target.value)}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </section>
            <section className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Trạng thái</label>
              <select
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="BANNED">BANNED</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </section>
          </section>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            Kích hoạt tài khoản
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <section className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="rounded-xl bg-blue-600" disabled={submitting}>
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              Lưu
            </Button>
          </section>
        </form>
      </article>
    </section>
  );
}
