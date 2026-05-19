import type { ProjectMember, UserSummary } from "@/src/types/api.types";

type RawRecord = Record<string, unknown>;

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Chuẩn hóa user từ API (camelCase hoặc snake_case). */
export function normalizeUserSummary(raw: unknown): UserSummary {
  const u = (raw && typeof raw === "object" ? raw : {}) as RawRecord;

  return {
    userId: asNumber(u.userId ?? u.user_id),
    userName: asString(u.userName ?? u.user_name ?? u.username),
    email: asString(u.email),
    avatarUrl: asString(u.avatarUrl ?? u.avatar_url),
  };
}

/** Gộp field phẳng (nếu có) với object user lồng nhau. */
export function normalizeProjectMember(raw: unknown): ProjectMember {
  const m = (raw && typeof raw === "object" ? raw : {}) as RawRecord & ProjectMember;

  const user = normalizeUserSummary({
    userId: m.userId ?? (m as RawRecord).user_id,
    userName: m.userName ?? (m as RawRecord).user_name,
    email: (m as RawRecord).userEmail ?? m.email,
    avatarUrl: m.avatarUrl ?? (m as RawRecord).avatar_url,
    ...(m.user && typeof m.user === "object" ? (m.user as RawRecord) : {}),
  });

  return {
    projectMemberId: Number(m.projectMemberId ?? (m as RawRecord).project_member_id ?? 0),
    projectId: Number(m.projectId ?? (m as RawRecord).project_id ?? 0),
    user,
    role: String(m.role ?? "Member"),
    isManager: Boolean(m.isManager ?? (m as RawRecord).is_manager),
    joinedAt: (m.joinedAt ?? (m as RawRecord).joined_at) as string | undefined,
  };
}
