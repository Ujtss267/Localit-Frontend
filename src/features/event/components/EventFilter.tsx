import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
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
  // datetime-local: "YYYY-MM-DDTHH:mm"
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
function localInputToIso(local?: string) {
  if (!local) return undefined;
  const d = new Date(local);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
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

  // 뒤로가기/앞으로가기 등 URL 변경에 대한 외부 동기화
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

  // 파라미터 빌드 (빈 값 제거 + 타입 안전)
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

  // 디바운스 + URL 동기화 + 콜백 호출
  useEffect(() => {
    const t = setTimeout(() => {
      // 기존 쿼리 보존하면서 해당 키만 갱신
      const next = new URLSearchParams(sp);
      // 먼저 지우고
      ["categoryId", "location", "startTime", "endTime"].forEach((k) => next.delete(k));
      // 그 다음 있는 값만 세팅
      if (params.categoryId != null) next.set("categoryId", String(params.categoryId));
      if (params.location) next.set("location", params.location);
      if (params.startTime) next.set("startTime", params.startTime);
      if (params.endTime) next.set("endTime", params.endTime);

      // 현재 sp와 다를 때만 replace
      const changed = next.toString() !== sp.toString();
      if (changed) {
        isInternalUpdate.current = true;
        setSp(next, { replace: true });
      }

      onChange(params);
    }, debounceMs);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, debounceMs, setSp, sp]); // sp를 넣는 이유: 다른 쿼리가 추가된 경우도 보존 위해

  return (
    <div className={`grid gap-3 md:grid-cols-4 ${className}`}>
      {/* categoryId */}
      <Input
        inputMode="numeric"
        placeholder="카테고리 ID (숫자)"
        aria-label="카테고리 ID"
        value={categoryId}
        onChange={(e) => {
          const v = e.target.value.replace(/[^\d]/g, ""); // 숫자만
          setCategoryId(v);
        }}
      />

      {/* location */}
      <Input
        placeholder="지역"
        aria-label="지역"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      {/* startTime */}
      <Input
        type="datetime-local"
        aria-label="시작일시"
        value={startLocal}
        onChange={(e) => setStartLocal(e.target.value)}
      />

      {/* endTime */}
      <Input
        type="datetime-local"
        aria-label="종료일시"
        value={endLocal}
        onChange={(e) => setEndLocal(e.target.value)}
      />

      {/* 우측 정렬 액션 (선택) */}
      <div className="md:col-span-4 flex justify-end gap-2">
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
  );
}