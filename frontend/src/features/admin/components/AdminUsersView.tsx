"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { AppHeader } from "@/src/components/layout/AppHeader";
import { ListPagination } from "@/src/components/ListPagination";
import { DeleteConfirmDialog } from "@/src/components/DeleteConfirmDialog";
import { useDeleteConfirm } from "@/src/hooks/useDeleteConfirm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { userApi } from "@/src/features/users/api/user.api";
import { ADMIN_PAGE_SIZE } from "@/src/features/admin/lib/constants";
import { useDebouncedValue } from "@/src/features/admin/hooks/useDebouncedValue";
import { AdminUserFormModal } from "./AdminUserFormModal";
import type { PageResponse, UserListItem } from "@/src/types/api.types";

export function AdminUsersView() {
  const { isReady } = useAuthReady();
  const deleteConfirm = useDeleteConfirm();
  const [data, setData] = useState<PageResponse<UserListItem> | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserListItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userApi.getUsers({
        page: page + 1,
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
        title="Quản lý User"
        subtitle={data ? `${data.totalElements} người dùng` : "—"}
        showSearch
        searchPlaceholder="Tìm theo tên, email..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <section className="mb-4 flex justify-end">
        <Button
          className="gap-2 rounded-xl bg-blue-600"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} />
          Thêm user
        </Button>
      </section>

      <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase text-slate-400">
              <th className="px-6 py-3">ID</th>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Kích hoạt</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  Đang tải...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              items.map((u) => (
                <tr key={u.userId} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-mono text-slate-500">{u.userId}</td>
                  <td className="px-4 py-4 font-medium">{u.userName}</td>
                  <td className="px-4 py-4 text-slate-600">{u.email}</td>
                  <td className="px-4 py-4">
                    <Badge variant={u.status === "ACTIVE" ? "done" : "high"}>{u.status}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={u.enabled ? "done" : "outline"}>
                      {u.enabled ? "Có" : "Không"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <section className="flex justify-end gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setEditing(u);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600"
                        onClick={() =>
                          deleteConfirm.ask({
                            title: "Xóa vĩnh viễn user",
                            description: "Không thể hoàn tác.",
                            details: [
                              { label: "Tên", value: u.userName },
                              { label: "Email", value: u.email },
                            ],
                            onConfirm: async () => {
                              await userApi.deleteForever(Number(u.userId));
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

      <AdminUserFormModal
        open={modalOpen}
        user={editing}
        onClose={() => setModalOpen(false)}
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
