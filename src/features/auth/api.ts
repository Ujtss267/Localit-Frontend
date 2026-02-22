import { api } from "@/lib/axios";

export const signup = (dto: { email: string; password: string }) => api.post("/auth/signup", dto).then((r) => r.data);

export const login = (dto: { email: string; password: string }) => api.post("/auth/login", dto).then((r) => r.data); // { access_token }

export const getMe = () =>
  api.get("/auth/me").then((r) => {
    const payload = r.data;
    if (payload?.user) return payload.user;
    return payload;
  });
