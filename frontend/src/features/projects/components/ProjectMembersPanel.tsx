"use client";

import { Calendar, Crown, Mail, Shield, User, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDate } from "@/src/lib/format";
import { normalizeUserSummary } from "@/src/lib/normalize-user";
import type { MemberStatistic, ProjectMember, UserSummary } from "@/src/types/api.types";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Chủ dự án",
  Owner: "Chủ dự án",
  ADMIN: "Chủ dự án",
  Admin: "Chủ dự án",
  LEAD: "Trưởng nhóm",
  Lead: "Trưởng nhóm",
  MEMBER: "Thành viên",
  Member: "Thành viên",
  VIEWER: "Người xem",
  Viewer: "Người xem",
};

const ROLE_ORDER: Record<string, number> = {
  OWNER: 0,
  Owner: 0,
  ADMIN: 0,
  Admin: 0,
  LEAD: 1,
  Lead: 1,
  MEMBER: 2,
  Member: 2,
  VIEWER: 3,
  Viewer: 3,
};

function roleIcon(role: string) {
  const r = role.toUpperCase();
  if (r === "OWNER" || r === "ADMIN") return <Shield size={14} />;
  if (r === "LEAD") return <Crown size={14} />;
  return <User size={14} />;
}

function roleBadgeStyle(role: string) {
  const r = role.toUpperCase();
  if (r === "OWNER" || r === "ADMIN") return "border-amber-200 bg-amber-50 text-amber-800";
  if (r === "LEAD") return "border-violet-200 bg-violet-50 text-violet-800";
  if (r === "VIEWER") return "border-slate-200 bg-slate-50 text-slate-600";
  return "border-slate-200 bg-slate-100 text-slate-700";
}

function memberUser(member: ProjectMember): UserSummary {
  return normalizeUserSummary({
    userId: member.userId ?? member.user?.userId,
    userName: member.userName ?? member.user?.userName,
    email: member.userEmail ?? member.user?.email,
    avatarUrl: member.userAvatarUrl ?? member.user?.avatarUrl,
    ...(member.user ?? {}),
  });
}

function displayName(member: ProjectMember): string {
  const user = memberUser(member);

  const name = user.userName?.trim();
  if (name) return name;

  const email = user.email?.trim();
  if (email) return email.split("@")[0];

  const id = user.userId;
  if (id != null) return `User #${id}`;

  return "Người dùng";
}

function sortMembers(list: ProjectMember[]): ProjectMember[] {
  return [...list].sort((a, b) => {
    const oa = ROLE_ORDER[a.role] ?? 99;
    const ob = ROLE_ORDER[b.role] ?? 99;
    if (oa !== ob) return oa - ob;
    return displayName(a).localeCompare(displayName(b), "vi");
  });
}

interface ProjectMembersPanelProps {
  members: ProjectMember[];
  statistic?: MemberStatistic | null;
}

export function ProjectMembersPanel({ members, statistic }: ProjectMembersPanelProps) {
  const sorted = sortMembers(members);

  return (
    <section className="space-y-6">
      {statistic ? (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatChip label="Tổng" value={statistic.totalMembers} />
          <StatChip label="Quản trị" value={statistic.adminCount} />
          <StatChip label="Trưởng nhóm" value={statistic.leadCount} />
          <StatChip
            label="Thành viên"
            value={statistic.memberCount + statistic.viewerCount}
          />
        </section>
      ) : null}

      <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <section className="flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Danh sách thành viên</h3>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {members.length}
            </span>
          </section>
          <section className="hidden gap-6 text-xs font-semibold uppercase tracking-wide text-slate-400 sm:flex">
            <span className="w-[min(280px,40vw)]">Thành viên</span>
            <span className="w-28 text-center">Vai trò</span>
            <span className="w-32 text-right">Ngày tham gia</span>
          </section>
        </header>

        {sorted.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-400">Chưa có thành viên trong dự án</p>
        ) : (
          <ul className="divide-y divide-slate-50">
            {sorted.map((member) => (
              <MemberRow key={member.projectMemberId} member={member} />
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}

function MemberRow({ member }: { member: ProjectMember }) {
  const user = memberUser(member);
  const name = displayName(member);
  const roleLabel = ROLE_LABELS[member.role] ?? member.role;

  return (
    <li className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-slate-50/80 sm:flex-row sm:items-center sm:gap-4">
      <section className="flex min-w-0 flex-1 items-center gap-4 sm:w-[min(280px,40vw)]">
        <Avatar name={name} src={user.avatarUrl ?? undefined} size="md" className="h-12 w-12 shrink-0" />
        <section className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-slate-900">{name}</p>
          {user.email ? (
            <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-slate-500">
              <Mail size={13} className="shrink-0" />
              {user.email}
            </p>
          ) : null}
          {user.userId != null ? (
            <p className="mt-1 text-xs text-slate-400 sm:hidden">ID: {user.userId}</p>
          ) : null}
        </section>
      </section>

      <section className="flex items-center justify-between gap-3 sm:w-28 sm:justify-center">
        <span className="text-xs font-medium text-slate-400 sm:hidden">Vai trò</span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
            roleBadgeStyle(member.role)
          )}
        >
          {roleIcon(member.role)}
          {roleLabel}
        </span>
      </section>

      <section className="flex items-center justify-between gap-3 sm:w-32 sm:justify-end">
        <span className="text-xs font-medium text-slate-400 sm:hidden">Ngày tham gia</span>
        <span className="flex items-center gap-1.5 text-sm text-slate-600">
          <Calendar size={14} className="shrink-0 text-slate-400" />
          {member.joinedAt ? (
            <>Tham gia {formatDate(member.joinedAt)}</>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </span>
      </section>
    </li>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white px-4 py-5 text-center shadow-sm">
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </article>
  );
}
