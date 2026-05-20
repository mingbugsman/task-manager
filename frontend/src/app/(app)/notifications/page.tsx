"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { Bell, CheckCheck, ChevronRight } from "lucide-react";
import { AppHeader } from "@/src/components/layout/AppHeader";
import { ListPagination } from "@/src/components/ListPagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notificationApi } from "@/src/features/notifications/api/notification.api";
import { NOTIFICATION_TYPE_LABELS } from "@/src/lib/constants";
import { formatRelativeTime } from "@/src/lib/format";
import type { NotificationItem } from "@/src/types/api.types";

const PAGE_SIZE = 10;
const SEARCH_FETCH_SIZE = 100;

function typeLabel(type: string) {
  return NOTIFICATION_TYPE_LABELS[type] ?? type;
}

function matchesSearch(n: NotificationItem, q: string) {
  return (
    n.title.toLowerCase().includes(q) ||
    n.message.toLowerCase().includes(q) ||
    n.type.toLowerCase().includes(q)
  );
}

export default function NotificationsPage() {
  const { isReady } = useAuthReady();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [searchItems, setSearchItems] = useState<NotificationItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [searchPage, setSearchPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(true);

  const searchQuery = search.trim().toLowerCase();
  const isSearching = searchQuery.length > 0;

  const filteredSearchItems = useMemo(() => {
    if (!isSearching) return [];
    return searchItems.filter((n) => matchesSearch(n, searchQuery));
  }, [searchItems, searchQuery, isSearching]);

  const searchTotalPages = Math.max(1, Math.ceil(filteredSearchItems.length / PAGE_SIZE));

  const displayItems = useMemo(() => {
    if (!isSearching) return items;
    const start = searchPage * PAGE_SIZE;
    return filteredSearchItems.slice(start, start + PAGE_SIZE);
  }, [isSearching, items, filteredSearchItems, searchPage]);

  const activePage = isSearching ? searchPage : page;
  const activeTotalPages = isSearching ? searchTotalPages : totalPages;
  const activeTotalElements = isSearching ? filteredSearchItems.length : totalElements;
  const activeHasNext = isSearching ? searchPage < searchTotalPages - 1 : hasNext;
  const activeHasPrevious = isSearching ? searchPage > 0 : hasPrevious;

  const loadPage = useCallback(
    (targetPage: number) => {
      if (!isReady) return;
      setLoading(true);
      notificationApi
        .getNotifications({ page: targetPage, size: PAGE_SIZE })
        .then((res) => {
          const data = res.data.data;
          setItems(data.items);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
          setHasNext(data.hasNext);
          setHasPrevious(data.hasPrevious);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    },
    [isReady]
  );

  const loadSearchPool = useCallback(() => {
    if (!isReady) return;
    setLoading(true);
    notificationApi
      .getNotifications({ page: 0, size: SEARCH_FETCH_SIZE })
      .then((res) => setSearchItems(res.data.data.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;
    if (isSearching) {
      loadSearchPool();
    } else {
      loadPage(page);
    }
  }, [isReady, isSearching, page, loadPage, loadSearchPool]);

  useEffect(() => {
    setSearchPage(0);
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (value.trim()) {
      setSearchPage(0);
    } else {
      setPage(0);
    }
  };

  const handlePageChange = (nextPage: number) => {
    if (isSearching) {
      setSearchPage(nextPage);
    } else {
      setPage(nextPage);
    }
  };

  const markAll = async () => {
    await notificationApi.markAllAsRead();
    if (isSearching) {
      loadSearchPool();
    } else {
      loadPage(page);
    }
  };

  return (
    <section>
      <AppHeader
        title="Thông Báo"
        subtitle={
          isSearching
            ? `${filteredSearchItems.length} kết quả tìm kiếm`
            : `${totalElements} thông báo`
        }
        showSearch
        searchPlaceholder="Tìm thông báo..."
        searchValue={search}
        onSearchChange={handleSearchChange}
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
        ) : displayItems.length === 0 ? (
          <section className="flex flex-col items-center py-16 text-slate-400">
            <Bell size={40} className="mb-3 opacity-40" />
            <p>{isSearching ? "Không tìm thấy thông báo phù hợp" : "Không có thông báo"}</p>
          </section>
        ) : (
          <>
            <section className="divide-y divide-slate-50">
              {displayItems.map((n) => (
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
            <ListPagination
              page={activePage}
              totalPages={activeTotalPages}
              totalElements={activeTotalElements}
              pageSize={PAGE_SIZE}
              hasPrevious={activeHasPrevious}
              hasNext={activeHasNext}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </article>
    </section>
  );
}
