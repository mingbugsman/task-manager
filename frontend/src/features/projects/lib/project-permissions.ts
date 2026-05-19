/** Đồng bộ với backend ProjectRole — OWNER > LEAD > MEMBER > VIEWER */

export type ProjectRoleKey = "OWNER" | "LEAD" | "MEMBER" | "VIEWER";

const ROLE_ALIASES: Record<string, ProjectRoleKey> = {
  OWNER: "OWNER",
  Owner: "OWNER",
  ADMIN: "OWNER",
  Admin: "OWNER",
  LEAD: "LEAD",
  Lead: "LEAD",
  MEMBER: "MEMBER",
  Member: "MEMBER",
  VIEWER: "VIEWER",
  Viewer: "VIEWER",
  Reviewer: "VIEWER",
};

export function normalizeProjectRole(role?: string | null): ProjectRoleKey | null {
  if (!role?.trim()) return null;
  return ROLE_ALIASES[role.trim()] ?? ROLE_ALIASES[role.trim().toUpperCase()] ?? null;
}

export function canInviteRole(actorRole: string | null | undefined, targetRole: ProjectRoleKey): boolean {
  const actor = normalizeProjectRole(actorRole);
  if (!actor) return false;
  if (actor === "OWNER") return true;
  if (actor === "LEAD") return targetRole === "MEMBER" || targetRole === "VIEWER";
  return false;
}

export function inviteableRoles(actorRole: string | null | undefined): ProjectRoleKey[] {
  const all: ProjectRoleKey[] = ["OWNER", "LEAD", "MEMBER", "VIEWER"];
  return all.filter((r) => canInviteRole(actorRole, r));
}

export function canKickMember(
  actorRole: string | null | undefined,
  targetRole: string | null | undefined
): boolean {
  const actor = normalizeProjectRole(actorRole);
  const target = normalizeProjectRole(targetRole);
  if (!actor || !target) return false;
  if (actor === "OWNER") return target !== "OWNER";
  if (actor === "LEAD") return target === "MEMBER" || target === "VIEWER";
  return false;
}

/** Vai trò thực tế để kiểm tra quyền (ưu tiên system admin, rồi role chuẩn hóa). */
export function resolveActorRole(
  myRole: string | null | undefined,
  options?: { isSystemAdmin?: boolean; isProjectManager?: boolean }
): ProjectRoleKey | null {
  if (options?.isSystemAdmin) return "OWNER";
  const fromRole = normalizeProjectRole(myRole);
  if (fromRole) return fromRole;
  if (options?.isProjectManager) return "LEAD";
  return null;
}

export function canChangeMemberRole(actorRole: string | null | undefined): boolean {
  return normalizeProjectRole(actorRole) === "OWNER";
}

export function canDeleteProject(
  actorRole: string | null | undefined,
  isSystemAdmin?: boolean
): boolean {
  if (isSystemAdmin) return true;
  return normalizeProjectRole(actorRole) === "OWNER";
}

export function canEditProject(
  actorRole: string | null | undefined,
  isSystemAdmin?: boolean
): boolean {
  return canDeleteProject(actorRole, isSystemAdmin);
}

/** Có quyền sửa ít nhất một task (OWNER/LEAD/MEMBER) — dùng cho UI chung. */
export function canEditTask(
  actorRole: string | null | undefined,
  isSystemAdmin?: boolean
): boolean {
  return canCreateTask(actorRole, isSystemAdmin);
}

/** Quyền sửa một task cụ thể — MEMBER chỉ được sửa task giao cho chính mình. */
export function canEditTaskItem(
  actorRole: string | null | undefined,
  options: {
    isSystemAdmin?: boolean;
    taskAssigneeId?: number | string | null;
    currentUserId?: number | string | null;
  }
): boolean {
  if (options.isSystemAdmin) return true;
  const r = normalizeProjectRole(actorRole);
  if (r === "OWNER" || r === "LEAD") return true;
  if (r === "VIEWER") return false;
  if (r === "MEMBER") {
    const uid = options.currentUserId;
    const aid = options.taskAssigneeId;
    if (uid == null || aid == null) return false;
    return String(uid) === String(aid);
  }
  return false;
}

export function canManageTaskLabels(
  actorRole: string | null | undefined,
  options: Parameters<typeof canEditTaskItem>[1]
): boolean {
  return canEditTaskItem(actorRole, options);
}

export function canDeleteTask(
  actorRole: string | null | undefined,
  isSystemAdmin?: boolean
): boolean {
  if (isSystemAdmin) return true;
  const r = normalizeProjectRole(actorRole);
  return r === "OWNER" || r === "LEAD";
}

export function canLeaveProject(actorRole: string | null | undefined): boolean {
  return normalizeProjectRole(actorRole) != null;
}

export function canCreateTask(actorRole: string | null | undefined, isSystemAdmin?: boolean): boolean {
  if (isSystemAdmin) return true;
  const r = normalizeProjectRole(actorRole);
  return r === "OWNER" || r === "LEAD" || r === "MEMBER";
}

/** Giá trị gửi API — khớp ProjectRole.name() trên backend. */
export const PROJECT_ROLE_API: Record<ProjectRoleKey, string> = {
  OWNER: "OWNER",
  LEAD: "LEAD",
  MEMBER: "MEMBER",
  VIEWER: "VIEWER",
};

export const PROJECT_ROLE_LABELS: Record<ProjectRoleKey, string> = {
  OWNER: "Chủ dự án",
  LEAD: "Trưởng nhóm",
  MEMBER: "Thành viên",
  VIEWER: "Người xem",
};
