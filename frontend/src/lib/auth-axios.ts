import axios from "axios";

/** Gọi trực tiếp backend — chỉ dùng cho auth (login, register, ...) khi chưa có session. */
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const authAxios = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default authAxios;
