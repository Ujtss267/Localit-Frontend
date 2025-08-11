// src/features/auth/pages/SignupPage.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { signup } from "@/features/auth/api";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await signup({ email, password });
    alert("회원가입 완료. 로그인해주세요.");
  };

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-3">
      <h1 className="text-2xl font-semibold">회원가입</h1>
      <input className="w-full border rounded px-3 py-2" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input
        className="w-full border rounded px-3 py-2"
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="w-full bg-neutral-900 text-white rounded py-2">회원가입</button>
    </form>
  );
}
