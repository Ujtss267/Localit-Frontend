import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "@/features/auth/api";
import Button from "@/components/ui/Button";

export default function SignupPage() {
  const navigate = useNavigate();
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
    navigate("/login", { replace: true });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signup({ email, password });
      alert("회원가입 완료. 로그인해주세요.");
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "회원가입에 실패했습니다.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

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
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Create Account</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Localit 회원가입</h1>
            <p className="mt-2 text-xs sm:text-sm text-neutral-300">이메일과 비밀번호로 새 계정을 만들 수 있어요.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-3.5">
            <label className="block">
              <span className="mb-1.5 block text-xs text-neutral-300">이메일</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
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
                  autoComplete="new-password"
                  placeholder="8자 이상 권장"
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
              {submitting ? "가입 중..." : "회원가입"}
            </Button>
          </form>

          <div className="mt-5 rounded-2xl border border-white/15 bg-black/20 p-3 text-center">
            <p className="text-xs text-neutral-400">이미 계정이 있으신가요?</p>
            <Link to="/login" className="mt-2 block rounded-xl border border-white/20 py-2.5 text-sm hover:bg-white/5 active:scale-[0.99]">
              로그인으로 이동
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
