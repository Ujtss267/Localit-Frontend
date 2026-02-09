// src/features/room/pages/RoomListPage.tsx
import { useMemo, useState, useCallback } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { useRooms } from "../queries";
import type { RoomDTO } from "../api";
import { sampleData } from "@/mocks/sampleData";
import RoomCardPretty from "../components/RoomCardPretty";
import type { RoomSortKey } from "../components/RoomFilter";

// UI
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Empty from "@/components/ui/Empty";
import SkeletonList from "@/components/patterns/SkeletonList";
import { mobileText } from "@/components/ui/mobileTypography";

// Icons
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import RefreshIcon from "@mui/icons-material/Refresh";

type SortKey = RoomSortKey;

export default function RoomListPage() {
  const USE_SAMPLE = import.meta.env.VITE_USE_SAMPLE === "true";
  const { data, isLoading, isError, error, refetch, isFetching } = useRooms();

  // 샘플/실데이터 스위치
  const rawRooms: RoomDTO[] = USE_SAMPLE ? sampleData.rooms : (data ?? []);
  const showLoading = !USE_SAMPLE && isLoading;
  const showError = !USE_SAMPLE && isError;

  // URL 쿼리 동기화
  const [sp, setSp] = useSearchParams();
  const pickForEvent = sp.get("pickForEvent") === "1";
  const startLocalParam = sp.get("startLocal") ?? "";
  const endLocalParam = sp.get("endLocal") ?? "";
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [onlyAvailable, setOnlyAvailable] = useState(sp.get("avail") === "1");
  const [sortKey, setSortKey] = useState<SortKey>((sp.get("sort") as SortKey) || "created");

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
  const sortLabel: Record<SortKey, string> = {
    created: "최신 등록순",
    capacity: "수용 인원순",
    name: "이름순",
  };
  const activeSummary = [q.trim() ? `검색: ${q.trim()}` : "", onlyAvailable ? "사용 가능만" : "", `정렬: ${sortLabel[sortKey]}`].filter(Boolean);

  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900 text-neutral-100 pb-20">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-5 space-y-3 sm:space-y-4">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold tracking-tight text-white sm:text-xl">공간 목록</h1>
            <p className={`${mobileText.meta} mt-1 text-neutral-400`}>
              {pickForEvent ? "이벤트에 연결할 공간을 선택하거나 새 공간을 등록하세요." : "필요한 것만 빠르게 필터링하세요."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              component={RouterLink as any}
              to={pickForEvent ? "/rooms/new?fromEventCreate=1" : "/rooms/new"}
              className="!h-8 sm:!h-10 px-2 sm:px-3 text-[11px] sm:text-xs min-w-0"
              startIcon={<AddHomeWorkIcon fontSize="small" />}
              title="공간 등록"
            >
              <span className="hidden sm:inline">공간 등록</span>
            </Button>
            <Button
              variant="ghost"
              disabled={USE_SAMPLE || isFetching}
              onClick={() => refetch()}
              startIcon={<RefreshIcon fontSize="small" />}
              className="!h-8 sm:!h-10 px-2 sm:px-3 text-[11px] sm:text-xs min-w-0"
              title="새로고침"
            >
              <span className="hidden sm:inline">새로고침</span>
            </Button>
          </div>
        </div>

        {/* ✅ 모바일 우선 필터 바 */}
        <Card className="bg-neutral-900/80 border border-neutral-800 [&_.MuiCardContent-root]:!p-2.5 sm:[&_.MuiCardContent-root]:!p-3 [&_.MuiCardContent-root:last-child]:!pb-2.5 sm:[&_.MuiCardContent-root:last-child]:!pb-3">
          <div className="space-y-2.5">
            <div className="flex w-full items-center gap-1.5 sm:gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyToolbar()}
                placeholder="공간명/위치 검색"
                className="w-full h-10 sm:h-11 rounded-md border border-neutral-700 bg-neutral-900/80 px-2.5 sm:px-3 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
              />
              {q && (
                <Button variant="ghost" size="sm" onClick={() => setQ("")} className="!h-10 sm:!h-11 px-2 text-xs sm:text-sm whitespace-nowrap">
                  지우기
                </Button>
              )}
              <Button size="sm" onClick={applyToolbar} className="!h-10 sm:!h-11 px-2 sm:px-3 text-xs sm:text-sm">
                적용
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {(["created", "capacity", "name"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSortKey(k)}
                  className={[
                    "h-9 sm:h-10 rounded-full px-3 text-xs sm:text-sm border transition",
                    sortKey === k
                      ? "border-neutral-200 bg-neutral-100 text-neutral-900"
                      : "border-neutral-700 bg-neutral-900/80 text-neutral-200 hover:bg-neutral-800",
                  ].join(" ")}
                >
                  {sortLabel[k]}
                </button>
              ))}
            </div>

            <label className="inline-flex min-h-10 sm:min-h-11 items-center gap-2 text-xs sm:text-sm cursor-pointer select-none text-neutral-200">
              <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} className="h-4 w-4 accent-neutral-100" />
              사용 가능 공간만 보기
            </label>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {activeSummary.map((v) => (
              <span key={v} className="inline-flex rounded-full border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-[11px] sm:text-xs text-neutral-300">
                {v}
              </span>
            ))}
            <button
              type="button"
              onClick={() => {
                setQ("");
                setOnlyAvailable(false);
                setSortKey("created");
                syncSearchParams({ q: "", avail: "", sort: "created" });
                if (!USE_SAMPLE) refetch();
              }}
              className="inline-flex rounded-full border border-neutral-600 px-2.5 py-1 text-[11px] sm:text-xs text-neutral-300 hover:bg-neutral-800"
            >
              조건 초기화
            </button>
          </div>
        </Card>

        {/* 상태 바 */}
        <div className="flex items-center justify-between pt-1">
          {showError ? (
            <span className="text-sm text-red-400">공간 목록을 불러오지 못했습니다. {(error as any)?.message ?? ""}</span>
          ) : (
            <div className={`${mobileText.meta} text-neutral-400`}>{!USE_SAMPLE && isFetching ? "필터 적용 중…" : <>총 {count}개</>}</div>
          )}
          <div className="hidden sm:flex gap-2">
            <Button variant="ghost" disabled size="sm">
              이전
            </Button>
            <Button variant="ghost" disabled size="sm">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {filtered.map((r) => (
              <div key={r.id} className="space-y-2">
                <RoomCardPretty room={r} />
                {pickForEvent && (
                  <Button
                    component={RouterLink as any}
                    to={`/events/new?roomId=${r.id}&startLocal=${encodeURIComponent(startLocalParam)}&endLocal=${encodeURIComponent(endLocalParam)}`}
                    size="sm"
                    className="w-full !h-9 text-xs"
                  >
                    이 공간으로 이벤트 만들기
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
