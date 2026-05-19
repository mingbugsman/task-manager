export const TEAM_ROLE_LABELS: Record<string, string> = {
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

export function teamRoleLabel(role: string): string {
  return TEAM_ROLE_LABELS[role] ?? role;
}

export function collaboratorDisplayName(c: {
  userName?: string | null;
  email?: string | null;
  userId?: number;
}): string {
  const name = c.userName?.trim();
  if (name) return name;
  const email = c.email?.trim();
  if (email) return email.split("@")[0];
  if (c.userId != null) return `User #${c.userId}`;
  return "Người dùng";
}

export function teamRoleBadgeClass(role: string): string {
  const r = role.toUpperCase();
  if (r === "OWNER" || r === "ADMIN") return "border-amber-200 bg-amber-50 text-amber-800";
  if (r === "LEAD") return "border-violet-200 bg-violet-50 text-violet-800";
  if (r === "VIEWER") return "border-slate-200 bg-slate-50 text-slate-600";
  return "border-slate-200 bg-slate-100 text-slate-700";
}
