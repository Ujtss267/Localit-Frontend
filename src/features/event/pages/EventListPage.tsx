// src/features/event/pages/EventListPage.tsx
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Empty from "@/components/ui/Empty";
import SkeletonList from "@/components/patterns/SkeletonList";
import EventFilter from "../components/EventFilter";
import { useEvents } from "../queries";
import type { EventDTO, EventListParams } from "../api";
import EventCardPretty from "../components/EventCardPretty";
import { sampleData } from "@/mocks/sampleData";
import { mobileText } from "@/components/ui/mobileTypography";

function toRadians(degree: number) {
  return (degree * Math.PI) / 180;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function EventListPage() {
  const USE_SAMPLE = import.meta.env.VITE_USE_SAMPLE === "true";
  // TODO: 나중에 AuthContext나 useAuth()로 교체 예정
  const me = { userId: 1 }; // 로그인한 사용자 id

  // 쿼리 파라미터 ref (react-query의 키 안정성)
  const paramsRef = useMemo(() => ({}) as EventListParams, []);

  // 👉 툴바용 로컬 상태
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState<"latest" | "popular" | "upcoming">("upcoming");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [myOnly, setMyOnly] = useState(false); // ✅ 내 이벤트만
  const [nativeLocation, setNativeLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [sheetDragY, setSheetDragY] = useState(0);
  const dragStartYRef = useRef<number | null>(null);
  const requestedLocationRef = useRef(false);

  const { data, isLoading, isFetching, isError, refetch } = useEvents(paramsRef);
  const baseItems: EventDTO[] = USE_SAMPLE ? sampleData.events : (data ?? []);

  // 공통 병합 유틸
  const mergeParamsAndRefetch = useCallback(
    (p: Partial<EventListParams>) => {
      Object.keys(paramsRef).forEach((k) => delete (paramsRef as any)[k]);
      Object.assign(paramsRef, p);
      if (!USE_SAMPLE) refetch();
    },
    [paramsRef, refetch, USE_SAMPLE],
  );

  // 툴바: 키워드/정렬 적용
  const applyToolbar = useCallback(() => {
    mergeParamsAndRefetch({
      ...(keyword.trim() ? { q: keyword.trim() } : { q: undefined }),
      sort,
      page: 1,
      // ✅ 서버 모드에선 creatorId 파라미터로 필터링
      ...(myOnly ? { creatorId: me.userId } : { creatorId: undefined }),
    });
  }, [keyword, sort, myOnly, mergeParamsAndRefetch, me.userId]);

  // ✅ "내 이벤트만" 토글 시 즉시 적용 (서버 모드)
  useEffect(() => {
    if (!USE_SAMPLE) {
      mergeParamsAndRefetch({
        ...(myOnly ? { creatorId: me.userId } : { creatorId: undefined }),
        page: 1,
      });
    }
  }, [myOnly, USE_SAMPLE, me.userId, mergeParamsAndRefetch]);

  // 모바일 상세필터 열림 시 배경 스크롤 잠금
  useEffect(() => {
    if (!showAdvanced) return;
    if (typeof window === "undefined" || !window.matchMedia("(max-width: 639px)").matches) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, [showAdvanced]);

  // 고급 필터(기존 EventFilter) 변경 콜백
  const onChangeAdvanced = useCallback(
    (p: EventListParams) => {
      mergeParamsAndRefetch(p);
    },
    [mergeParamsAndRefetch],
  );

  // ✅ 최종 리스트 (샘플 모드에선 클라 사이드에서만 필터)
  const items = USE_SAMPLE ? baseItems.filter((e) => !myOnly || e.creator?.id === me.userId) : baseItems;
  const itemsWithDistance = useMemo(() => {
    return items.map((item) => {
      if (!nativeLocation || typeof item.lat !== "number" || typeof item.lng !== "number") return { item, distanceKm: null as number | null };
      return {
        item,
        distanceKm: haversineKm(nativeLocation.latitude, nativeLocation.longitude, item.lat, item.lng),
      };
    });
  }, [items, nativeLocation]);

  const displayItems = useMemo(() => {
    if (!nativeLocation) return itemsWithDistance;
    return [...itemsWithDistance].sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) return 0;
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }, [itemsWithDistance, nativeLocation]);

  const count = displayItems.length;

  const showLoading = !USE_SAMPLE && isLoading;
  const showError = !USE_SAMPLE && isError;
  const sortLabel: Record<"latest" | "popular" | "upcoming", string> = {
    upcoming: "시작 임박순",
    latest: "최신 등록순",
    popular: "인기순",
  };
  const activeSummary = [keyword.trim() ? `검색: ${keyword.trim()}` : "", `정렬: ${sortLabel[sort]}`, myOnly ? "내 이벤트만" : ""].filter(Boolean);
  const closeAdvanced = () => {
    setShowAdvanced(false);
    setSheetDragY(0);
    dragStartYRef.current = null;
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { type?: string; data?: { latitude?: number; longitude?: number } };
      if (detail?.type !== "LOCATION_RESULT") return;
      const lat = detail?.data?.latitude;
      const lng = detail?.data?.longitude;
      if (typeof lat === "number" && typeof lng === "number") {
        setNativeLocation({ latitude: lat, longitude: lng });
      }
    };

    window.addEventListener("localit-native-message", handler as EventListener);
    return () => window.removeEventListener("localit-native-message", handler as EventListener);
  }, []);

  useEffect(() => {
    const rn = (window as any)?.ReactNativeWebView;
    if (!rn?.postMessage || requestedLocationRef.current) return;
    requestedLocationRef.current = true;
    rn.postMessage(JSON.stringify({ type: "REQUEST_LOCATION" }));
  }, []);
  const onSheetTouchStart = (e: React.TouchEvent) => {
    dragStartYRef.current = e.touches[0]?.clientY ?? null;
  };
  const onSheetTouchMove = (e: React.TouchEvent) => {
    if (dragStartYRef.current == null) return;
    const currentY = e.touches[0]?.clientY ?? dragStartYRef.current;
    const delta = Math.max(0, currentY - dragStartYRef.current);
    setSheetDragY(Math.min(delta, 220));
  };
  const onSheetTouchEnd = () => {
    if (sheetDragY > 90) {
      closeAdvanced();
      return;
    }
    setSheetDragY(0);
    dragStartYRef.current = null;
  };

  return (
    <div className="min-h-svh bg-linear-to-b from-neutral-950 via-neutral-950 to-neutral-900 text-neutral-100 pb-20">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-5 space-y-3 sm:space-y-4">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className={`${mobileText.title} font-semibold tracking-tight text-white`}>이벤트 둘러보기</h1>
            <p className={`${mobileText.meta} text-neutral-400 mt-1`}>필요한 것만 빠르게 필터링하세요.</p>
          </div>
          <Button component={Link} to="/events/new" variant="outline" className="hidden sm:inline-flex">
            이벤트 생성
          </Button>
        </div>

        {/* ✅ 모바일 우선 필터 바 */}
        <Card className="bg-neutral-900/80 border border-neutral-800 [&_.MuiCardContent-root]:p-2.5! sm:[&_.MuiCardContent-root]:p-3! [&_.MuiCardContent-root:last-child]:pb-2.5! sm:[&_.MuiCardContent-root:last-child]:pb-3!">
          <div className="space-y-2.5">
            <div className="flex w-full items-center gap-1.5 sm:gap-2">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyToolbar()}
                placeholder="이벤트명/설명 검색"
                className="flex-1 h-10 sm:h-11 rounded-md border border-neutral-700 bg-neutral-900/80 px-2.5 sm:px-3 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
              />
              {keyword && (
                <Button variant="ghost" size="sm" onClick={() => setKeyword("")} className="h-10! sm:h-11! px-2 text-xs sm:text-sm whitespace-nowrap">
                  지우기
                </Button>
              )}
              <Button size="sm" onClick={applyToolbar} className="h-10! sm:h-11! px-2 sm:px-3 text-xs sm:text-sm">
                적용
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {(["upcoming", "latest", "popular"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSort(k)}
                  className={[
                    "h-9 sm:h-10 rounded-full px-3 text-xs sm:text-sm border transition",
                    sort === k
                      ? "border-neutral-200 bg-neutral-100 text-neutral-900"
                      : "border-neutral-700 bg-neutral-900/80 text-neutral-200 hover:bg-neutral-800",
                  ].join(" ")}
                >
                  {sortLabel[k]}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="inline-flex min-h-10 sm:min-h-11 items-center gap-2 text-xs sm:text-sm cursor-pointer select-none text-neutral-200">
                <input type="checkbox" checked={myOnly} onChange={(e) => setMyOnly(e.target.checked)} className="h-4 w-4 accent-neutral-100" />내
                이벤트만
              </label>

              <Button variant="ghost" size="sm" onClick={() => setShowAdvanced((v) => !v)} className="h-10! sm:h-11! px-2 sm:px-3 text-xs sm:text-sm">
                {showAdvanced ? "상세 필터 닫기" : "상세 필터 열기"}
              </Button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {activeSummary.map((v) => (
              <span
                key={v}
                className="inline-flex rounded-full border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-[11px] sm:text-xs text-neutral-300"
              >
                {v}
              </span>
            ))}
          </div>

          {/* 기존 EventFilter (접힘) */}
          {showAdvanced && (
            <div className="mt-3 hidden sm:block border-t border-neutral-800 pt-3">
              <EventFilter onChange={onChangeAdvanced} />
            </div>
          )}
        </Card>

        {/* 모바일 상세 필터: Bottom Sheet */}
        {showAdvanced && (
          <div className="fixed inset-0 z-40 sm:hidden">
            <button type="button" className="absolute inset-0 bg-black/55" aria-label="상세 필터 닫기" onClick={closeAdvanced} />
            <div
              className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-neutral-700 bg-neutral-900 shadow-2xl transition-transform duration-150 ease-out"
              style={{ transform: `translateY(${sheetDragY}px)` }}
            >
              <div
                className="px-6 pt-2"
                onTouchStart={onSheetTouchStart}
                onTouchMove={onSheetTouchMove}
                onTouchEnd={onSheetTouchEnd}
                onTouchCancel={onSheetTouchEnd}
              >
                <div className="mx-auto h-1.5 w-12 rounded-full bg-neutral-600" />
              </div>
              <div className="flex items-center justify-between px-4 pb-2 pt-3">
                <div>
                  <div className="text-[13px] font-semibold text-neutral-100">상세 필터</div>
                  <div className="text-[11px] text-neutral-400">카테고리/지역/기간을 세부 설정하세요.</div>
                </div>
                <Button variant="ghost" size="sm" onClick={closeAdvanced} className="h-8! px-2 text-[11px]">
                  닫기
                </Button>
              </div>
              <div className="max-h-[74svh] overflow-y-auto border-t border-neutral-800 px-3 py-3">
                <EventFilter onChange={onChangeAdvanced} />
              </div>
            </div>
          </div>
        )}

        {/* 상태 표시줄 */}
        <div className="flex items-center justify-between pt-1">
          <div className={`${mobileText.meta} text-neutral-400`}>{!USE_SAMPLE && isFetching ? "필터 적용 중…" : <>총 {count}개</>}</div>
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
          <SkeletonList rows={6} />
        ) : showError ? (
          <Empty title="이벤트 조회 실패" desc="네트워크 상태를 확인한 뒤 다시 시도해주세요." />
        ) : count === 0 ? (
          <Empty title="검색 결과가 없습니다" desc="키워드/정렬 또는 고급 필터를 조정해 보세요." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {displayItems.map(({ item: e, distanceKm }) => (
              <EventCardPretty key={e.id} e={e} distanceKm={distanceKm} canEdit={e.creator?.id === me.userId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
