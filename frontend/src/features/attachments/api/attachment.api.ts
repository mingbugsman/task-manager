import axiosClient from "@/src/lib/axios";
import type { ApiResponse, Attachment } from "@/src/types/api.types";

const BASE = "/api/v1";

export type AttachmentEntityType = "tasks" | "projects" | "comments";

export const attachmentApi = {
  getByEntity: (entityType: AttachmentEntityType, entityId: number) =>
    axiosClient.get<ApiResponse<Attachment[]>>(`${BASE}/${entityType}/${entityId}/attachments`),

  upload: (entityType: AttachmentEntityType, entityId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return axiosClient.post<ApiResponse<Attachment>>(
      `${BASE}/${entityType}/${entityId}/attachments`,
      form,
      { headers: { "Content-Type": false as unknown as string } }
    );
  },

  delete: (attachmentId: number) =>
    axiosClient.delete<ApiResponse<void>>(`${BASE}/attachments/${attachmentId}`),

  downloadUrl: (attachmentId: number) => `/api/proxy/api/v1/attachments/${attachmentId}/download`,
};
