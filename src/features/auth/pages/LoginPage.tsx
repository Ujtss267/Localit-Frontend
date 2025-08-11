// src/features/auth/pages/LoginPage.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@/app/providers/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-3">
      <h1 className="text-2xl font-semibold">로그인</h1>
      <input className="w-full border rounded px-3 py-2" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input
        className="w-full border rounded px-3 py-2"
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="w-full bg-blue-600 text-white rounded py-2">로그인</button>
    </form>
  );
}
