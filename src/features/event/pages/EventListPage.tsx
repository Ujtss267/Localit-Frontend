// src/features/event/pages/EventListPage.tsx
import { useCallback, useMemo, useState } from "react";
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
  // 🔸 EventListPage 상단
  // TODO: 나중에 AuthContext나 useAuth()로 교체 예정
  const me = { userId: 1 }; // 로그인한 사용자 id

  // 쿼리 파라미터 ref (react-query의 키 안정성)
  const paramsRef = useMemo(() => ({}) as EventListParams, []);

  // 👉 툴바용 로컬 상태 (가벼운 필터)
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState<"latest" | "popular" | "upcoming">("upcoming");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data, isLoading, isFetching, isError, refetch } = useEvents(paramsRef);
  const sample: EventDTO[] = USE_SAMPLE ? sampleEvents : (data ?? []);

  // 공통 병합 유틸
  const mergeParamsAndRefetch = useCallback(
    (p: Partial<EventListParams>) => {
      // ref 객체 내용만 교체(얕은 병합) → 참조 유지
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
      sort, // 서버가 인식 못해도 무해, 인식하면 바로 활용
      page: 1, // 필터 바꾸면 1페이지로
    });
  }, [keyword, sort, mergeParamsAndRefetch]);

  // 고급 필터(기존 EventFilter) 변경 콜백
  const onChangeAdvanced = useCallback(
    (p: EventListParams) => {
      mergeParamsAndRefetch(p);
    },
    [mergeParamsAndRefetch]
  );

  const items = USE_SAMPLE ? sample : (data ?? []);
  const count = items.length;

  const showLoading = !USE_SAMPLE && isLoading;
  const showError = !USE_SAMPLE && isError;

  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900 text-neutral-900 dark:text-neutral-100 pb-20">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 space-y-5">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">이벤트 둘러보기</h1>
            <p className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">필요한 것만 빠르게 필터링하세요.</p>
          </div>
          <Button component={Link} to="/events/new" variant="outline" className="hidden sm:inline-flex">
            이벤트 생성
          </Button>
        </div>

        {/* ✅ 슬림 툴바 (키워드 + 정렬 + 고급필터 토글) */}
        <Card className="p-2 sm:p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {/* 좌측: 검색/정렬 */}
            <div className="flex w-full items-center gap-2">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyToolbar()}
                placeholder="검색어를 입력하세요"
                className="flex-1 h-9 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/70 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700"
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="h-9 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/70 px-2 text-sm"
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

            {/* 우측: 고급필터 토글 */}
            <div className="flex items-center justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowAdvanced((v) => !v)} className="text-[13px]">
                {showAdvanced ? "고급 필터 닫기" : "고급 필터 열기"}
              </Button>
            </div>
          </div>

          {/* 👉 필요 시에만 기존 EventFilter 표시 (접힘) */}
          {showAdvanced && (
            <div className="mt-3 border-t border-neutral-200 dark:border-neutral-800 pt-3">
              <EventFilter onChange={onChangeAdvanced} />
            </div>
          )}
        </Card>

        {/* 상태 표시줄 */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-400">
            {!USE_SAMPLE && isFetching ? "필터 적용 중…" : <>총 {count}개</>}
          </div>
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

      {/* (선택) 모바일 플로팅 액션 */}
      {/* <div className="sm:hidden fixed right-4 bottom-24">
        <Button size="lg" className="shadow-xl">+ 새 이벤트</Button>
      </div> */}
    </div>
  );
}
