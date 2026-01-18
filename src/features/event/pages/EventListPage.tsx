// src/features/event/pages/EventListPage.tsx
import { useCallback, useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Empty from "@/components/ui/Empty";
import SkeletonList from "@/components/patterns/SkeletonList";
import EventFilter from "../components/EventFilter";
import { useEvents } from "../queries";
import type { EventDTO, EventListParams } from "../api";
import EventCardPretty from "../components/EventCardPretty";
import { sampleEvents } from "../sampleEvents";

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

  const { data, isLoading, isFetching, isError, refetch } = useEvents(paramsRef);
  const baseItems: EventDTO[] = USE_SAMPLE ? sampleEvents : (data ?? []);

  // 공통 병합 유틸
  const mergeParamsAndRefetch = useCallback(
    (p: Partial<EventListParams>) => {
      Object.keys(paramsRef).forEach((k) => delete (paramsRef as any)[k]);
      Object.assign(paramsRef, p);
      if (!USE_SAMPLE) refetch();
    },
    [paramsRef, refetch, USE_SAMPLE]
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

  // 고급 필터(기존 EventFilter) 변경 콜백
  const onChangeAdvanced = useCallback(
    (p: EventListParams) => {
      mergeParamsAndRefetch(p);
    },
    [mergeParamsAndRefetch]
  );

  // ✅ 최종 리스트 (샘플 모드에선 클라 사이드에서만 필터)
  const items = USE_SAMPLE ? baseItems.filter((e) => !myOnly || e.creator?.id === me.userId) : baseItems;
  const count = items.length;

  const showLoading = !USE_SAMPLE && isLoading;
  const showError = !USE_SAMPLE && isError;

  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900 text-neutral-100 pb-20">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 space-y-5">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">이벤트 둘러보기</h1>
            <p className="text-[13px] sm:text-sm text-neutral-400 mt-1">필요한 것만 빠르게 필터링하세요.</p>
          </div>
          <Button component={Link} to="/events/new" variant="outline" className="hidden sm:inline-flex">
            이벤트 생성
          </Button>
        </div>

        {/* ✅ 슬림 툴바 (키워드 + 정렬 + 고급필터 토글 + 내 이벤트만) */}
        <Card className="p-2 sm:p-3 bg-neutral-900/80 border border-neutral-800">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {/* 좌측: 검색/정렬 */}
            <div className="flex w-full items-center gap-2">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyToolbar()}
                placeholder="검색어를 입력하세요"
                className="flex-1 h-9 rounded-md border border-neutral-700 bg-neutral-900/80 px-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="h-9 rounded-md border border-neutral-700 bg-neutral-900/80 px-2 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                title="정렬"
              >
                <option value="upcoming">시작 임박순</option>
                <option value="latest">최신 등록순</option>
                <option value="popular">인기순</option>
              </select>
              <Button size="sm" onClick={applyToolbar}>
                적용
              </Button>
            </div>

            {/* 우측: 내 이벤트만 + 고급필터 토글 */}
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              {/* ✅ 내 이벤트만 토글 */}
              <label className="inline-flex items-center gap-2 text-[13px] sm:text-sm cursor-pointer select-none text-neutral-200">
                <input type="checkbox" checked={myOnly} onChange={(e) => setMyOnly(e.target.checked)} className="h-4 w-4 accent-neutral-100" />
                내 이벤트만
              </label>

              <Button variant="ghost" size="sm" onClick={() => setShowAdvanced((v) => !v)} className="text-[12px]">
                {showAdvanced ? "닫기" : "필터"}
              </Button>
            </div>
          </div>

          {/* 기존 EventFilter (접힘) */}
          {showAdvanced && (
            <div className="mt-3 border-t border-neutral-800 pt-3">
              <EventFilter onChange={onChangeAdvanced} />
            </div>
          )}
        </Card>

        {/* 상태 표시줄 */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[13px] sm:text-sm text-neutral-400">{!USE_SAMPLE && isFetching ? "필터 적용 중…" : <>총 {count}개</>}</div>
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
          <SkeletonList rows={6} />
        ) : showError ? (
          <Empty title="이벤트 조회 실패" desc="네트워크 상태를 확인한 뒤 다시 시도해주세요." />
        ) : count === 0 ? (
          <Empty title="검색 결과가 없습니다" desc="키워드/정렬 또는 고급 필터를 조정해 보세요." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {items.map((e) => (
              <EventCardPretty key={e.id} e={e} canEdit={e.creator.id === me.userId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
