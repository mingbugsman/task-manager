"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, FolderKanban, ListTodo, Mail, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { AppHeader } from "@/src/components/layout/AppHeader";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { cn } from "@/lib/utils";
import { teamApi } from "../api/team.api";
import type { TeamCollaborator, TeamDirectory } from "@/src/types/api.types";
import {
  collaboratorDisplayName,
  teamRoleBadgeClass,
  teamRoleLabel,
} from "../lib/team-display";
import { TeamMemberDrawer } from "./TeamMemberDrawer";

export function TeamView() {
  const { isReady } = useAuthReady();
  const [directory, setDirectory] = useState<TeamDirectory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState<number | "all">("all");
  const [selected, setSelected] = useState<TeamCollaborator | null>(null);

  useEffect(() => {
    if (!isReady) return;

    setLoading(true);
    setError(null);
    teamApi
      .getDirectory()
      .then((res) => setDirectory(res.data.data))
      .catch(() => setError("Không tải được danh sách team"))
      .finally(() => setLoading(false));
  }, [isReady]);

  const projectOptions = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of directory?.collaborators ?? []) {
      for (const p of c.sharedProjects) {
        map.set(p.projectId, p.projectName);
      }
    }
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }, [directory]);

  const filtered = useMemo(() => {
    let list = directory?.collaborators ?? [];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => {
        const name = collaboratorDisplayName(c).toLowerCase();
        const email = c.email?.toLowerCase() ?? "";
        return name.includes(q) || email.includes(q);
      });
    }
    if (projectFilter !== "all") {
      list = list.filter((c) =>
        c.sharedProjects.some((p) => p.projectId === projectFilter)
      );
    }
    return list;
  }, [directory, search, projectFilter]);

  const overview = directory?.overview;

  if (!isReady || loading) {
    return (
      <section>
        <AppHeader
          title="Team"
          subtitle="Thành viên bạn làm việc cùng qua các dự án"
          showFilter={false}
        />
        <section className="flex h-64 items-center justify-center">
          <section className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </section>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <AppHeader title="Team" subtitle={error} showFilter={false} />
        <article className="rounded-2xl border border-red-100 bg-red-50 px-5 py-8 text-center text-sm text-red-700">
          {error}
        </article>
      </section>
    );
  }

  return (
    <section>
      <AppHeader
        title="Team"
        subtitle={`${filtered.length} thành viên · ${overview?.projectCount ?? 0} dự án`}
        showSearch
        searchPlaceholder="Tìm tên hoặc email..."
        searchValue={search}
        onSearchChange={setSearch}
        showFilter={false}
      />

      {overview ? (
        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <OverviewCard
            icon={Users}
            label="Cộng tác viên"
            value={overview.collaboratorCount}
            accent="text-blue-600"
          />
          <OverviewCard
            icon={FolderKanban}
            label="Dự án của bạn"
            value={overview.projectCount}
            accent="text-violet-600"
          />
          <OverviewCard
            icon={ListTodo}
            label="Task đang giao"
            value={overview.activeAssignedTaskCount}
            accent="text-amber-600"
          />
        </section>
      ) : null}

      {projectOptions.length > 0 ? (
        <section className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Lọc dự án
          </span>
          <FilterChip
            active={projectFilter === "all"}
            onClick={() => setProjectFilter("all")}
          >
            Tất cả
          </FilterChip>
          {projectOptions.map((p) => (
            <FilterChip
              key={p.id}
              active={projectFilter === p.id}
              onClick={() => setProjectFilter(p.id)}
            >
              {p.name}
            </FilterChip>
          ))}
        </section>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyTeam hasProjects={(overview?.projectCount ?? 0) > 0} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((member) => (
            <MemberCard key={member.userId} member={member} onSelect={() => setSelected(member)} />
          ))}
        </ul>
      )}

      <TeamMemberDrawer member={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

function OverviewCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <article className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50",
          accent
        )}
      >
        <Icon size={22} />
      </span>
      <section>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </section>
    </article>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
        active
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      )}
    >
      {children}
    </button>
  );
}

function MemberCard({
  member,
  onSelect,
}: {
  member: TeamCollaborator;
  onSelect: () => void;
}) {
  const name = collaboratorDisplayName(member);
  const previewProjects = member.sharedProjects.slice(0, 2);

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className="flex h-full w-full flex-col rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
      >
        <section className="flex items-start gap-3">
          <Avatar
            name={name}
            src={member.avatarUrl ?? undefined}
            size="md"
            className="h-12 w-12 shrink-0"
          />
          <section className="min-w-0 flex-1">
            <p className="truncate font-bold text-slate-900">{name}</p>
            {member.email ? (
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                <Mail size={12} className="shrink-0" />
                {member.email}
              </p>
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
          <ChevronRight size={18} className="shrink-0 text-slate-300" />
        </section>

        <section className="mt-4 flex gap-4 text-xs text-slate-500">
          <span>{member.sharedProjectCount} dự án chung</span>
          <span>{member.activeTaskCount} task đang làm</span>
        </section>

        {previewProjects.length > 0 ? (
          <ul className="mt-3 space-y-1 border-t border-slate-50 pt-3">
            {previewProjects.map((p) => (
              <li key={p.projectId} className="truncate text-xs text-slate-600">
                · {p.projectName}
              </li>
            ))}
            {member.sharedProjects.length > 2 ? (
              <li className="text-xs text-slate-400">
                +{member.sharedProjects.length - 2} dự án khác
              </li>
            ) : null}
          </ul>
        ) : null}
      </button>
    </li>
  );
}

function EmptyTeam({ hasProjects }: { hasProjects: boolean }) {
  return (
    <article className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <Users size={40} className="mb-4 text-slate-300" />
      <h3 className="text-lg font-bold text-slate-800">Chưa có cộng tác viên</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        {hasProjects
          ? "Các dự án của bạn chưa có thành viên khác, hoặc không khớp bộ lọc hiện tại."
          : "Tham gia hoặc tạo dự án để làm việc cùng team."}
      </p>
      <Link
        href="/projects"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        <FolderKanban size={16} />
        Xem dự án
      </Link>
    </article>
  );
}
