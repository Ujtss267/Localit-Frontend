// src/lib/storage.ts
export const tokenKey = "localit_token";

export const getToken = () => localStorage.getItem(tokenKey);
export const setToken = (t: string) => localStorage.setItem(tokenKey, t);
export const clearToken = () => localStorage.removeItem(tokenKey);
