export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface PageResponse<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  items: T[];
}

export interface UserSummary {
  userId: number;
  userName: string;
  avatarUrl?: string;
  email?: string;
}

export interface UserDetail {
  userId: string;
  userName: string;
  email: string;
  avatarUrl?: string;
  status: string;
  enabled: boolean;
}

export interface UserListItem {
  userId: string;
  userName: string;
  email: string;
  status: string;
  enabled: boolean;
}

export type ProjectStatus = "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";

export interface ProjectSummary {
  projectId: number;
  projectName: string;
  projectDescription?: string;
  status: ProjectStatus;
  createdBy?: number;
  createdByUsername?: string;
  createdAt?: string;
  updatedAt?: string;
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  progressRate: number;
  memberCount: number;
  memberAvatarUrls?: string[];
}

export interface ProjectOverallStats {
  totalProjects: number;
  totalTasks: number;
  totalInProgress: number;
  avgProgressRate: number;
}

export interface ProjectDetail {
  projectId: number;
  projectName: string;
  projectDescription?: string;
  status: ProjectStatus;
  createdBy?: number;
  createdByUsername?: string;
  updatedBy?: number;
  updatedByUsername?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BoardTask {
  taskId: number;
  taskName: string;
  priority: number;
  dueDate?: string;
  assigneeId?: number;
  assigneeUsername?: string;
  assigneeAvatarUrl?: string;
  labels?: string[];
}

export interface BoardColumn {
  status: string;
  displayName: string;
  taskCount: number;
  tasks: BoardTask[];
}

export interface BoardData {
  projectId: number;
  projectName: string;
  columns: BoardColumn[];
}

export interface ProjectMember {
  projectMemberId: number;
  projectId: number;
  user: UserSummary;
  role: string;
  isManager: boolean;
  joinedAt?: string;
}

export interface MemberStatistic {
  totalMembers: number;
  adminCount: number;
  leadCount: number;
  memberCount: number;
  viewerCount: number;
}

export interface LabelSummary {
  labelId: number;
  labelName: string;
  colorCode?: string;
}

export interface TaskDetail {
  taskId: number;
  projectId: number;
  projectName: string;
  taskName: string;
  taskDescription?: string;
  priority: number;
  status: string;
  assignee?: UserSummary;
  reporter?: UserSummary;
  updatedBy?: UserSummary;
  dueAt?: string;
  createdAt?: string;
  updatedAt?: string;
  labels?: LabelSummary[];
}

export interface Comment {
  commentId: number;
  taskId: number;
  author?: UserSummary;
  content: string;
  parentId?: number;
  replyCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Attachment {
  attachmentId: number;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  entityType?: string;
  entityId?: number;
  uploadedBy?: number;
  createdAt?: string;
}

export interface TaskSummary {
  taskId: number;
  taskName: string;
  priority: number;
  status: string;
  assignee?: UserSummary;
  dueAt?: string;
  labels?: LabelSummary[];
}

export interface TaskStatistic {
  projectId: number;
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  overdueCount: number;
}

export interface ActivityLog {
  activityLogId: number;
  userId: number;
  userName: string;
  avatarUrl?: string;
  action: string;
  entityType: string;
  entityId: number;
  metadata?: string;
  projectId?: number;
  createdAt: string;
}

export interface NotificationItem {
  notificationId: number;
  title: string;
  message: string;
  type: string;
  entityType?: string;
  entityId?: number;
  isRead: boolean;
  createdAt: string;
}
