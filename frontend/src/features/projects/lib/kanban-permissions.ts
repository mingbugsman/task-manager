/** Admin dự án, Lead hoặc Admin hệ thống được kéo thả trên Kanban. */
export function canUseKanbanDragDrop(options: {
  isSystemAdmin?: boolean;
  projectRole?: string | null;
  isProjectManager?: boolean;
}): boolean {
  if (options.isSystemAdmin) return true;

  const role = (options.projectRole ?? "").trim().toUpperCase();
  if (role === "ADMIN" || role === "LEAD") return true;

  if (options.isProjectManager) return true;

  return false;
}
