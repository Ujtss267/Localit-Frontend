// Localit Mobile‑First UI Kit — responsive, touch‑friendly components
// Assumes Tailwind v4 with @tailwindcss/vite. No external deps.
// Save as: src/pages/MobileFirstDemo.tsx and route to "/m-demo" for a live preview.

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

/* ───────────────────── Primitives ───────────────────── */
export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-2xl transition active:scale-[.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
  const sizes = {
    sm: "h-10 px-3 text-[15px]",
    md: "h-11 px-4 text-[15px]",
    lg: "h-12 px-5 text-base",
  } as const;
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600 ring-offset-white dark:ring-offset-neutral-950",
    secondary: "bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:ring-neutral-900 ring-offset-white dark:ring-offset-neutral-950",
    ghost: "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200",
    outline: "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200",
  } as const;
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full h-11 px-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full h-11 px-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-600 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Card({ className = "", children }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/80 backdrop-blur p-4 sm:p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "green" | "rose" | "neutral" }) {
  const tones: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    green: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    neutral: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
  };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Empty({ title = "내용이 없습니다", desc = "조건을 바꾸어 다시 시도해 보세요." }) {
  return (
    <div className="text-center py-14 border rounded-3xl border-dashed">
      <div className="text-3xl mb-2">🗂️</div>
      <div className="text-base sm:text-lg font-semibold">{title}</div>
      <div className="text-sm text-neutral-500 mt-1">{desc}</div>
    </div>
  );
}

/* ───────────────────── Layout ───────────────────── */
function TopNav() {
  return (
    <div className="sticky top-0 z-30 backdrop-blur bg-white/75 dark:bg-neutral-950/60 border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-5 text-[15px]">
          <Link to="/" className="font-semibold tracking-tight">
            Localit
          </Link>
          <div className="hidden sm:flex items-center gap-4 text-neutral-600 dark:text-neutral-300">
            <Link to="/events" className="hover:text-neutral-900 dark:hover:text-white">
              이벤트
            </Link>
            <Link to="/mentoring" className="hover:text-neutral-900 dark:hover:text-white">
              멘토링
            </Link>
            <Link to="/rooms" className="hover:text-neutral-900 dark:hover:text-white">
              공간
            </Link>
            <Link to="/my" className="hover:text-neutral-900 dark:hover:text-white">
              마이
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden sm:inline-flex">
            도움말
          </Button>
          <Button size="sm">로그인</Button>
        </div>
      </div>
    </div>
  );
}

function BottomTab() {
  // iOS safe‑area padding
  const style = { paddingBottom: "max(8px, env(safe-area-inset-bottom))" } as React.CSSProperties;
  const item = "flex flex-col items-center justify-center gap-1 h-12 flex-1 text-[11px] text-neutral-600 dark:text-neutral-300";
  const icon = "w-5 h-5";
  return (
    <nav
      style={style}
      className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-neutral-950/80 backdrop-blur border-t border-neutral-200 dark:border-neutral-800"
    >
      <div className="flex">
        <Link to="/events" className={`${item}`}>
          <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 2v4M16 2v4M3 10h18M5 8h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z" />
          </svg>
          <span>홈</span>
        </Link>
        <Link to="/events" className={`${item}`}>
          <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 2v4M16 2v4M3 10h18M5 8h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z" />
          </svg>
          <span>이벤트</span>
        </Link>
        <Link to="/mentoring" className={`${item}`}>
          <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm7 10v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          </svg>
          <span>멘토링</span>
        </Link>
        <Link to="/my" className={`${item}`}>
          <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 7l-8-4-8 4 8 4 8-4z" />
            <path d="M4 11l8 4 8-4" />
            <path d="M4 15l8 4 8-4" />
          </svg>
          <span>마이</span>
        </Link>
      </div>
    </nav>
  );
}

/* ───────────────────── Event UI ───────────────────── */
function EventCardPretty({ e }: { e: { id: number; title: string; description: string; location: string; startTime: string; capacity: number } }) {
  const date = new Date(e.startTime);
  return (
    <Card className="group relative overflow-hidden">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/30 blur-2xl group-hover:scale-110 transition" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[17px] sm:text-lg font-semibold tracking-tight">{e.title}</h3>
          <div className="mt-1 text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-400">
            {date.toLocaleString()} · 📍 {e.location}
          </div>
        </div>
        <Badge tone="blue">정원 {e.capacity}명</Badge>
      </div>
      <p className="mt-3 text-[13px] sm:text-sm text-neutral-800 dark:text-neutral-200 line-clamp-2">{e.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <Link to={`/events/${e.id}`} className="text-[13px] sm:text-sm font-medium text-blue-700 hover:underline dark:text-blue-300">
          자세히 보기 →
        </Link>
        <Button size="sm">참가하기</Button>
      </div>
    </Card>
  );
}

function FilterBar({ onChange }: { onChange: (p: Record<string, string>) => void }) {
  const [open, setOpen] = useState(false); // mobile accordion
  const [kw, setKw] = useState("");
  const [loc, setLoc] = useState("");
  const [cat, setCat] = useState("");
  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (kw) p.q = kw;
    if (loc) p.location = loc;
    if (cat) p.categoryId = cat;
    return p;
  }, [kw, loc, cat]);

  return (
    <Card>
      {/* Header (mobile friendly) */}
      <div className="flex items-center justify-between sm:mb-3">
        <div className="font-semibold">필터</div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setKw("");
              setLoc("");
              setCat("");
              onChange({});
            }}
          >
            초기화
          </Button>
          <Button variant="outline" size="sm" className="sm:hidden" onClick={() => setOpen((v) => !v)}>
            {open ? "접기" : "펼치기"}
          </Button>
        </div>
      </div>

      {/* Fields */}
      <div className={`grid gap-3 sm:grid-cols-4 ${open ? "grid" : "hidden sm:grid"}`}>
        <Input placeholder="검색어" value={kw} onChange={(e) => setKw(e.target.value)} />
        <Input placeholder="지역 (예: 서울, 부산)" value={loc} onChange={(e) => setLoc(e.target.value)} />
        <Select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">카테고리 전체</option>
          <option value="1">강연</option>
          <option value="2">체육</option>
          <option value="3">공연</option>
        </Select>
        <Button onClick={() => onChange(params)} className="sm:mt-0">
          필터 적용
        </Button>
      </div>
    </Card>
  );
}

/* ───────────────────── Page (Preview) ───────────────────── */
export default function MobileFirstDemo() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const sample = useMemo(
    () => [
      {
        id: 1,
        title: "로컬 스터디 모임",
        description: "프론트엔드 입문자 대상 로컬 스터디. 리액트/타입스크립트 기초.",
        location: "서울 마포",
        startTime: new Date().toISOString(),
        capacity: 20,
      },
      {
        id: 2,
        title: "주말 농구 번개",
        description: "초급~중급 레벨 환영. 체육관 대관 완료.",
        location: "부산 진구",
        startTime: new Date().toISOString(),
        capacity: 12,
      },
      {
        id: 3,
        title: "주말 버스킹 공연",
        description: "지역 아마추어 뮤지션들과 함께하는 소규모 공연.",
        location: "대구 동성로",
        startTime: new Date().toISOString(),
        capacity: 60,
      },
    ],
    []
  );

  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900 text-neutral-900 dark:text-neutral-100 pb-20">
      <TopNav />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">이벤트 둘러보기</h1>
            <p className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">모바일에서도 쾌적하게 찾아보세요.</p>
          </div>
          <Button variant="outline" className="hidden sm:inline-flex">
            이벤트 생성
          </Button>
        </div>

        <FilterBar onChange={(p) => setFilters(p)} />
        {Object.keys(filters).length > 0 && (
          <div className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-400">적용된 필터: {JSON.stringify(filters)}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {sample.map((e) => (
            <EventCardPretty key={e.id} e={e} />
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-[13px] sm:text-sm text-neutral-500">총 {sample.length}개</div>
          <div className="flex gap-2">
            <Button variant="ghost">이전</Button>
            <Button variant="ghost">다음</Button>
          </div>
        </div>
      </div>

      {/* Floating Action (mobile) */}
      <div className="sm:hidden fixed right-4 bottom-24">
        <Button size="lg" className="shadow-xl">
          + 새 이벤트
        </Button>
      </div>

      <BottomTab />
    </div>
  );
}
