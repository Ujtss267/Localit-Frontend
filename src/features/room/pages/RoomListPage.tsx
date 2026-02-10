// src/features/room/pages/RoomListPage.tsx
import { useMemo, useState, useCallback, useEffect } from "react";
import { useQueries } from "@tanstack/react-query";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { useRooms } from "../queries";
import { checkRoomAvailability, type RoomAvailability, type RoomDTO } from "../api";
import { sampleData } from "@/mocks/sampleData";
import RoomCardPretty from "../components/RoomCardPretty";
import type { RoomSortKey } from "../components/RoomFilter";
import { useAuth } from "@/app/providers/AuthProvider";
import { useGeolocation } from "@/hooks/useGeolocation";

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

function toISO(local: string) {
  if (!local) return "";
  return new Date(local).toISOString();
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function RoomListPage() {
  const USE_SAMPLE = import.meta.env.VITE_USE_SAMPLE === "true";
  const { data, isLoading, isError, error, refetch, isFetching } = useRooms();
  const { user } = useAuth();
  const viewerId = user?.id ?? 1;
  const userPref = sampleData.userPreferences[viewerId];
  const { pos, getOnce } = useGeolocation();
  const [sp, setSp] = useSearchParams();
  const pickForEvent = sp.get("pickForEvent") === "1";
  const startLocalParam = sp.get("startLocal") ?? "";
  const endLocalParam = sp.get("endLocal") ?? "";

  // 샘플/실데이터 스위치
  const allRooms: RoomDTO[] = USE_SAMPLE ? sampleData.rooms : (data ?? []);
  const rawRooms: RoomDTO[] = pickForEvent ? allRooms : allRooms.filter((r) => r.creatorId === viewerId);
  const showLoading = !USE_SAMPLE && isLoading;
  const showError = !USE_SAMPLE && isError;

  // URL 쿼리 동기화
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [onlyAvailable, setOnlyAvailable] = useState(sp.get("avail") === "1");
  const [sortKey, setSortKey] = useState<SortKey>((sp.get("sort") as SortKey) || "created");
  const reservationWindowValid = Boolean(
    startLocalParam &&
      endLocalParam &&
      Number.isFinite(new Date(startLocalParam).getTime()) &&
      Number.isFinite(new Date(endLocalParam).getTime()) &&
      new Date(endLocalParam) > new Date(startLocalParam)
  );

  useEffect(() => {
    if (!pickForEvent) return;
    getOnce();
  }, [pickForEvent, getOnce]);

  const distanceOrigin = useMemo(() => {
    if (typeof pos?.lat === "number" && typeof pos?.lng === "number") {
      return { lat: pos.lat, lng: pos.lng, label: "현재 위치" };
    }
    if (typeof userPref?.lat === "number" && typeof userPref?.lng === "number") {
      return { lat: userPref.lat, lng: userPref.lng, label: "기본 위치" };
    }
    return null;
  }, [pos?.lat, pos?.lng, userPref?.lat, userPref?.lng]);

  const availabilityQueries = useQueries({
    queries:
      pickForEvent && reservationWindowValid && !USE_SAMPLE
        ? rawRooms.map((room) => ({
            queryKey: ["room-availability", room.id, startLocalParam, endLocalParam],
            queryFn: () => checkRoomAvailability(room.id, toISO(startLocalParam), toISO(endLocalParam)),
            staleTime: 10_000,
          }))
        : [],
  });

  const availabilityByRoomId = useMemo(() => {
    const out = new Map<number, RoomAvailability | undefined>();
    rawRooms.forEach((room, idx) => {
      out.set(room.id, availabilityQueries[idx]?.data);
    });
    return out;
  }, [rawRooms, availabilityQueries]);

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

    if (onlyAvailable || pickForEvent) {
      out = out.filter((r) => r.available);
    }

    if (pickForEvent && reservationWindowValid) {
      out = out.filter((r) => {
        const availability = availabilityByRoomId.get(r.id);
        if (!availability) return true;
        return availability.available;
      });
    }

    if (pickForEvent && distanceOrigin) {
      out = [...out].sort((a, b) => {
        const aDistance =
          a.lat != null && a.lng != null ? distanceKm(distanceOrigin.lat, distanceOrigin.lng, a.lat, a.lng) : Number.POSITIVE_INFINITY;
        const bDistance =
          b.lat != null && b.lng != null ? distanceKm(distanceOrigin.lat, distanceOrigin.lng, b.lat, b.lng) : Number.POSITIVE_INFINITY;
        return aDistance - bDistance;
      });
      return out;
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
  }, [rawRooms, q, onlyAvailable, sortKey, pickForEvent, reservationWindowValid, availabilityByRoomId, distanceOrigin]);

  const count = filtered.length;
  const sortLabel: Record<SortKey, string> = {
    created: "최신 등록순",
    capacity: "수용 인원순",
    name: "이름순",
  };
  const activeSummary = [
    q.trim() ? `검색: ${q.trim()}` : "",
    onlyAvailable || pickForEvent ? "사용 가능만" : "",
    pickForEvent ? `정렬: 가까운 순${distanceOrigin ? ` (${distanceOrigin.label})` : ""}` : `정렬: ${sortLabel[sortKey]}`,
    pickForEvent && reservationWindowValid ? "이벤트 시간대 예약 가능 공간만" : "",
  ].filter(Boolean);

  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900 text-neutral-100 pb-20">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-5 space-y-3 sm:space-y-4">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold tracking-tight text-white sm:text-xl">공간 목록</h1>
            <p className={`${mobileText.meta} mt-1 text-neutral-400`}>
              {pickForEvent ? "이벤트에 연결할 공간을 선택하거나 새 공간을 등록하세요." : "내가 등록한 공간만 표시됩니다."}
            </p>
            {pickForEvent && !reservationWindowValid && (
              <p className={`${mobileText.meta} mt-1 text-amber-300`}>이벤트 시작/종료 시간이 없어 예약 가능 여부 확인이 제한됩니다.</p>
            )}
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

            {!pickForEvent && (
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
            )}

            <label className="inline-flex min-h-10 sm:min-h-11 items-center gap-2 text-xs sm:text-sm cursor-pointer select-none text-neutral-200">
              <input
                type="checkbox"
                checked={onlyAvailable || pickForEvent}
                disabled={pickForEvent}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="h-4 w-4 accent-neutral-100"
              />
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
          <Empty title="등록한 공간이 없습니다" desc={pickForEvent ? "이벤트 연결용 공간을 먼저 등록해 보세요." : "첫 공간을 등록해 보세요."} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {filtered.map((r) => {
              const availability = availabilityByRoomId.get(r.id);
              const availabilityKnown = USE_SAMPLE || !pickForEvent || !reservationWindowValid || Boolean(availability);
              const canPickForEvent = reservationWindowValid && (USE_SAMPLE || availability?.available === true);
              const to = pickForEvent
                ? `/events/new?roomId=${r.id}&startLocal=${encodeURIComponent(startLocalParam)}&endLocal=${encodeURIComponent(endLocalParam)}`
                : `/events/new?roomId=${r.id}`;
              const reserveDisabled = pickForEvent ? !canPickForEvent : !r.available;
              const reserveLabel = pickForEvent
                ? !reservationWindowValid
                  ? "이벤트 시간을 먼저 선택하세요"
                  : !availabilityKnown
                    ? "예약 가능 여부 확인 중..."
                    : canPickForEvent
                      ? "예약"
                      : "선택한 시간 예약 불가"
                : "예약";
              return (
                <div key={r.id} className="space-y-2">
                  <RoomCardPretty room={r} to={to} reserveDisabled={reserveDisabled} reserveLabel={reserveLabel} />
                  {pickForEvent && (
                    <>
                      {distanceOrigin && r.lat != null && r.lng != null && (
                        <div className="text-[11px] text-neutral-400">거리 {distanceKm(distanceOrigin.lat, distanceOrigin.lng, r.lat, r.lng).toFixed(1)}km</div>
                      )}
                      {!reservationWindowValid && <div className="text-[11px] text-amber-300">이벤트 시간을 먼저 선택하세요.</div>}
                      {reservationWindowValid && !availabilityKnown && <div className="text-[11px] text-neutral-400">예약 가능 여부 확인 중...</div>}
                      {reservationWindowValid && availabilityKnown && !canPickForEvent && (
                        <div className="text-[11px] text-rose-300">선택한 시간 예약 불가</div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
