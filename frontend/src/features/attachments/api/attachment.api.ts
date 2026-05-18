import axiosClient from "@/src/lib/axios";
import type { ApiResponse, Attachment } from "@/src/types/api.types";

const BASE = "/api/v1";

export const attachmentApi = {
  getByEntity: (entityType: "tasks" | "projects" | "comments", entityId: number) =>
    axiosClient.get<ApiResponse<Attachment[]>>(`${BASE}/${entityType}/${entityId}/attachments`),
};
