// src/features/event/pages/EventListPage.tsx
import { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Empty from "@/components/ui/Empty";
import SkeletonList from "@/components/patterns/SkeletonList";
import EventFilter from "../components/EventFilter";
import { useEvents } from "../queries";
import type { EventDTO, EventListParams } from "../types";
import EventCardPretty from "../components/EventCardPretty";

export default function EventListPage() {
  // .env 플래그: 개발 중 샘플 데이터만 사용하려면 VITE_USE_SAMPLE=true
  const USE_SAMPLE = import.meta.env.VITE_USE_SAMPLE === "true";

  // react-query 쿼리키가 객체 참조를 쓰는 구조라면 ref를 유지
  const paramsRef = useMemo(() => ({} as EventListParams), []);
  const { data, isLoading, isFetching, isError, refetch } = useEvents(paramsRef);

  const onChange = useCallback(
    (p: EventListParams) => {
      // ref 객체를 덮지 말고 병합 → 쿼리키 안정성 유지
      Object.keys(paramsRef).forEach((k) => delete (paramsRef as any)[k]);
      Object.assign(paramsRef, p);
      if (!USE_SAMPLE) {
        refetch();
      }
    },
    [paramsRef, refetch, USE_SAMPLE]
  );

  // ✅ 샘플 데이터
  const sample: EventDTO[] = useMemo(
    () => [
      {
        id: 1,
        title: "로컬 스터디 모임",
        description: "프론트엔드 입문자를 위한 리액트/TS 기초",
        location: "서울 마포",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        capacity: 20,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: "주말 농구 번개",
        description: "초급~중급 환영, 체육관 대관 완료",
        location: "부산 진구",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
        capacity: 12,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        title: "주말 버스킹 공연",
        description: "지역 아마추어 뮤지션들과 함께하는 소규모 공연",
        location: "대구 동성로",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        capacity: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    []
  );

  // ✅ 데이터 폴백: USE_SAMPLE이면 무조건 sample, 아니면 API 데이터
  const items = USE_SAMPLE ? sample : data ?? [];
  const count = items.length;

  // 👉 DB를 죽여둔 동안은 로딩/에러 분기 자체를 무시
  const showLoading = !USE_SAMPLE && isLoading;
  const showError = !USE_SAMPLE && isError;

  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900 text-neutral-900 dark:text-neutral-100 pb-20">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 space-y-5">
        {/* 헤더 (모바일 퍼스트) */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">이벤트 둘러보기</h1>
            <p className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              모바일에서도 쾌적하게 찾아보세요.
            </p>
          </div>
          <Button component={Link} to="/events/new" variant="outline" className="hidden sm:inline-flex">
            이벤트 생성
          </Button>
        </div>

        {/* 필터 */}
        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between sm:mb-3">
            <div className="font-semibold">필터</div>
          </div>
          <div className="mt-3">
            <EventFilter onChange={onChange} />
          </div>
        </Card>

        {/* 상태 표시줄 */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-400">
            {!USE_SAMPLE && isFetching ? "필터 적용 중…" : <>총 {count}개</>}
          </div>
          {/* 페이지네이션 자리 */}
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
          <Empty title="검색 결과가 없습니다" desc="필터값을 변경해 보세요." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {items.map((e) => (
              <EventCardPretty key={e.id} e={e} />
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