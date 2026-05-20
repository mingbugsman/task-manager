"use client";

import { useState } from "react";
import { Database, Loader2, ScrollText, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppHeader } from "@/src/components/layout/AppHeader";
import { activityApi } from "@/src/features/activity/api/activity.api";
import { getApiErrorMessage } from "@/src/lib/api-error";

export function AdminSettingsView() {
  const [purgeDate, setPurgeDate] = useState("");
  const [purging, setPurging] = useState(false);
  const [purgeResult, setPurgeResult] = useState<string | null>(null);

  const handlePurge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purgeDate) return;
    setPurging(true);
    setPurgeResult(null);
    try {
      const before = new Date(purgeDate).toISOString();
      const res = await activityApi.purgeBefore(before);
      const count = res.data.data?.deleted_count ?? 0;
      setPurgeResult(`Đã xóa ${count} bản ghi nhật ký trước mốc thời gian đã chọn.`);
    } catch (err) {
      setPurgeResult(getApiErrorMessage(err, "Xóa log thất bại"));
    } finally {
      setPurging(false);
    }
  };

  return (
    <section>
      <AppHeader
        title="Cài đặt hệ thống"
        subtitle="Bảo trì dữ liệu và tham chiếu nhanh cho quản trị viên"
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <header className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <ScrollText size={20} />
            </span>
            <section>
              <h2 className="font-bold text-slate-900">Dọn nhật ký cũ</h2>
              <p className="text-sm text-slate-500">
                Xóa activity log trước ngày chọn (giảm dung lượng database).
              </p>
            </section>
          </header>
          <form onSubmit={handlePurge} className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Xóa log trước ngày
            </label>
            <Input
              type="datetime-local"
              value={purgeDate}
              onChange={(e) => setPurgeDate(e.target.value)}
              className="rounded-xl"
            />
            <Button
              type="submit"
              variant="outline"
              className="rounded-xl border-red-200 text-red-700 hover:bg-red-50"
              disabled={purging || !purgeDate}
            >
              {purging ? <Loader2 size={16} className="animate-spin" /> : null}
              Xóa log cũ
            </Button>
            {purgeResult ? (
              <p
                className={`text-sm ${
                  purgeResult.startsWith("Đã") ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {purgeResult}
              </p>
            ) : null}
          </form>
        </article>

        <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <header className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Shield size={20} />
            </span>
            <h2 className="font-bold text-slate-900">Hướng dẫn nhanh</h2>
          </header>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-2 rounded-xl bg-slate-50 p-3">
              <Database size={18} className="shrink-0 text-slate-400" />
              <span>
                <strong>Thông báo:</strong> dùng menu{" "}
                <Link href="/admin/notifications" className="text-blue-600 hover:underline">
                  Quản lý thông báo
                </Link>{" "}
                (gửi broadcast hoặc chọn user, xem & xóa).
              </span>
            </li>
            <li className="flex gap-2 rounded-xl bg-slate-50 p-3">
              <ScrollText size={18} className="shrink-0 text-slate-400" />
              <span>
                <strong>Nhật ký:</strong> tab System Logs — xem hoạt động; dọn log cũ tại đây.
              </span>
            </li>
            <li className="flex gap-2 rounded-xl bg-slate-50 p-3">
              <Shield size={18} className="shrink-0 text-slate-400" />
              <span>
                <strong>API:</strong> Swagger tại /swagger-ui.html khi backend chạy local.
              </span>
            </li>
          </ul>
        </article>
      </section>
    </section>
  );
}
