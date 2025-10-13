// src/features/room/pages/RoomListPage.tsx
import { useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { useRooms } from "../queries";
import type { RoomDTO } from "../api";
import { sampleRooms } from "../sampleRooms";
import RoomCardPro from "../components/RoomCardPretty";
import RoomFilter from "../components/RoomFilter";
import type { RoomSortKey } from "../components/RoomFilter";

// UI (EventListPage와 톤 맞춤)
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Empty from "@/components/ui/Empty";
import SkeletonList from "@/components/patterns/SkeletonList";

// Icons (필요 시 유지)
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import RefreshIcon from "@mui/icons-material/Refresh";
import RoomCardPretty from "../components/RoomCardPretty";

type SortKey = RoomSortKey;

export default function RoomListPage() {
  // .env 플래그: 개발 중 샘플 데이터만 사용하려면 VITE_USE_SAMPLE=true
  const USE_SAMPLE = import.meta.env.VITE_USE_SAMPLE === "true";

  const { data, isLoading, isError, error, refetch, isFetching } = useRooms();

  // ✅ 샘플/실데이터 스위치
  const rawRooms: RoomDTO[] = USE_SAMPLE ? sampleRooms : (data ?? []);
  const showLoading = !USE_SAMPLE && isLoading;
  const showError = !USE_SAMPLE && isError;

  // URL 쿼리와 동기화
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [onlyAvailable, setOnlyAvailable] = useState(sp.get("avail") === "1");
  const [sortKey, setSortKey] = useState<SortKey>((sp.get("sort") as SortKey) || "created");

  function syncSearchParams(next: { q?: string; avail?: string; sort?: SortKey }) {
    const params = new URLSearchParams(sp);
    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }
    if (next.avail !== undefined) {
      if (next.avail) params.set("avail", next.avail);
      else params.delete("avail");
    }
    if (next.sort !== undefined) {
      if (next.sort) params.set("sort", next.sort);
      else params.delete("sort");
    }
    setSp(params, { replace: true });
  }

  const filtered = useMemo(() => {
    let out = rawRooms;

    const keyword = q.trim().toLowerCase();
    if (keyword) {
      out = out.filter((r) => r.name.toLowerCase().includes(keyword) || r.location.toLowerCase().includes(keyword));
    }

    if (onlyAvailable) {
      out = out.filter((r) => r.available);
    }

    switch (sortKey) {
      case "capacity":
        out = [...out].sort((a, b) => b.capacity - a.capacity);
        break;
      case "name":
        out = [...out].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "created":
      default:
        out = [...out].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return out;
  }, [rawRooms, q, onlyAvailable, sortKey]);

  const count = filtered.length;

  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900 text-neutral-900 dark:text-neutral-100 pb-20">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 space-y-5">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">공간 목록</h1>
            <p className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">모임/이벤트/멘토링을 위한 공간을 찾아보세요.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button component={RouterLink as any} to="/rooms/new" className="hidden sm:inline-flex" startIcon={<AddHomeWorkIcon fontSize="small" />}>
              공간 등록
            </Button>
            <Button variant="ghost" disabled={USE_SAMPLE || isFetching} onClick={() => refetch()} startIcon={<RefreshIcon fontSize="small" />}>
              새로고침
            </Button>
          </div>
        </div>

        {/* 필터 (RoomFilter는 MUI 기반 그대로 사용) */}
        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between sm:mb-3">
            <div className="font-semibold">필터</div>
          </div>
          <div className="mt-3">
            <RoomFilter
              q={q}
              onlyAvailable={onlyAvailable}
              sortKey={sortKey}
              onQChange={(next, commit) => {
                setQ(next);
                if (commit) syncSearchParams({ q: next });
              }}
              onOnlyAvailableChange={(next) => {
                setOnlyAvailable(next);
                syncSearchParams({ avail: next ? "1" : "" });
              }}
              onSortKeyChange={(next) => {
                setSortKey(next);
                syncSearchParams({ sort: next });
              }}
            />
          </div>
        </Card>

        {/* 상태 바 */}
        <div className="flex items-center justify-between pt-1">
          {showError ? (
            <span className="text-sm text-red-600">공간 목록을 불러오지 못했습니다. {(error as any)?.message ?? ""}</span>
          ) : (
            <div className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-400">
              {!USE_SAMPLE && isFetching ? "필터 적용 중…" : <>총 {count}개</>}
            </div>
          )}
          {/* (선택) 페이지네이션 자리 */}
          <div className="flex gap-2">
            <Button variant="ghost" disabled>
              이전
            </Button>
            <Button variant="ghost" disabled>
              다음
            </Button>
          </div>
        </div>

        {/* 목록 */}
        {showLoading ? (
          <SkeletonList rows={9} />
        ) : showError ? (
          <Empty title="공간 조회 실패" desc="네트워크 상태를 확인한 뒤 다시 시도해주세요." />
        ) : count === 0 ? (
          <Empty title="등록된 공간이 없습니다" desc="첫 공간을 등록해 보세요." />
        ) : (
          // ✅ Tailwind 기반 레이아웃 (EventListPage와 동일 스타일)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((r) => (
              <RoomCardPretty key={r.id} room={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
