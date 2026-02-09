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
  const canGoBack = typeof window !== "undefined" && window.history.length > 1;

  const onBack = () => {
    if (canGoBack) {
      navigate(-1);
      return;
    }
    navigate("/events", { replace: true });
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      // 로그인 전 이동하려던 곳으로 복귀 (있다면)
      const state = location.state as { from?: { pathname?: string } } | null;
      const from = state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "로그인에 실패했습니다.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#0b1220] text-neutral-100 [font-family:'Pretendard','SUIT Variable','Noto Sans KR',system-ui,sans-serif]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 -top-20 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -right-20 top-24 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/15 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md px-4 pb-10 pt-6 sm:pt-10">
        <div className="mb-4 flex items-center">
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로가기"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 hover:bg-white/10 active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="text-white">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/[0.06] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-6">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Welcome Back</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Localit 로그인</h1>
            <p className="mt-2 text-xs sm:text-sm text-neutral-300">이벤트와 공간 관리를 계속하려면 로그인해 주세요.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-3.5">
            <label className="block">
              <span className="mb-1.5 block text-xs text-neutral-300">이메일</span>
              <input
                placeholder="name@example.com"
                autoComplete="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/20 bg-black/20 px-3 text-sm text-white placeholder:text-neutral-400 outline-none transition focus:border-cyan-300/80 focus:ring-2 focus:ring-cyan-300/30"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs text-neutral-300">비밀번호</span>
              <div className="flex h-11 items-center rounded-xl border border-white/20 bg-black/20 px-3 focus-within:border-cyan-300/80 focus-within:ring-2 focus-within:ring-cyan-300/30">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-full w-full bg-transparent text-sm text-white placeholder:text-neutral-400 outline-none"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="ml-2 text-xs text-cyan-100/80 hover:text-cyan-100">
                  {showPw ? "숨김" : "표시"}
                </button>
              </div>
            </label>

            {error && <p className="rounded-lg border border-rose-400/40 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">{error}</p>}

            <Button type="submit" variant="primary" className="!mt-4 w-full !h-11 text-sm" disabled={submitting}>
              {submitting ? "로그인 중..." : "로그인하기"}
            </Button>
          </form>

          <div className="mt-5">
            <p className="text-center text-xs text-neutral-400">또는 SNS 계정으로 시작하기</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <SNSLoginButton provider="naver" onClick={() => alert("네이버 로그인 연결")} />
              <SNSLoginButton provider="kakao" onClick={() => alert("카카오 로그인 연결")} />
              <SNSLoginButton provider="google" onClick={() => alert("구글 로그인 연결")} />
              <SNSLoginButton provider="facebook" onClick={() => alert("페이스북 로그인 연결")} />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/15 bg-black/20 p-3">
            <Link to="/signup" className="block w-full rounded-xl border border-white/20 py-2.5 text-center text-sm hover:bg-white/5 active:scale-[0.99]">
              계정이 없으신가요? 간편가입하기
            </Link>

            <div className="mt-3 grid grid-cols-2 text-center text-xs text-neutral-400">
              <Link to="/find-id" className="hover:text-neutral-200">
                아이디 찾기
              </Link>
              <Link to="/find-password" className="hover:text-neutral-200">
                비밀번호 찾기
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-[11px] text-neutral-400">2018년 2월 이전 비회원 주문조회 &gt;</div>
      </div>
    </div>
  );
}

type Provider = "naver" | "kakao" | "google" | "facebook";

function SNSLoginButton({ provider, onClick }: { provider: Provider; onClick?: () => void }) {
  const meta = {
    naver: { label: "네이버", iconBg: "#03C75A", iconFg: "#fff" },
    kakao: { label: "카카오", iconBg: "#FEE500", iconFg: "#1f1f1f" },
    google: { label: "구글", iconBg: "#ffffff", iconFg: "#1f1f1f" },
    facebook: { label: "페이스북", iconBg: "#1877F2", iconFg: "#fff" },
  }[provider];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${meta.label} 로그인`}
      className="group inline-flex h-11 items-center rounded-xl border border-white/15 bg-white/5 px-2.5 transition hover:bg-white/10 active:scale-[0.99]"
    >
      <span
        style={{ backgroundColor: meta.iconBg, color: meta.iconFg }}
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold shadow-sm"
      >
        <BrandIcon provider={provider} />
      </span>
      <span className="ml-2 text-xs text-neutral-200 group-hover:text-white">{meta.label}</span>
    </button>
  );
}

function BrandIcon({ provider }: { provider: Provider }) {
  if (provider === "kakao") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 4C7 4 3 7 3 10.8c0 2.4 1.6 4.5 4 5.7L6 20l4.3-2.6c.6.1 1.1.1 1.7.1 5 0 9-3 9-6.7S17 4 12 4z" />
      </svg>
    );
  }
  if (provider === "facebook") return <span className="text-[13px] font-black leading-none">f</span>;
  if (provider === "google") return <span className="text-[13px] font-black leading-none text-[#4285F4]">G</span>;
  return <span className="text-[12px] font-black leading-none">N</span>;
}
