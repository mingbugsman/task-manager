"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { AppHeader } from "@/src/components/layout/AppHeader";
import { ListPagination } from "@/src/components/ListPagination";
import { DeleteConfirmDialog } from "@/src/components/DeleteConfirmDialog";
import { useDeleteConfirm } from "@/src/hooks/useDeleteConfirm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { projectApi } from "@/src/features/projects/api/project.api";
import { ADMIN_PAGE_SIZE } from "@/src/features/admin/lib/constants";
import { useDebouncedValue } from "@/src/features/admin/hooks/useDebouncedValue";
import { PROJECT_STATUS_LABELS } from "@/src/lib/constants";
import { AdminProjectFormModal } from "./AdminProjectFormModal";
import type { PageResponse, ProjectSummary } from "@/src/types/api.types";

export function AdminProjectsView() {
  const { isReady } = useAuthReady();
  const deleteConfirm = useDeleteConfirm();
  const [data, setData] = useState<PageResponse<ProjectSummary> | null>(null);
  const [search, setSearch] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProjectSummary | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectApi.getAdminProjects({
        page,
        size: ADMIN_PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        includeDeleted,
      });
      setData(res.data.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, includeDeleted]);

  useEffect(() => {
    if (!isReady) return;
    load();
  }, [isReady, load]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, includeDeleted]);

  const items = data?.items ?? [];

  return (
    <section>
      <AppHeader
        title="Quản lý Dự án"
        subtitle={data ? `${data.totalElements} dự án` : "—"}
        showSearch
        searchPlaceholder="Tìm tên dự án..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <label className="mb-4 flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={includeDeleted}
          onChange={(e) => setIncludeDeleted(e.target.checked)}
        />
        Hiển thị cả dự án đã xóa
      </label>

      <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50/80 text-left text-xs font-semibold uppercase text-slate-400">
              <th className="px-6 py-3">Dự án</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Tiến độ</th>
              <th className="px-4 py-3">Tasks</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
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
                  Không có dự án
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p.projectId} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/projects/${p.projectId}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      {p.projectName}
                    </Link>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                      {p.projectDescription || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="outline">
                      {PROJECT_STATUS_LABELS[p.status] ?? p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 min-w-[8rem]">
                    <Progress value={Math.round(p.progressRate)} barClassName="bg-blue-600" />
                    <span className="text-xs text-slate-500">{Math.round(p.progressRate)}%</span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{p.totalTasks}</td>
                  <td className="px-6 py-4">
                    <section className="flex justify-end gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => setEditing(p)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        title="Khôi phục"
                        onClick={async () => {
                          await projectApi.restoreProject(p.projectId);
                          load();
                        }}
                      >
                        <RotateCcw size={16} />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600"
                        onClick={() =>
                          deleteConfirm.ask({
                            title: "Xóa dự án",
                            description: "Xóa mềm — có thể khôi phục sau.",
                            details: [{ label: "Tên", value: p.projectName }],
                            onConfirm: async () => {
                              await projectApi.deleteProject(p.projectId);
                              await load();
                            },
                          })
                        }
                      >
                        <Trash2 size={16} />
                      </Button>
                    </section>
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

      <AdminProjectFormModal
        open={editing != null}
        project={editing}
        onClose={() => setEditing(null)}
        onSaved={load}
      />

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
