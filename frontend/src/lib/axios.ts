import axios from "axios";
import { signOut } from "next-auth/react";

/**
 * API đã đăng nhập: đi qua Next.js proxy (/api/proxy/...).
 * Server đọc session cookie và gắn Bearer token — tránh lỗi getSession() không có token.
 */
const axiosClient = axios.create({
  baseURL: "/api/proxy",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await signOut({ callbackUrl: "/login" });
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
