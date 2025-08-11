import { useCallback, useMemo } from "react";
import EventFilter from "../components/EventFilter";
import EventCard from "../components/EventCard";
import { useEvents } from "../queries";

export default function EventListPage() {
  const paramsRef = useMemo(() => ({} as any), []);
  const { data, isLoading, isError, refetch } = useEvents(paramsRef);

  const onChange = useCallback(
    (p: any) => {
      // 쿼리키가 객체 참조를 사용하므로, ref 값 갱신 후 refetch
      Object.assign(paramsRef, p);
      refetch();
    },
    [paramsRef, refetch]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">이벤트</h1>
      <EventFilter onChange={onChange} />
      {isLoading && <div>로딩 중...</div>}
      {isError && <div className="text-red-600">이벤트 조회 실패</div>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map((e) => (
          <EventCard key={e.id} e={e} />
        ))}
      </div>
      {!isLoading && data?.length === 0 && <div>검색 결과가 없습니다.</div>}
    </div>
  );
}
