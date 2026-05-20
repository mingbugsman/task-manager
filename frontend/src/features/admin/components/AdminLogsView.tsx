"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { AppHeader } from "@/src/components/layout/AppHeader";
import { ListPagination } from "@/src/components/ListPagination";
import { Badge } from "@/components/ui/badge";
import { activityApi } from "@/src/features/activity/api/activity.api";
import { ADMIN_PAGE_SIZE } from "@/src/features/admin/lib/constants";
import { useDebouncedValue } from "@/src/features/admin/hooks/useDebouncedValue";
import { formatDateTime } from "@/src/lib/format";
import type { ActivityLog, PageResponse } from "@/src/types/api.types";

export function AdminLogsView() {
  const { isReady } = useAuthReady();
  const [data, setData] = useState<PageResponse<ActivityLog> | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await activityApi.getAdminActivities({
        page,
        size: ADMIN_PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
      });
      setData(res.data.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    if (!isReady) return;
    load();
  }, [isReady, load]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const items = data?.items ?? [];

  return (
    <section>
      <AppHeader
        title="Nhật ký hệ thống"
        subtitle={data ? `${data.totalElements} bản ghi` : "—"}
        showSearch
        searchPlaceholder="Tìm hành động, tên user..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50/80 text-left text-xs font-semibold uppercase text-slate-400">
              <th className="px-6 py-3">Thời gian</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Hành động</th>
              <th className="px-4 py-3">Đối tượng</th>
              <th className="px-4 py-3">Dự án</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  Đang tải...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  Không có log
                </td>
              </tr>
            ) : (
              items.map((log) => (
                <tr key={log.activityLogId} className="border-b hover:bg-slate-50/50">
                  <td className="px-6 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-medium">{log.userName}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{log.action}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {log.entityType} #{log.entityId}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {log.projectId ? `#${log.projectId}` : "—"}
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
    </section>
  );
}
