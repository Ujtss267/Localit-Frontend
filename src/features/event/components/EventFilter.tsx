// src/features/event/components/EventFilter.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { EventListParams } from "../api";

/** datetime-local ⇄ ISO 헬퍼 */
function isoToLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
function localInputToIso(local?: string) {
  if (!local) return undefined;
  const d = new Date(local);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** 날짜 프리셋 유틸 */
function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function nextWeekendRange() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const satOffset = (6 - day + 7) % 7; // days to Saturday
  const sunOffset = (7 - day + 7) % 7; // days to Sunday (0→0)
  const sat = new Date(now);
  sat.setDate(now.getDate() + satOffset);
  const sun = new Date(now);
  sun.setDate(now.getDate() + sunOffset);
  return { start: startOfDay(sat), end: endOfDay(sun) };
}
function thisWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((day + 6) % 7));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return { start: startOfDay(mon), end: endOfDay(sun) };
}
function thisMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: startOfDay(start), end: endOfDay(end) };
}

type Props = {
  onChange: (p: EventListParams) => void;
  className?: string;
  debounceMs?: number;
};

export default function EventFilter({ onChange, className = "", debounceMs = 200 }: Props) {
  const [sp, setSp] = useSearchParams();

  // URL → state (초기값)
  const [categoryId, setCategoryId] = useState<string>(sp.get("categoryId") ?? "");
  const [location, setLocation] = useState<string>(sp.get("location") ?? "");
  const [startLocal, setStartLocal] = useState<string>(isoToLocalInput(sp.get("startTime") ?? undefined));
  const [endLocal, setEndLocal] = useState<string>(isoToLocalInput(sp.get("endTime") ?? undefined));

  // 뒤로/앞으로 등 URL 외부변경 동기화
  const isInternalUpdate = useRef(false);
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    setCategoryId(sp.get("categoryId") ?? "");
    setLocation(sp.get("location") ?? "");
    setStartLocal(isoToLocalInput(sp.get("startTime") ?? undefined));
    setEndLocal(isoToLocalInput(sp.get("endTime") ?? undefined));
  }, [sp]);

  // 파라미터 빌드
  const params: EventListParams = useMemo(() => {
    const p: EventListParams = {};
    const cid = Number(categoryId);
    if (categoryId && Number.isFinite(cid)) p.categoryId = cid;
    if (location) p.location = location.trim();
    const sIso = localInputToIso(startLocal);
    const eIso = localInputToIso(endLocal);
    if (sIso) p.startTime = sIso;
    if (eIso) p.endTime = eIso;
    return p;
  }, [categoryId, location, startLocal, endLocal]);

  // 디바운스 + URL 동기화 + 콜백
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(sp);
      ["categoryId", "location", "startTime", "endTime"].forEach((k) => next.delete(k));
      if (params.categoryId != null) next.set("categoryId", String(params.categoryId));
      if (params.location) next.set("location", params.location);
      if (params.startTime) next.set("startTime", params.startTime);
      if (params.endTime) next.set("endTime", params.endTime);

      const changed = next.toString() !== sp.toString();
      if (changed) {
        isInternalUpdate.current = true;
        setSp(next, { replace: true });
      }

      onChange(params);
    }, debounceMs);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, debounceMs, setSp, sp]);

  // --- UI ---

  /** 활성 필터 요약칩 */
  const activeChips: Array<{ key: string; label: string; onClear: () => void }> = [];
  if (categoryId) activeChips.push({ key: "categoryId", label: `카테고리 #${categoryId}`, onClear: () => setCategoryId("") });
  if (location) activeChips.push({ key: "location", label: `지역: ${location}`, onClear: () => setLocation("") });
  if (startLocal) activeChips.push({ key: "startTime", label: `시작: ${startLocal.replace("T", " ")}`, onClear: () => setStartLocal("") });
  if (endLocal) activeChips.push({ key: "endTime", label: `종료: ${endLocal.replace("T", " ")}`, onClear: () => setEndLocal("") });

  /** 날짜 프리셋 핸들러 */
  const applyPreset = (preset: "today" | "weekend" | "week" | "month") => {
    if (preset === "today") {
      const s = startOfDay();
      const e = endOfDay();
      setStartLocal(isoToLocalInput(s.toISOString()));
      setEndLocal(isoToLocalInput(e.toISOString()));
    } else if (preset === "weekend") {
      const { start, end } = nextWeekendRange();
      setStartLocal(isoToLocalInput(start.toISOString()));
      setEndLocal(isoToLocalInput(end.toISOString()));
    } else if (preset === "week") {
      const { start, end } = thisWeekRange();
      setStartLocal(isoToLocalInput(start.toISOString()));
      setEndLocal(isoToLocalInput(end.toISOString()));
    } else {
      const { start, end } = thisMonthRange();
      setStartLocal(isoToLocalInput(start.toISOString()));
      setEndLocal(isoToLocalInput(end.toISOString()));
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 상단 프리셋 바 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">빠른 선택:</span>
        <Button size="sm" variant="ghost" onClick={() => applyPreset("today")}>
          오늘
        </Button>
        <Button size="sm" variant="ghost" onClick={() => applyPreset("weekend")}>
          이번 주말
        </Button>
        <Button size="sm" variant="ghost" onClick={() => applyPreset("week")}>
          이번 주
        </Button>
        <Button size="sm" variant="ghost" onClick={() => applyPreset("month")}>
          이번 달
        </Button>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setCategoryId("");
              setLocation("");
              setStartLocal("");
              setEndLocal("");
            }}
          >
            초기화
          </Button>
        </div>
      </div>

      {/* 입력 그리드 */}
      <div className="grid gap-3 md:grid-cols-4">
        {/* categoryId */}
        <div className="relative">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">카테고리 ID</label>
          <Input
            inputMode="numeric"
            placeholder="숫자만"
            aria-label="카테고리 ID"
            value={categoryId}
            onChange={(e) => {
              const v = e.target.value.replace(/[^\d]/g, "");
              setCategoryId(v);
            }}
          />
        </div>

        {/* location */}
        <div className="relative">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">지역</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">📍</span>
            <Input
              className="pl-8"
              placeholder="예: 서울, 부산, 창원…"
              aria-label="지역"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        {/* startTime */}
        <div className="relative">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">시작일시</label>
          <Input type="datetime-local" aria-label="시작일시" value={startLocal} onChange={(e) => setStartLocal(e.target.value)} />
        </div>

        {/* endTime */}
        <div className="relative">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">종료일시</label>
          <Input type="datetime-local" aria-label="종료일시" value={endLocal} onChange={(e) => setEndLocal(e.target.value)} />
        </div>
      </div>

      {/* 활성 필터 요약 Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {activeChips.map((c) => (
            <button
              key={c.key}
              onClick={c.onClear}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 dark:border-neutral-700 px-3 py-1 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 transition"
            >
              {c.label}
              <span aria-hidden>✕</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
