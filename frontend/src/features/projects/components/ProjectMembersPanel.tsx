"use client";

import { Crown, Shield, User } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/src/lib/format";
import type { MemberStatistic, ProjectMember } from "@/src/types/api.types";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Quản trị",
  Admin: "Quản trị",
  LEAD: "Trưởng nhóm",
  Lead: "Trưởng nhóm",
  MEMBER: "Thành viên",
  Member: "Thành viên",
  VIEWER: "Người xem",
  Viewer: "Người xem",
};

function roleIcon(role: string) {
  const r = role.toUpperCase();
  if (r === "ADMIN") return <Shield size={14} className="text-amber-600" />;
  if (r === "LEAD") return <Crown size={14} className="text-violet-600" />;
  return <User size={14} className="text-slate-400" />;
}

interface ProjectMembersPanelProps {
  members: ProjectMember[];
  statistic?: MemberStatistic | null;
}

export function ProjectMembersPanel({ members, statistic }: ProjectMembersPanelProps) {
  return (
    <section className="space-y-6">
      {statistic ? (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatChip label="Tổng" value={statistic.totalMembers} />
          <StatChip label="Quản trị" value={statistic.adminCount} />
          <StatChip label="Trưởng nhóm" value={statistic.leadCount} />
          <StatChip label="Thành viên" value={statistic.memberCount + statistic.viewerCount} />
        </section>
      ) : null}

      <ul className="grid gap-3 sm:grid-cols-2">
        {members.length === 0 ? (
          <li className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center text-sm text-slate-400">
            Chưa có thành viên
          </li>
        ) : (
          members.map((member) => (
            <li
              key={member.projectMemberId}
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <Avatar
                name={member.user.userName}
                src={member.user.avatarUrl}
                size="md"
              />
              <section className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">{member.user.userName}</p>
                <p className="truncate text-xs text-slate-500">{member.user.email ?? ""}</p>
                {member.joinedAt ? (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Tham gia {formatDate(member.joinedAt)}
                  </p>
                ) : null}
              </section>
              <Badge variant={member.isManager ? "progress" : "outline"} className="gap-1 shrink-0">
                {roleIcon(member.role)}
                {ROLE_LABELS[member.role] ?? member.role}
              </Badge>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-center shadow-sm">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </article>
  );
}
