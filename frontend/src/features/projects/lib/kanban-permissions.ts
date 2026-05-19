import { normalizeProjectRole } from "@/src/features/projects/lib/project-permissions";

/** Bật chế độ kéo thả Kanban (OWNER/LEAD kéo mọi task; MEMBER chỉ kéo task của mình). */
export function canUseKanbanDragDrop(options: {
  isSystemAdmin?: boolean;
  projectRole?: string | null;
  isProjectManager?: boolean;
}): boolean {
  if (options.isSystemAdmin) return true;

  const r = normalizeProjectRole(options.projectRole);
  if (r === "OWNER" || r === "LEAD") return true;
  if (r === "MEMBER") return true;

  if (options.isProjectManager) return true;

  return false;
}
