// Localit Mobile‑First UI Kit — responsive, touch‑friendly components
// Assumes Tailwind v4 with @tailwindcss/vite. No external deps.
// Save as: src/pages/MobileFirstDemo.tsx and route to "/m-demo" for a live preview.

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Empty from "@/components/ui/Empty";


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
      {/* <div className="sm:hidden fixed right-4 bottom-24">
        <Button size="lg" className="shadow-xl">
          + 새 이벤트
        </Button>
      </div> */}

   
    </div>
  );
}
