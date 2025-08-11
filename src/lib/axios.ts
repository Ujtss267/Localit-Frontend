// src/lib/axios.ts
import axios from "axios";
import { getToken, clearToken } from "./storage";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearToken();
      // 여기서 바로 라우팅까지 하지 말고, 상위 AuthProvider에서 감지하도록 둡니다.
    }
    return Promise.reject(err);
  }
);
