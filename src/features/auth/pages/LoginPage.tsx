// src/features/auth/pages/LoginPage.tsx
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      // 로그인 전 이동하려던 곳으로 복귀 (있다면)
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "로그인에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-5">
      {/* 상단 바 */}
      <div className="flex items-center h-12">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full active:scale-95"
        >
          {/* ← 아이콘 */}
          <svg width="20" height="20" viewBox="0 0 24 24" className="text-black">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-xl font-semibold tracking-wide">LOGIN</h1>
        <span className="w-8" />
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {/* 이메일 */}
        <div className="rounded border px-3 py-2">
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            placeholder="이메일"
            autoComplete="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* 비밀번호 + 보이기 토글 */}
        <div className="rounded border px-3 py-2 flex items-center">
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            type={showPw ? "text" : "password"}
            placeholder="비밀번호"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" onClick={() => setShowPw((v) => !v)} className="ml-2 text-xs text-gray-500">
            {showPw ? "숨김" : "표시"}
          </button>
        </div>

        {/* 에러 */}
        {error && <p className="text-xs text-red-600">{error}</p>}

        {/* //{ 로그인 버튼 (검정) }
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-black py-3 text-center text-sm font-medium text-white active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? "로그인 중..." : "로그인하기"}
        </button> */}

        {/* 로그인 버튼 */}
        <Button type="submit" variant="solid" className="w-full py-3" disabled={submitting}>
          {submitting ? "로그인 중..." : "로그인하기"}
        </Button>
      </form>

      {/* SNS 로그인 (데모: 클릭 핸들러만) */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">SNS계정으로 로그인하기</p>
        <div className="mt-3 flex items-center justify-center gap-4">
          <SNSCircle label="N" bg="#1EC800" onClick={() => alert("네이버 로그인 연결")} />
          <SNSCircle label="K" bg="#FEE500" fg="#000" onClick={() => alert("카카오 로그인 연결")} />
          <SNSCircle label="F" bg="#1877F2" onClick={() => alert("페이스북 로그인 연결")} />
          <SNSCircle label="G" bg="#000000" onClick={() => alert("애플 로그인 연결")} />
        </div>
      </div>

      {/* 간편가입 (아웃라인 pill) */}
      <div className="mt-6">
        <Link to="/signup" className="block w-full rounded-full border py-3 text-center text-sm active:scale-[0.98]">
          계정이 없으신가요? 간편가입하기
        </Link>
      </div>

      {/* 하단 보조 링크 */}
      <div className="mt-6 grid grid-cols-2 border-t pt-4 text-center text-xs text-gray-500">
        <Link to="/find-id" className="hover:underline">
          아이디(이메일) 찾기
        </Link>
        <Link to="/find-password" className="hover:underline">
          비밀번호 찾기
        </Link>
      </div>

      {/* 푸터 안내문 */}
      <div className="mt-3 text-center">
        <p className="text-[11px] text-gray-400">2018년 2월 이전 비회원 주문조회 &gt;</p>
      </div>

      {/* 하단 안전영역 (모바일 홈인디케이터 여백 느낌) */}
      <div className="h-6" />
    </div>
  );
}

/** 원형 SNS 아이콘 버튼 (간단 텍스트 버전) */
function SNSCircle({ label, bg, fg = "#fff", onClick }: { label: string; bg: string; fg?: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{ backgroundColor: bg, color: fg }}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold shadow-sm active:scale-95"
    >
      {label}
    </button>
  );
}
