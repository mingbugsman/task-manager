"use client";

import Link from "next/link";
import { FolderKanban, ListTodo, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { TeamCollaborator } from "@/src/types/api.types";
import {
  collaboratorDisplayName,
  teamRoleBadgeClass,
  teamRoleLabel,
} from "../lib/team-display";

interface TeamMemberDrawerProps {
  member: TeamCollaborator | null;
  onClose: () => void;
}

export function TeamMemberDrawer({ member, onClose }: TeamMemberDrawerProps) {
  if (!member) return null;

  const name = collaboratorDisplayName(member);

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-slate-900/30"
        aria-label="Đóng"
        onClick={onClose}
      />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-5">
          <section className="flex min-w-0 items-center gap-4">
            <Avatar
              name={name}
              src={member.avatarUrl ?? undefined}
              size="lg"
              className="h-14 w-14 shrink-0"
            />
            <section className="min-w-0">
              <h2 className="truncate text-lg font-bold text-slate-900">{name}</h2>
              {member.email ? (
                <p className="mt-0.5 truncate text-sm text-slate-500">{member.email}</p>
              ) : null}
              <span
                className={cn(
                  "mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                  teamRoleBadgeClass(member.primaryRole)
                )}
              >
                {teamRoleLabel(member.primaryRole)}
              </span>
            </section>
          </section>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Đóng chi tiết"
          >
            <X size={18} />
          </button>
        </header>

        <section className="grid grid-cols-2 gap-3 border-b border-slate-100 px-5 py-4">
          <StatMini label="Dự án chung" value={member.sharedProjectCount} />
          <StatMini label="Task đang làm" value={member.activeTaskCount} />
        </section>

        <section className="flex-1 overflow-y-auto px-5 py-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
            <FolderKanban size={16} className="text-blue-600" />
            Dự án làm chung
          </h3>
          {member.sharedProjects.length === 0 ? (
            <p className="text-sm text-slate-400">Không có dự án chung</p>
          ) : (
            <ul className="space-y-2">
              {member.sharedProjects.map((p) => (
                <li key={p.projectId}>
                  <Link
                    href={`/projects/${p.projectId}`}
                    onClick={onClose}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <span className="min-w-0 truncate text-sm font-medium text-slate-800">
                      {p.projectName}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold",
                        teamRoleBadgeClass(p.role)
                      )}
                    >
                      {teamRoleLabel(p.role)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {member.activeTaskCount > 0 ? (
            <p className="mt-6 flex items-center gap-2 text-xs text-slate-500">
              <ListTodo size={14} />
              {member.activeTaskCount} tác vụ chưa hoàn thành trong các dự án bạn tham gia
            </p>
          ) : null}
        </section>
      </aside>
    </>
  );
}

function StatMini({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-center">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
    </article>
  );
}
