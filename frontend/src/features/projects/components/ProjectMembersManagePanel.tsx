"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  Crown,
  LogOut,
  Mail,
  Shield,
  User,
  UserMinus,
  UserPlus,
  Users,
  Link2,
  Copy,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionMenuDropdown } from "@/src/components/ActionMenuDropdown";
import { DeleteConfirmDialog } from "@/src/components/DeleteConfirmDialog";
import { ListPagination } from "@/src/components/ListPagination";
import { useDeleteConfirm } from "@/src/hooks/useDeleteConfirm";
import { projectMemberApi } from "@/src/features/projects/api/project-member.api";
import { projectInviteApi } from "@/src/features/projects/api/project-invite.api";
import {
  PROJECT_ROLE_API,
  PROJECT_ROLE_LABELS,
  canChangeMemberRole,
  canKickMember,
  canLeaveProject,
  inviteableRoles,
  normalizeProjectRole,
  resolveActorRole,
  type ProjectRoleKey,
} from "@/src/features/projects/lib/project-permissions";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/src/lib/api-error";
import { formatDate } from "@/src/lib/format";
import { normalizeUserSummary } from "@/src/lib/normalize-user";
import type { MemberStatistic, ProjectMember, UserSummary } from "@/src/types/api.types";

const MEMBER_PAGE_SIZE = 6;

const ROLE_LABELS: Record<string, string> = {
  ...PROJECT_ROLE_LABELS,
  Owner: "Chủ dự án",
  Admin: "Chủ dự án",
  Lead: "Trưởng nhóm",
  Member: "Thành viên",
  Viewer: "Người xem",
};

function roleIcon(role: string) {
  const r = normalizeProjectRole(role);
  if (r === "OWNER") return <Shield size={14} />;
  if (r === "LEAD") return <Crown size={14} />;
  return <User size={14} />;
}

function roleBadgeStyle(role: string) {
  const r = normalizeProjectRole(role);
  if (r === "OWNER") return "border-amber-200 bg-amber-50 text-amber-800";
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
  if (user.userName?.trim()) return user.userName.trim();
  if (user.email?.trim()) return user.email.split("@")[0];
  if (user.userId != null) return `User #${user.userId}`;
  return "Người dùng";
}

function memberUserId(member: ProjectMember): number | null {
  const raw = member.userId ?? member.user?.userId;
  if (raw == null || String(raw).trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

interface ProjectMembersManagePanelProps {
  projectId: number;
  projectName?: string;
  members: ProjectMember[];
  statistic?: MemberStatistic | null;
  currentUserId?: number | string | null;
  myRole?: string | null;
  isProjectManager?: boolean;
  isSystemAdmin?: boolean;
  onRefresh: () => void;
}

export function ProjectMembersManagePanel({
  projectId,
  projectName,
  members,
  statistic,
  currentUserId,
  myRole,
  isProjectManager = false,
  isSystemAdmin = false,
  onRefresh,
}: ProjectMembersManagePanelProps) {
  const router = useRouter();
  const deleteConfirm = useDeleteConfirm();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteRole, setInviteRole] = useState<ProjectRoleKey>("MEMBER");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMode, setInviteMode] = useState<"link" | "id">("link");
  const [inviteLinkUrl, setInviteLinkUrl] = useState<string | null>(null);
  const [linkExpiresDays, setLinkExpiresDays] = useState("7");
  const [linkCopied, setLinkCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [memberPage, setMemberPage] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);

  const effectiveRole = resolveActorRole(myRole, {
    isSystemAdmin,
    isProjectManager,
  });

  const rolesCanInvite = inviteableRoles(effectiveRole ?? myRole);
  const canInvite = rolesCanInvite.length > 0;
  const canManageRoles =
    isSystemAdmin || canChangeMemberRole(effectiveRole ?? myRole);

  const sorted = useMemo(
    () =>
      [...members].sort((a, b) => {
        const order = { OWNER: 0, LEAD: 1, MEMBER: 2, VIEWER: 3 };
        const oa = order[normalizeProjectRole(a.role) ?? "VIEWER"] ?? 99;
        const ob = order[normalizeProjectRole(b.role) ?? "VIEWER"] ?? 99;
        if (oa !== ob) return oa - ob;
        return displayName(a).localeCompare(displayName(b), "vi");
      }),
    [members]
  );

  const memberTotalPages = Math.max(1, Math.ceil(sorted.length / MEMBER_PAGE_SIZE));
  const pagedMembers = useMemo(() => {
    const start = memberPage * MEMBER_PAGE_SIZE;
    return sorted.slice(start, start + MEMBER_PAGE_SIZE);
  }, [sorted, memberPage]);

  const handleCreateInviteLink = async () => {
    setInviteLoading(true);
    setInviteError(null);
    setActionError(null);
    setLinkCopied(false);
    try {
      const days = Number(linkExpiresDays);
      const res = await projectInviteApi.createLink(projectId, {
        role: PROJECT_ROLE_API[inviteRole],
        expiresInDays: days > 0 ? days : undefined,
      });
      const url = res.data.data?.inviteUrl;
      if (!url) throw new Error("Không nhận được link mời");
      setInviteLinkUrl(url);
    } catch (err) {
      setInviteError(getApiErrorMessage(err, "Không tạo được link mời"));
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopyInviteLink = async () => {
    if (!inviteLinkUrl) return;
    try {
      await navigator.clipboard.writeText(inviteLinkUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setInviteError("Không sao chép được link. Hãy chọn và copy thủ công.");
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = Number(inviteUserId.trim());
    if (!uid || Number.isNaN(uid)) {
      setInviteError("Nhập ID người dùng hợp lệ");
      return;
    }
    setInviteLoading(true);
    setInviteError(null);
    setActionError(null);
    try {
      await projectMemberApi.invite(projectId, {
        userId: uid,
        role: PROJECT_ROLE_API[inviteRole],
      });
      setInviteUserId("");
      setShowInvite(false);
      onRefresh();
    } catch (err) {
      const msg = getApiErrorMessage(err, "Không mời được thành viên");
      setInviteError(msg);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleKick = (member: ProjectMember) => {
    const user = memberUser(member);
    deleteConfirm.ask({
      title: "Kick thành viên khỏi dự án",
      description: "Thành viên sẽ mất quyền truy cập dự án và các task liên quan.",
      details: [
        { label: "Dự án", value: projectName ?? `#${projectId}` },
        { label: "Thành viên", value: displayName(member) },
        { label: "Email", value: user.email ?? "—" },
        { label: "Vai trò", value: ROLE_LABELS[member.role] ?? member.role },
      ],
      confirmLabel: "Kick",
      onConfirm: async () => {
        const uid = memberUserId(member);
        if (uid == null) {
          setActionError("Không xác định được ID thành viên");
          throw new Error("missing user id");
        }
        setActionLoading(uid);
        setActionError(null);
        try {
          await projectMemberApi.kick(projectId, uid);
          onRefresh();
        } catch (err) {
          setActionError(getApiErrorMessage(err, "Không kick được thành viên"));
          throw err;
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleLeave = () => {
    const me = sorted.find((m) => String(memberUser(m).userId) === String(currentUserId));
    deleteConfirm.ask({
      title: "Rời khỏi dự án",
      description:
        "Bạn sẽ không còn truy cập dự án này. Chủ dự án duy nhất không thể rời cho đến khi bổ nhiệm chủ dự án khác.",
      details: [
        { label: "Dự án", value: projectName ?? `#${projectId}` },
        { label: "Vai trò của bạn", value: me ? (ROLE_LABELS[me.role] ?? me.role) : "—" },
      ],
      confirmLabel: "Rời dự án",
      onConfirm: async () => {
        await projectMemberApi.leave(projectId);
        router.push("/projects");
      },
    });
  };

  const handleRoleChange = async (member: ProjectMember, newRole: ProjectRoleKey) => {
    const uid = memberUserId(member);
    if (uid == null) {
      setActionError("Không xác định được ID thành viên");
      return;
    }
    setActionLoading(uid);
    setActionError(null);
    try {
      await projectMemberApi.updateRole(projectId, uid, PROJECT_ROLE_API[newRole]);
      onRefresh();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Không cập nhật được vai trò"));
    } finally {
      setActionLoading(null);
    }
  };

  const roleHint = effectiveRole
    ? PROJECT_ROLE_LABELS[effectiveRole]
    : myRole
      ? (ROLE_LABELS[myRole] ?? myRole)
      : "Chưa xác định";

  return (
    <section className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-3">
        <section className="space-y-2">
          <section className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">
              Quyền của bạn:{" "}
              <span className="text-blue-700">{roleHint}</span>
              {isSystemAdmin ? (
                <span className="ml-1 text-xs font-normal text-slate-500">(Admin hệ thống)</span>
              ) : null}
            </p>
            <ul className="mt-1 list-inside list-disc text-xs leading-relaxed">
              <li>
                <strong>Quản trị</strong>: mời, đổi vai trò, kick Lead/Member/Viewer
              </li>
              <li>
                <strong>Trưởng nhóm</strong>: mời Member/Viewer, kick Member/Viewer
              </li>
              <li>Mọi thành viên có thể <strong>rời dự án</strong></li>
            </ul>
          </section>
          {!canManageRoles && !canInvite && effectiveRole !== "LEAD" ? (
            <p className="text-xs text-amber-700">
              Bạn cần vai trò Quản trị hoặc Trưởng nhóm để kick / phân quyền thành viên. Vào tab
              Thành viên trong chi tiết dự án khi đã có quyền.
            </p>
          ) : null}
        </section>
        <section className="flex flex-wrap gap-2">
          {canLeaveProject(effectiveRole ?? myRole) ? (
            <Button
              type="button"
              variant="outline"
              className="gap-2 rounded-xl border-red-200 text-red-700 hover:bg-red-50"
              onClick={handleLeave}
            >
              <LogOut size={16} />
              Rời dự án
            </Button>
          ) : null}
          {canInvite ? (
            <Button
              type="button"
              className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowInvite((v) => !v)}
            >
              <UserPlus size={16} />
              Mời thành viên
            </Button>
          ) : null}
        </section>
      </section>

      {showInvite && canInvite ? (
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h4 className="mb-3 text-sm font-bold text-slate-900">Mời thành viên mới</h4>
          <section className="mb-4 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={inviteMode === "link" ? "default" : "outline"}
              className={cn(
                "rounded-xl gap-1.5",
                inviteMode === "link" && "bg-blue-600 hover:bg-blue-700"
              )}
              onClick={() => {
                setInviteMode("link");
                setInviteError(null);
              }}
            >
              <Link2 size={14} />
              Link mời
            </Button>
            <Button
              type="button"
              size="sm"
              variant={inviteMode === "id" ? "default" : "outline"}
              className={cn(
                "rounded-xl",
                inviteMode === "id" && "bg-blue-600 hover:bg-blue-700"
              )}
              onClick={() => {
                setInviteMode("id");
                setInviteError(null);
              }}
            >
              Theo ID
            </Button>
          </section>

          <section className="mb-3 space-y-1">
            <label className="text-xs font-medium text-slate-500">Vai trò khi tham gia</label>
            <select
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as ProjectRoleKey)}
            >
              {rolesCanInvite.map((r) => (
                <option key={r} value={r}>
                  {PROJECT_ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </section>

          {inviteMode === "link" ? (
            <section className="space-y-3">
              <p className="text-xs text-slate-500">
                Chia sẻ link — người nhận phải đăng ký/đăng nhập rồi mới tham gia được dự án.
              </p>
              <section className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Hết hạn sau (ngày)</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0 = không hết hạn"
                  className="rounded-xl"
                  value={linkExpiresDays}
                  onChange={(e) => setLinkExpiresDays(e.target.value)}
                />
              </section>
              {inviteLinkUrl ? (
                <section className="space-y-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                  <p className="text-xs font-medium text-emerald-800">Link mời (sao chép và gửi):</p>
                  <Input readOnly className="rounded-xl bg-white text-xs" value={inviteLinkUrl} />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-xl"
                    onClick={handleCopyInviteLink}
                  >
                    {linkCopied ? <Check size={14} /> : <Copy size={14} />}
                    {linkCopied ? "Đã sao chép" : "Sao chép link"}
                  </Button>
                </section>
              ) : null}
              <section className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setShowInvite(false);
                    setInviteLinkUrl(null);
                  }}
                >
                  Đóng
                </Button>
                <Button
                  type="button"
                  className="rounded-xl bg-blue-600"
                  disabled={inviteLoading}
                  onClick={handleCreateInviteLink}
                >
                  {inviteLinkUrl ? "Tạo link mới" : "Tạo link mời"}
                </Button>
              </section>
            </section>
          ) : (
            <form onSubmit={handleInvite} className="space-y-3">
              <section className="space-y-1">
                <label className="text-xs font-medium text-slate-500">ID người dùng</label>
                <Input
                  type="number"
                  min={1}
                  placeholder="VD: 5"
                  className="rounded-xl"
                  value={inviteUserId}
                  onChange={(e) => setInviteUserId(e.target.value)}
                />
              </section>
              <section className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setShowInvite(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" className="rounded-xl bg-blue-600" disabled={inviteLoading}>
                  Gửi lời mời
                </Button>
              </section>
            </form>
          )}

          {inviteError ? <p className="mt-2 text-xs text-red-600">{inviteError}</p> : null}
        </section>
      ) : null}

      {actionError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </p>
      ) : null}

      {statistic ? (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatChip label="Tổng" value={statistic.totalMembers} />
          <StatChip label="Quản trị" value={statistic.adminCount} />
          <StatChip label="Trưởng nhóm" value={statistic.leadCount} />
          <StatChip label="Thành viên" value={statistic.memberCount + statistic.viewerCount} />
        </section>
      ) : null}

      <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <header className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <Users size={18} className="text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Danh sách thành viên</h3>
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {members.length}
          </span>
        </header>

        {sorted.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-400">Chưa có thành viên</p>
        ) : (
          <>
            <ul className="divide-y divide-slate-50">
              {pagedMembers.map((member) => {
                const user = memberUser(member);
                const name = displayName(member);
                const isSelf = String(user.userId) === String(currentUserId);
                const actorForKick = effectiveRole ?? myRole;
                const showKick =
                  !isSelf && canKickMember(actorForKick, member.role);
                const uid = memberUserId(member);
                const loadingRow = uid != null && actionLoading === uid;

                const rowMenuItems = [
                  ...(canManageRoles && !isSelf && uid != null
                    ? ([
                        {
                          id: "role-lead",
                          label: "Đặt Trưởng nhóm",
                          onClick: () => handleRoleChange(member, "LEAD"),
                        },
                        {
                          id: "role-member",
                          label: "Đặt Thành viên",
                          onClick: () => handleRoleChange(member, "MEMBER"),
                        },
                        {
                          id: "role-viewer",
                          label: "Đặt Người xem",
                          onClick: () => handleRoleChange(member, "VIEWER"),
                        },
                      ] as const)
                    : []),
                  ...(showKick
                    ? [
                        {
                          id: "kick",
                          label: "Kick khỏi dự án",
                          destructive: true,
                          onClick: () => handleKick(member),
                        },
                      ]
                    : []),
                ];

                return (
                  <li
                    key={member.projectMemberId}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"
                  >
                    <section className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar name={name} src={user.avatarUrl ?? undefined} size="md" />
                      <section className="min-w-0">
                        <p className="font-bold text-slate-900">
                          {name}
                          {isSelf ? (
                            <span className="ml-2 text-xs font-normal text-blue-600">(Bạn)</span>
                          ) : null}
                        </p>
                        {user.email ? (
                          <p className="flex items-center gap-1 text-xs text-slate-500">
                            <Mail size={12} />
                            {user.email}
                          </p>
                        ) : null}
                      </section>
                    </section>

                    <section className="flex flex-wrap items-center gap-2 sm:justify-end">
                      {canManageRoles && !isSelf && uid != null ? (
                        <section className="flex flex-col gap-1 sm:items-end">
                          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Phân quyền
                          </label>
                          <select
                            className="h-9 min-w-[8.5rem] rounded-lg border border-violet-200 bg-violet-50/50 px-2 text-xs font-semibold text-violet-900"
                            value={normalizeProjectRole(member.role) ?? "MEMBER"}
                            disabled={loadingRow}
                            onChange={(e) =>
                              handleRoleChange(member, e.target.value as ProjectRoleKey)
                            }
                          >
                            {(["OWNER", "LEAD", "MEMBER", "VIEWER"] as const).map((r) => (
                              <option key={r} value={r}>
                                {PROJECT_ROLE_LABELS[r]}
                              </option>
                            ))}
                          </select>
                        </section>
                      ) : (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold",
                            roleBadgeStyle(member.role)
                          )}
                        >
                          {roleIcon(member.role)}
                          {ROLE_LABELS[member.role] ?? member.role}
                        </span>
                      )}

                      {member.joinedAt ? (
                        <span className="hidden items-center gap-1 text-xs text-slate-400 lg:flex">
                          <Calendar size={12} />
                          {formatDate(member.joinedAt)}
                        </span>
                      ) : null}

                      {showKick ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1 rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                          disabled={loadingRow}
                          onClick={() => handleKick(member)}
                        >
                          <UserMinus size={14} />
                          Kick
                        </Button>
                      ) : null}

                      {rowMenuItems.length > 0 ? (
                        <ActionMenuDropdown
                          icon="vertical"
                          items={[...rowMenuItems]}
                          buttonClassName="border border-slate-200"
                        />
                      ) : null}
                    </section>
                  </li>
                );
              })}
            </ul>
            <ListPagination
              page={memberPage}
              totalPages={memberTotalPages}
              totalElements={sorted.length}
              pageSize={MEMBER_PAGE_SIZE}
              hasPrevious={memberPage > 0}
              hasNext={memberPage < memberTotalPages - 1}
              onPageChange={setMemberPage}
            />
          </>
        )}
      </article>

      <DeleteConfirmDialog
        open={deleteConfirm.open}
        title={deleteConfirm.request?.title ?? ""}
        description={deleteConfirm.request?.description}
        details={deleteConfirm.request?.details}
        confirmLabel={deleteConfirm.request?.confirmLabel}
        loading={deleteConfirm.loading}
        errorMessage={deleteConfirm.errorMessage}
        onConfirm={deleteConfirm.confirm}
        onCancel={deleteConfirm.close}
      />
    </section>
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
