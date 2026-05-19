"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { AppHeader } from "@/src/components/layout/AppHeader";
import { ListPagination } from "@/src/components/ListPagination";
import { DeleteConfirmDialog } from "@/src/components/DeleteConfirmDialog";
import { useDeleteConfirm } from "@/src/hooks/useDeleteConfirm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { projectApi } from "@/src/features/projects/api/project.api";
import { projectMemberApi } from "@/src/features/projects/api/project-member.api";
import { taskApi } from "@/src/features/tasks/api/task.api";
import { CreateTaskModal } from "@/src/features/projects/components/CreateTaskModal";
import { EditTaskModal } from "@/src/features/projects/components/EditTaskModal";
import { ADMIN_PAGE_SIZE } from "@/src/features/admin/lib/constants";
import { useDebouncedValue } from "@/src/features/admin/hooks/useDebouncedValue";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/src/lib/constants";
import type { PageResponse, ProjectMember, ProjectSummary, TaskSummary } from "@/src/types/api.types";

export function AdminTasksView() {
  const { isReady } = useAuthReady();
  const deleteConfirm = useDeleteConfirm();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectId, setProjectId] = useState<number | "">("");
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [data, setData] = useState<PageResponse<TaskSummary> | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState<number | null>(null);

  useEffect(() => {
    if (!isReady) return;
    projectApi.getAdminProjects({ size: 200 }).then((res) => {
      const list = res.data.data.items;
      setProjects(list);
      setProjectId((prev) => (prev === "" && list.length > 0 ? list[0].projectId : prev));
    });
  }, [isReady]);

  useEffect(() => {
    if (projectId === "") return;
    projectMemberApi.getMembers(Number(projectId)).then((res) => {
      setMembers(res.data.data?.items ?? []);
    });
  }, [projectId]);

  const loadTasks = useCallback(async () => {
    if (projectId === "") return;
    setLoading(true);
    try {
      const res = await taskApi.getTasksByProject(Number(projectId), {
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
  }, [projectId, page, debouncedSearch]);

  useEffect(() => {
    if (!isReady || projectId === "") return;
    loadTasks();
  }, [isReady, loadTasks, projectId]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, projectId]);

  const selectedProject = projects.find((p) => p.projectId === projectId);
  const items = data?.items ?? [];

  return (
    <section>
      <AppHeader
        title="Quản lý Task"
        subtitle={
          selectedProject
            ? `Dự án: ${selectedProject.projectName}`
            : "Chọn dự án để xem tác vụ"
        }
        showSearch
        searchPlaceholder="Tìm tên tác vụ..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <section className="mb-4 flex flex-wrap items-center gap-3">
        <select
          className="h-10 min-w-[14rem] rounded-xl border border-slate-200 bg-white px-3 text-sm"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">— Chọn dự án —</option>
          {projects.map((p) => (
            <option key={p.projectId} value={p.projectId}>
              {p.projectName}
            </option>
          ))}
        </select>
        {projectId !== "" ? (
          <Button className="gap-2 rounded-xl bg-blue-600" onClick={() => setCreateOpen(true)}>
            <Plus size={16} />
            Tạo task
          </Button>
        ) : null}
      </section>

      <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50/80 text-left text-xs font-semibold uppercase text-slate-400">
              <th className="px-6 py-3">Tác vụ</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Ưu tiên</th>
              <th className="px-4 py-3">Người giao</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {projectId === "" ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  Chọn dự án để quản lý task
                </td>
              </tr>
            ) : loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  Đang tải...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  Không có task
                </td>
              </tr>
            ) : (
              items.map((t) => (
                <tr key={t.taskId} className="border-b hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/tasks/${t.taskId}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      {t.taskName}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="outline">{STATUS_LABELS[t.status] ?? t.status}</Badge>
                  </td>
                  <td className="px-4 py-4">{PRIORITY_LABELS[t.priority] ?? t.priority}</td>
                  <td className="px-4 py-4 text-slate-600">
                    {t.assignee?.userName ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <section className="flex justify-end gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => setEditTaskId(t.taskId)}
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
                            title: "Xóa tác vụ",
                            details: [{ label: "Tên", value: t.taskName }],
                            onConfirm: async () => {
                              await taskApi.deleteTask(t.taskId);
                              await loadTasks();
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

      {projectId !== "" ? (
        <>
          <CreateTaskModal
            open={createOpen}
            projectId={Number(projectId)}
            projectName={selectedProject?.projectName}
            members={members}
            onClose={() => setCreateOpen(false)}
            onCreated={loadTasks}
          />
          <EditTaskModal
            open={editTaskId != null}
            taskId={editTaskId}
            projectName={selectedProject?.projectName}
            members={members}
            onClose={() => setEditTaskId(null)}
            onUpdated={loadTasks}
          />
        </>
      ) : null}

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
