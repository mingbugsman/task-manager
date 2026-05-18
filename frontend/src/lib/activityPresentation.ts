import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  CheckSquare,
  MessageCircle,
  Paperclip,
  Rocket,
  UserPlus,
  Zap,
} from "lucide-react";
import { STATUS_LABELS } from "@/src/lib/constants";
import type { ActivityLog } from "@/src/types/api.types";

export type ActivityKind =
  | "comment"
  | "complete"
  | "upload"
  | "reaction"
  | "member"
  | "status"
  | "generic";

export interface ActivityPresentation {
  kind: ActivityKind;
  verb: string;
  targetLabel: string;
  targetHref?: string;
  trailing?: string;
  detail?: string;
  icon: LucideIcon;
  iconClassName: string;
}

const STATUS_VALUE_MAP: Record<string, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",
  Todo: "Todo",
  "In Progress": "In Progress",
};

function parseMetadata(metadata?: string): Record<string, unknown> {
  if (!metadata?.trim()) return {};
  try {
    return JSON.parse(metadata) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function str(meta: Record<string, unknown>, key: string): string | undefined {
  const v = meta[key];
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function formatStatusLabel(raw?: string): string {
  if (!raw) return "—";
  const normalized = STATUS_VALUE_MAP[raw] ?? raw;
  return STATUS_LABELS[normalized] ?? normalized;
}

function taskHref(taskId?: number): string | undefined {
  return taskId ? `/tasks/${taskId}` : undefined;
}

function projectHref(projectId?: number): string | undefined {
  return projectId ? `/projects/${projectId}` : undefined;
}

/** Nếu action đã là câu tiếng Việt (dữ liệu cũ), dùng trực tiếp làm verb. */
function isDescriptiveAction(action: string): boolean {
  return /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(action);
}

export function presentActivity(activity: ActivityLog): ActivityPresentation {
  const meta = parseMetadata(activity.metadata);
  const action = activity.action?.toUpperCase() ?? "";
  const entity = activity.entityType?.toUpperCase() ?? "";
  const taskId = Number(str(meta, "taskId") ?? activity.entityId);
  const taskName = str(meta, "taskName");
  const projectName = str(meta, "projectName");
  const fileName = str(meta, "fileName");
  const commentPreview = str(meta, "commentPreview");
  const field = str(meta, "field");
  const oldValue = str(meta, "oldValue");
  const newValue = str(meta, "newValue");
  const reaction = str(meta, "reaction") ?? str(meta, "emoji");
  const targetUserName = str(meta, "targetUserName") ?? str(meta, "memberName");

  if (isDescriptiveAction(activity.action)) {
    return {
      kind: "generic",
      verb: activity.action,
      targetLabel: taskName ?? projectName ?? "",
      targetHref: taskHref(taskId) ?? projectHref(activity.projectId),
      detail: commentPreview ?? fileName,
      icon: Zap,
      iconClassName: "text-blue-500",
    };
  }

  if (entity === "COMMENT" && (action === "CREATE" || action === "UPDATE")) {
    return {
      kind: "comment",
      verb: "đã bình luận vào",
      targetLabel: taskName ?? "tác vụ",
      targetHref: taskHref(taskId),
      detail: commentPreview,
      icon: MessageCircle,
      iconClassName: "text-slate-400",
    };
  }

  if (entity === "ATTACHMENT" && action === "UPLOAD") {
    return {
      kind: "upload",
      verb: "đã tải lên file vào",
      targetLabel: taskName ?? "tác vụ",
      targetHref: taskHref(taskId),
      detail: fileName,
      icon: Paperclip,
      iconClassName: "text-slate-400",
    };
  }

  if (entity === "TASK" && action === "UPDATE" && field === "status") {
    const done = newValue === "DONE" || newValue === "Done";
    if (done) {
      return {
        kind: "complete",
        verb: "đã hoàn thành",
        targetLabel: taskName ?? "tác vụ",
        targetHref: taskHref(activity.entityId),
        icon: CheckSquare,
        iconClassName: "text-emerald-500",
      };
    }
    return {
      kind: "status",
      verb: "đã cập nhật trạng thái",
      targetLabel: taskName ?? "tác vụ",
      targetHref: taskHref(activity.entityId),
      detail: `${formatStatusLabel(oldValue)} → ${formatStatusLabel(newValue)}`,
      icon: ArrowLeftRight,
      iconClassName: "text-blue-500",
    };
  }

  if (entity === "TASK" && (action === "COMPLETE" || newValue === "DONE" || newValue === "Done")) {
    return {
      kind: "complete",
      verb: "đã hoàn thành",
      targetLabel: taskName ?? "tác vụ",
      targetHref: taskHref(activity.entityId),
      icon: CheckSquare,
      iconClassName: "text-emerald-500",
    };
  }

  if (action === "REACT" || reaction) {
    return {
      kind: "reaction",
      verb: `đã react ${reaction ?? "🚀"} vào`,
      targetLabel: targetUserName ? `comment của ${targetUserName}` : "bình luận",
      targetHref: taskHref(taskId),
      icon: Rocket,
      iconClassName: "text-orange-500",
    };
  }

  if (
    (entity === "USER" || entity === "PROJECT") &&
    (action === "CREATE" || action === "ADD" || action === "JOIN")
  ) {
    return {
      kind: "member",
      verb: entity === "USER" ? "đã được thêm vào" : "đã thêm thành viên vào",
      targetLabel: projectName ?? taskName ?? "dự án",
      targetHref: projectHref(activity.projectId ?? activity.entityId),
      icon: UserPlus,
      iconClassName: "text-slate-400",
    };
  }

  if (entity === "TASK" && action === "CREATE") {
    return {
      kind: "generic",
      verb: "đã tạo tác vụ",
      targetLabel: taskName ?? "tác vụ mới",
      targetHref: taskHref(activity.entityId),
      icon: Zap,
      iconClassName: "text-blue-500",
    };
  }

  if (entity === "TASK" && action === "UPDATE") {
    return {
      kind: "generic",
      verb: "đã cập nhật",
      targetLabel: taskName ?? "tác vụ",
      targetHref: taskHref(activity.entityId),
      detail:
        oldValue && newValue ? `${formatStatusLabel(oldValue)} → ${formatStatusLabel(newValue)}` : undefined,
      icon: ArrowLeftRight,
      iconClassName: "text-blue-500",
    };
  }

  const ACTION_VERB: Record<string, string> = {
    CREATE: "đã tạo",
    UPDATE: "đã cập nhật",
    UPLOAD: "đã tải lên",
    DELETE: "đã xóa",
    LOGIN: "đã đăng nhập",
  };

  const fallbackTarget =
    taskName ?? projectName ?? (entity === "TASK" ? `Tác vụ #${activity.entityId}` : "mục tiêu");

  return {
    kind: "generic",
    verb: ACTION_VERB[action] ?? "đã thao tác với",
    targetLabel: fallbackTarget,
    targetHref:
      entity === "TASK"
        ? taskHref(activity.entityId)
        : entity === "PROJECT"
          ? projectHref(activity.entityId)
          : undefined,
    icon: Zap,
    iconClassName: "text-blue-500",
  };
}

export function shouldShowInFeed(activity: ActivityLog): boolean {
  const action = activity.action?.toUpperCase() ?? "";
  return action !== "LOGIN";
}
