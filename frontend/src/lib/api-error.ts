import axios from "axios";

/** Backend lỗi RFC 7807 (detail) hoặc ApiResponse (message). */
export function getApiErrorMessage(error: unknown, fallback = "Đã có lỗi xảy ra"): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  const data = error.response?.data;
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record.detail === "string" && record.detail.trim()) {
      return record.detail;
    }
    if (typeof record.message === "string" && record.message.trim()) {
      return record.message;
    }
    if (typeof record.title === "string" && record.title.startsWith("ERR_")) {
      return record.title;
    }
  }

  if (error.response?.status === 403) {
    return "Bạn không có quyền thực hiện thao tác này";
  }
  if (error.response?.status === 404) {
    return "Không tìm thấy tài nguyên";
  }

  return fallback;
}
