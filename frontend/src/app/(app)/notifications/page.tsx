"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { Bell, CheckCheck, ChevronRight } from "lucide-react";
import { AppHeader } from "@/src/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notificationApi } from "@/src/features/notifications/api/notification.api";
import { NOTIFICATION_TYPE_LABELS } from "@/src/lib/constants";
import { formatRelativeTime } from "@/src/lib/format";
import type { NotificationItem } from "@/src/types/api.types";

function typeLabel(type: string) {
  return NOTIFICATION_TYPE_LABELS[type] ?? type;
}

export default function NotificationsPage() {
  const { isReady } = useAuthReady();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q)
    );
  }, [items, search]);

  const load = () => {
    if (!isReady) return;
    setLoading(true);
    notificationApi
      .getNotifications({ size: 50 })
      .then((res) => setItems(res.data.data.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [isReady]);

  const markAll = async () => {
    await notificationApi.markAllAsRead();
    load();
  };

  return (
    <section>
      <AppHeader
        title="Thông Báo"
        subtitle={`${filteredItems.length} thông báo`}
        showSearch
        searchPlaceholder="Tìm thông báo..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <section className="mb-4 flex justify-end">
        <Button variant="outline" className="rounded-xl gap-2" onClick={markAll}>
          <CheckCheck size={16} />
          Đánh dấu tất cả đã đọc
        </Button>
      </section>

      <article className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <section className="flex h-48 items-center justify-center">
            <section className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </section>
        ) : filteredItems.length === 0 ? (
          <section className="flex flex-col items-center py-16 text-slate-400">
            <Bell size={40} className="mb-3 opacity-40" />
            <p>{search.trim() ? "Không tìm thấy thông báo phù hợp" : "Không có thông báo"}</p>
          </section>
        ) : (
          <section className="divide-y divide-slate-50">
            {filteredItems.map((n) => (
              <Link
                key={n.notificationId}
                href={`/notifications/${n.notificationId}`}
                className={`flex gap-4 px-6 py-4 transition-colors hover:bg-slate-50/80 ${
                  !n.isRead ? "bg-blue-50/40" : ""
                }`}
              >
                <section
                  className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    n.isRead ? "bg-slate-100 text-slate-400" : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <Bell size={18} />
                </section>
                <section className="min-w-0 flex-1">
                  <section className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900">{n.title}</p>
                    <section className="flex shrink-0 items-center gap-2">
                      {!n.isRead && <Badge variant="progress">Mới</Badge>}
                      <Badge variant="outline" className="hidden sm:inline-flex">
                        {typeLabel(n.type)}
                      </Badge>
                      <ChevronRight size={18} className="text-slate-300" />
                    </section>
                  </section>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{n.message}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {formatRelativeTime(n.createdAt)}
                  </p>
                </section>
              </Link>
            ))}
          </section>
        )}
      </article>
    </section>
  );
}
