"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Send, Trash2, Users } from "lucide-react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { AppHeader } from "@/src/components/layout/AppHeader";
import { ListPagination } from "@/src/components/ListPagination";
import { DeleteConfirmDialog } from "@/src/components/DeleteConfirmDialog";
import { useDeleteConfirm } from "@/src/hooks/useDeleteConfirm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminNotificationApi,
  type AdminNotificationItem,
} from "@/src/features/notifications/api/notification.api";
import { userApi } from "@/src/features/users/api/user.api";
import { ADMIN_PAGE_SIZE } from "@/src/features/admin/lib/constants";
import { useDebouncedValue } from "@/src/features/admin/hooks/useDebouncedValue";
import { NOTIFICATION_TYPE_LABELS } from "@/src/lib/constants";
import { formatDateTime } from "@/src/lib/format";
import { getApiErrorMessage } from "@/src/lib/api-error";
import type { PageResponse, UserListItem } from "@/src/types/api.types";

type SendMode = "all" | "selected";

export function AdminNotificationsView() {
  const { isReady } = useAuthReady();
  const deleteConfirm = useDeleteConfirm();

  const [data, setData] = useState<PageResponse<AdminNotificationItem> | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sendMode, setSendMode] = useState<SendMode>("all");
  const [userSearch, setUserSearch] = useState("");
  const [userOptions, setUserOptions] = useState<UserListItem[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [sending, setSending] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminNotificationApi.list({
        page,
        size: ADMIN_PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        type: typeFilter || undefined,
      });
      setData(res.data.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, typeFilter]);

  useEffect(() => {
    if (!isReady) return;
    load();
  }, [isReady, load]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, typeFilter]);

  useEffect(() => {
    if (sendMode !== "selected") return;
    userApi
      .getUsers({ page: 1, size: 50, search: userSearch.trim() || undefined })
      .then((res) => setUserOptions(res.data.data.items))
      .catch(() => setUserOptions([]));
  }, [sendMode, userSearch]);

  const toggleUser = (id: number) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setSendFeedback("Vui lòng nhập tiêu đề và nội dung");
      return;
    }
    if (sendMode === "selected" && selectedUserIds.size === 0) {
      setSendFeedback("Chọn ít nhất một người nhận");
      return;
    }
    setSending(true);
    setSendFeedback(null);
    try {
      await adminNotificationApi.send({
        title: title.trim(),
        message: message.trim(),
        userIds: sendMode === "all" ? undefined : Array.from(selectedUserIds),
      });
      setSendFeedback(
        sendMode === "all"
          ? `Đã gửi tới tất cả người dùng.`
          : `Đã gửi tới ${selectedUserIds.size} người dùng.`
      );
      setTitle("");
      setMessage("");
      setSelectedUserIds(new Set());
      await load();
    } catch (err) {
      setSendFeedback(getApiErrorMessage(err, "Gửi thông báo thất bại"));
    } finally {
      setSending(false);
    }
  };

  const items = data?.items ?? [];

  return (
    <section>
      <AppHeader
        title="Quản lý thông báo"
        subtitle="Gửi thông báo hệ thống và xem toàn bộ thông báo trên hệ thống"
      />

      <article className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-6 shadow-sm">
        <header className="mb-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Send size={20} />
          </span>
          <section>
            <h2 className="text-lg font-bold text-slate-900">Gửi thông báo mới</h2>
            <p className="text-sm text-slate-500">
              User sẽ nhận trong mục Thông báo của app và qua realtime (SSE) nếu đang online.
            </p>
          </section>
        </header>

        <form onSubmit={handleSend} className="space-y-4">
          <section className="grid gap-4 lg:grid-cols-2">
            <Input
              placeholder="Tiêu đề *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl"
            />
            <section className="flex gap-2">
              <Button
                type="button"
                variant={sendMode === "all" ? "default" : "outline"}
                className="flex-1 rounded-xl"
                onClick={() => setSendMode("all")}
              >
                Tất cả user
              </Button>
              <Button
                type="button"
                variant={sendMode === "selected" ? "default" : "outline"}
                className="flex-1 gap-1 rounded-xl"
                onClick={() => setSendMode("selected")}
              >
                <Users size={16} />
                Chọn user
              </Button>
            </section>
          </section>

          <textarea
            rows={4}
            placeholder="Nội dung thông báo *"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {sendMode === "selected" ? (
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <Input
                placeholder="Tìm user theo tên, email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="mb-3 rounded-xl"
              />
              <section className="max-h-40 space-y-1 overflow-y-auto">
                {userOptions.map((u) => {
                  const id = Number(u.userId);
                  const checked = selectedUserIds.has(id);
                  return (
                    <label
                      key={u.userId}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleUser(id)}
                      />
                      <span className="text-sm">
                        {u.userName}{" "}
                        <span className="text-slate-400">({u.email})</span>
                      </span>
                    </label>
                  );
                })}
              </section>
              {selectedUserIds.size > 0 ? (
                <p className="mt-2 text-xs text-blue-600">
                  Đã chọn {selectedUserIds.size} người nhận
                </p>
              ) : null}
            </section>
          ) : null}

          <section className="flex flex-wrap items-center gap-3">
            <Button type="submit" className="gap-2 rounded-xl bg-blue-600" disabled={sending}>
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Gửi thông báo
            </Button>
            {sendFeedback ? (
              <p
                className={`text-sm ${
                  sendFeedback.startsWith("Đã") ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {sendFeedback}
              </p>
            ) : null}
          </section>
        </form>
      </article>

      <section className="mb-4 flex flex-wrap items-end gap-3">
        <section className="min-w-[12rem] flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500">Tìm kiếm</label>
          <Input
            placeholder="Tiêu đề, nội dung, tên user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl"
          />
        </section>
        <section>
          <label className="mb-1 block text-xs font-medium text-slate-500">Loại</label>
          <select
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="SYSTEM">Hệ thống</option>
            <option value="TASK_ASSIGNED">Giao việc</option>
            <option value="TASK_UPDATED">Cập nhật task</option>
            <option value="COMMENT">Bình luận</option>
            <option value="PROJECT">Dự án</option>
          </select>
        </section>
      </section>

      <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50/80 text-left text-xs font-semibold uppercase text-slate-400">
              <th className="px-6 py-3">Thời gian</th>
              <th className="px-4 py-3">Người nhận</th>
              <th className="px-4 py-3">Tiêu đề</th>
              <th className="px-4 py-3">Loại</th>
              <th className="px-4 py-3">Đã đọc</th>
              <th className="px-6 py-3 text-right">Xóa</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  Đang tải...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  Chưa có thông báo
                </td>
              </tr>
            ) : (
              items.map((n) => (
                <tr key={n.notificationId} className="border-b hover:bg-slate-50/50">
                  <td className="px-6 py-3 whitespace-nowrap text-xs text-slate-500">
                    {formatDateTime(n.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{n.recipientUserName}</p>
                    <p className="text-xs text-slate-400">{n.recipientEmail}</p>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-medium text-slate-900">{n.title}</p>
                    <p className="line-clamp-2 text-xs text-slate-500">{n.message}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">
                      {NOTIFICATION_TYPE_LABELS[n.type] ?? n.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={n.isRead ? "done" : "high"}>
                      {n.isRead ? "Đã đọc" : "Chưa đọc"}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-600"
                      onClick={() =>
                        deleteConfirm.ask({
                          title: "Xóa thông báo",
                          details: [
                            { label: "Người nhận", value: n.recipientUserName },
                            { label: "Tiêu đề", value: n.title },
                          ],
                          onConfirm: async () => {
                            await adminNotificationApi.delete(n.notificationId);
                            await load();
                          },
                        })
                      }
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {data && data.totalElements > 0 ? (
          <ListPagination
            page={page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            pageSize={data.pageSize}
            hasPrevious={data.hasPrevious}
            hasNext={data.hasNext}
            onPageChange={setPage}
          />
        ) : null}
      </article>

      <DeleteConfirmDialog
        open={deleteConfirm.open}
        title={deleteConfirm.request?.title ?? ""}
        description={deleteConfirm.request?.description}
        details={deleteConfirm.request?.details}
        loading={deleteConfirm.loading}
        errorMessage={deleteConfirm.errorMessage}
        onConfirm={deleteConfirm.confirm}
        onCancel={deleteConfirm.close}
      />
    </section>
  );
}
