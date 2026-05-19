"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Check,
  ExternalLink,
  ListTodo,
  Trash2,
} from "lucide-react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { notificationApi } from "@/src/features/notifications/api/notification.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/src/components/DeleteConfirmDialog";
import { useDeleteConfirm } from "@/src/hooks/useDeleteConfirm";
import { NOTIFICATION_TYPE_LABELS } from "@/src/lib/constants";
import { formatDateTime, formatRelativeTime } from "@/src/lib/format";
import type { NotificationItem } from "@/src/types/api.types";

function typeLabel(type: string) {
  return NOTIFICATION_TYPE_LABELS[type] ?? type;
}

function entityLink(n: NotificationItem): string | null {
  if (!n.entityType || !n.entityId) return null;
  const t = n.entityType.toUpperCase();
  if (t === "TASK") return `/tasks/${n.entityId}`;
  if (t === "PROJECT") return `/projects`;
  return null;
}

interface NotificationDetailViewProps {
  notificationId: number;
}

export function NotificationDetailView({ notificationId }: NotificationDetailViewProps) {
  const router = useRouter();
  const { isReady } = useAuthReady();
  const [notification, setNotification] = useState<NotificationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const deleteConfirm = useDeleteConfirm();

  useEffect(() => {
    if (!isReady) return;

    async function load() {
      setLoading(true);
      try {
        let item = await notificationApi.getById(notificationId);
        if (item && !item.isRead) {
          const readRes = await notificationApi.markAsRead(notificationId);
          item = readRes.data.data;
        }
        setNotification(item);
      } catch {
        setNotification(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isReady, notificationId]);

  const handleMarkRead = async () => {
    if (!notification || notification.isRead) return;
    setActionLoading(true);
    try {
      const res = await notificationApi.markAsRead(notificationId);
      setNotification(res.data.data);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = () => {
    if (!notification) return;
    deleteConfirm.ask({
      title: "Xóa thông báo",
      description: "Thông báo sẽ bị xóa vĩnh viễn và không thể khôi phục.",
      details: [
        { label: "Tiêu đề", value: notification.title },
        { label: "Loại", value: typeLabel(notification.type) },
        {
          label: "Nội dung",
          value:
            notification.message.length > 200
              ? `${notification.message.slice(0, 200)}…`
              : notification.message,
        },
        {
          label: "Thời gian",
          value: formatDateTime(notification.createdAt),
        },
        ...(notification.entityType
          ? [
              {
                label: "Liên quan",
                value: `${notification.entityType}${notification.entityId != null ? ` #${notification.entityId}` : ""}`,
              },
            ]
          : []),
      ],
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await notificationApi.delete(notificationId);
          router.push("/notifications");
        } catch (e) {
          console.error(e);
          setActionLoading(false);
          throw e;
        }
      },
    });
  };

  if (!isReady || loading) {
    return (
      <section className="flex h-64 items-center justify-center">
        <section className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </section>
    );
  }

  if (!notification) {
    return (
      <section className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
        <Bell size={40} className="mx-auto mb-3 text-slate-300" />
        <p className="text-slate-500">Không tìm thấy thông báo</p>
        <Button
          variant="outline"
          className="mt-4 rounded-xl"
          onClick={() => router.push("/notifications")}
        >
          Quay lại danh sách
        </Button>
      </section>
    );
  }

  const link = entityLink(notification);

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/notifications"
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        <ArrowLeft size={16} />
        Quay lại thông báo
      </Link>

      <article
        className={`overflow-hidden rounded-2xl border shadow-sm ${
          notification.isRead
            ? "border-slate-100 bg-white"
            : "border-blue-200 bg-gradient-to-br from-blue-50/80 to-white"
        }`}
      >
        <section className="border-b border-slate-100 px-6 py-5">
          <section className="flex flex-wrap items-start justify-between gap-4">
            <section
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                notification.isRead ? "bg-slate-100 text-slate-500" : "bg-blue-600 text-white"
              }`}
            >
              <Bell size={22} />
            </section>
            <section className="flex flex-wrap gap-2">
              <Badge variant="outline">{typeLabel(notification.type)}</Badge>
              {!notification.isRead ? (
                <Badge variant="progress">Chưa đọc</Badge>
              ) : (
                <Badge variant="done">Đã đọc</Badge>
              )}
            </section>
          </section>

          <h1 className="mt-4 text-2xl font-bold text-slate-900">{notification.title}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {formatDateTime(notification.createdAt)} · {formatRelativeTime(notification.createdAt)}
          </p>
        </section>

        <section className="px-6 py-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Nội dung
          </h2>
          <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-700">
            {notification.message}
          </p>
        </section>

        {(notification.entityType || notification.entityId) && (
          <section className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Liên quan
            </h2>
            <p className="text-sm text-slate-600">
              {notification.entityType ?? "—"}
              {notification.entityId != null && (
                <span className="font-mono text-slate-800"> #{notification.entityId}</span>
              )}
            </p>
            {link && (
              <Link
                href={link}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <ListTodo size={16} />
                Xem tác vụ liên quan
                <ExternalLink size={14} />
              </Link>
            )}
          </section>
        )}

        <section className="flex flex-wrap gap-3 border-t border-slate-100 px-6 py-4">
          {!notification.isRead && (
            <Button
              variant="outline"
              className="rounded-xl gap-2"
              disabled={actionLoading}
              onClick={handleMarkRead}
            >
              <Check size={16} />
              Đánh dấu đã đọc
            </Button>
          )}
          <Button
            variant="destructive"
            className="rounded-xl gap-2"
            disabled={actionLoading}
            onClick={handleDelete}
          >
            <Trash2 size={16} />
            Xóa thông báo
          </Button>
        </section>
      </article>

      <DeleteConfirmDialog
        open={deleteConfirm.open}
        title={deleteConfirm.request?.title ?? ""}
        description={deleteConfirm.request?.description}
        details={deleteConfirm.request?.details}
        confirmLabel={deleteConfirm.request?.confirmLabel}
        loading={deleteConfirm.loading || actionLoading}
        onConfirm={deleteConfirm.confirm}
        onCancel={deleteConfirm.close}
      />
    </section>
  );
}
