// src/features/room/pages/RoomListPage.tsx
import { useMemo, useState, useCallback } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { useRooms } from "../queries";
import type { RoomDTO } from "../api";
import { sampleRooms } from "../sampleRooms";
import RoomCardPretty from "../components/RoomCardPretty";
import RoomFilter from "../components/RoomFilter";
import type { RoomSortKey } from "../components/RoomFilter";

// UI
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Empty from "@/components/ui/Empty";
import SkeletonList from "@/components/patterns/SkeletonList";

// Icons
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import RefreshIcon from "@mui/icons-material/Refresh";

type SortKey = RoomSortKey;

export default function RoomListPage() {
  const USE_SAMPLE = import.meta.env.VITE_USE_SAMPLE === "true";
  const { data, isLoading, isError, error, refetch, isFetching } = useRooms();

  // 샘플/실데이터 스위치
  const rawRooms: RoomDTO[] = USE_SAMPLE ? sampleRooms : (data ?? []);
  const showLoading = !USE_SAMPLE && isLoading;
  const showError = !USE_SAMPLE && isError;

  // URL 쿼리 동기화
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [onlyAvailable, setOnlyAvailable] = useState(sp.get("avail") === "1");
  const [sortKey, setSortKey] = useState<SortKey>((sp.get("sort") as SortKey) || "created");
  const [showAdvanced, setShowAdvanced] = useState(false); // ✅ 고급필터 토글

  const syncSearchParams = useCallback(
    (next: { q?: string; avail?: string; sort?: SortKey }) => {
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
    },
    [sp, setSp]
  );

  // ✅ 툴바 적용 (URL 반영만, 서버 필터는 구현 상황에 따라 useRooms 쿼리키에 연결)
  const applyToolbar = useCallback(() => {
    syncSearchParams({
      q: q.trim(),
      avail: onlyAvailable ? "1" : "",
      sort: sortKey,
    });
    if (!USE_SAMPLE) refetch();
  }, [q, onlyAvailable, sortKey, syncSearchParams, refetch, USE_SAMPLE]);

  // 클라이언트 측 간단 필터/정렬(샘플 또는 API 데이터에 적용)
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
            <p className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">필요한 것만 빠르게 필터링하세요.</p>
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

        {/* ✅ 슬림 툴바 (검색/가용/정렬/적용 + 고급필터 토글) */}
        <Card className="p-2 sm:p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {/* 좌측: 검색/가용/정렬/적용 */}
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
              {/* 검색어 */}
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyToolbar()}
                placeholder="공간명/위치로 검색"
                className="flex-1 h-9 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/70 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700"
              />
              {/* 사용 가능만 */}
              <label className="flex select-none items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="h-4 w-4 accent-neutral-700 dark:accent-neutral-300"
                />
                사용 가능만
              </label>
              {/* 정렬 */}
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="h-9 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/70 px-2 text-sm"
                title="정렬"
              >
                <option value="created">최신 등록순</option>
                <option value="capacity">수용 인원순</option>
                <option value="name">이름순</option>
              </select>

              <Button size="sm" onClick={applyToolbar}>
                적용
              </Button>
            </div>

            {/* 우측: 고급 필터 토글 */}
            <div className="flex items-center justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowAdvanced((v) => !v)} className="text-[13px]">
                {showAdvanced ? "고급 필터 닫기" : "고급 필터 열기"}
              </Button>
            </div>
          </div>

          {/* 👉 필요 시에만 기존 RoomFilter 표시 */}
          {showAdvanced && (
            <div className="mt-3 border-t border-neutral-200 dark:border-neutral-800 pt-3">
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
          )}
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
