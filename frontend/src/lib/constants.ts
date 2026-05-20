export const TASK_STATUSES = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",
} as const;

export const STATUS_LABELS: Record<string, string> = {
  Todo: "Chờ làm",
  "In Progress": "Đang làm",
  Review: "Đang review",
  Done: "Hoàn thành",
};

export const PRIORITY_LABELS: Record<number, string> = {
  1: "Thấp",
  2: "Trung bình",
  3: "Cao",
};

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  SYSTEM: "Hệ thống",
  TASK_ASSIGNED: "Giao việc",
  TASK_UPDATED: "Cập nhật task",
  COMMENT: "Bình luận",
  PROJECT: "Dự án",
};

export const TASK_STATUS_OPTIONS = [
  { value: "Todo", label: "Chờ làm" },
  { value: "In Progress", label: "Đang làm" },
  { value: "Review", label: "Đang review" },
  { value: "Done", label: "Hoàn thành" },
] as const;

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  ON_HOLD: "Tạm dừng",
  COMPLETED: "Hoàn thành",
  ARCHIVED: "Lưu trữ",
};

export const NAVY_SIDEBAR = "#0B1F3A";
export const NAVY_SIDEBAR_LIGHT = "#1E3A5F";
export const PRIMARY_BLUE = "#2563EB";
export const PAGE_BG = "#F8FAFC";

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: boolean;
};

export const USER_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/projects", label: "Dự Án", icon: "FolderKanban" },
  { href: "/tasks", label: "Tất Cả Tác Vụ", icon: "ListTodo" },
  { href: "/calendar", label: "Lịch", icon: "Calendar" },
  { href: "/reports", label: "Báo Cáo", icon: "BarChart3" },
  { href: "/team", label: "Team", icon: "Users" },
  { href: "/notifications", label: "Thông Báo", icon: "Bell", badge: true },
  { href: "/profile", label: "Hồ Sơ", icon: "User" },
  { href: "/about", label: "Giới Thiệu", icon: "Info" },
  { href: "/contact", label: "Liên Hệ", icon: "Mail" },
  { href: "/help", label: "Trợ Giúp", icon: "HelpCircle" },
];

export const ADMIN_NAV = [
  { href: "/admin", label: "Tổng quan", icon: "LayoutDashboard" },
  { href: "/admin/users", label: "Quản lý User", icon: "Users" },
  { href: "/admin/projects", label: "Quản lý Dự án", icon: "FolderKanban" },
  { href: "/admin/tasks", label: "Quản lý Task", icon: "ListTodo" },
  { href: "/admin/notifications", label: "Thông báo", icon: "Bell" },
  { href: "/admin/logs", label: "System Logs", icon: "ScrollText" },
  { href: "/admin/settings", label: "Cài đặt hệ thống", icon: "Settings" },
] as const;
