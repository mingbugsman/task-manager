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
  userId?: number | null;
  userName?: string | null;
  avatarUrl?: string | null;
  email?: string | null;
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
  /** Field phẳng từ API (đồng bộ với user) */
  userId?: number | null;
  userName?: string | null;
  userEmail?: string | null;
  userAvatarUrl?: string | null;
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

export interface TeamSharedProject {
  projectId: number;
  projectName: string;
  role: string;
}

export interface TeamCollaborator {
  userId: number;
  userName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  primaryRole: string;
  sharedProjectCount: number;
  activeTaskCount: number;
  sharedProjects: TeamSharedProject[];
}

export interface TeamOverview {
  collaboratorCount: number;
  projectCount: number;
  activeAssignedTaskCount: number;
}

export interface TeamDirectory {
  overview: TeamOverview;
  collaborators: TeamCollaborator[];
}

export type ReportPeriodKey = "WEEK" | "MONTH" | "QUARTER";

export interface PersonalReport {
  period: ReportPeriodKey;
  summary: {
    totalTasks: number;
    completionPercent: number;
    overdueCount: number;
    avgCompletionDays: number;
    totalTasksTrend: string;
    completionTrend: string;
    overdueTrend: string;
    avgDaysTrend: string;
  };
  activityTrend: {
    label: string;
    completedCount: number;
    createdCount: number;
  }[];
  statusDistribution: {
    status: string;
    label: string;
    count: number;
    percent: number;
    color: string;
  }[];
  projectProgress: {
    projectId: number;
    projectName: string;
    progressPercent: number;
    totalTasks: number;
    doneCount: number;
  }[];
  projectWorkload: {
    projectId: number;
    projectName: string;
    completedCount: number;
    inProgressCount: number;
  }[];
  priorityDistribution: {
    key: string;
    label: string;
    count: number;
    percent: number;
    color: string;
  }[];
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

export interface ProjectAnalytics {
  progressPercent: number;
  totalTasks: number;
  doneCount: number;
  inProgressCount: number;
  reviewCount: number;
  overdueCount: number;
  memberCount: number;
  avgTasksPerMember: number;
  progressOverTime: { label: string; value: number }[];
  statusDistribution: {
    status: string;
    label: string;
    count: number;
    percent: number;
    color: string;
  }[];
  memberPerformance: {
    userId: number;
    userName: string;
    avatarUrl?: string;
    assignedCount: number;
    completedCount: number;
  }[];
  monthlyTaskFlow: {
    label: string;
    createdCount: number;
    completedCount: number;
  }[];
  priorityDistribution: {
    key: string;
    label: string;
    count: number;
    color: string;
  }[];
  memberCompletions: {
    userId: number;
    userName: string;
    avatarUrl?: string;
    role: string;
    assignedCount: number;
    completedCount: number;
    completionPercent: number;
  }[];
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
