import { useParams } from "react-router-dom";
import { useEvent, useEventUsers, useJoinEvent } from "../queries";
import { useState } from "react";

export default function EventDetailPage() {
  const { id } = useParams();
  const eventId = Number(id);
  const { data: e, isLoading } = useEvent(eventId);
  const { data: users, isFetching: usersLoading } = useEventUsers(eventId);
  const join = useJoinEvent();
  const [joining, setJoining] = useState(false);

  if (isLoading) return <div>로딩 중...</div>;
  if (!e) return <div>이벤트를 찾을 수 없습니다.</div>;

  const handleJoin = async () => {
    try {
      setJoining(true);
      await join.mutateAsync(eventId);
      alert("참가 완료");
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "참가 실패");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{e.title}</h1>
          <div className="text-sm text-neutral-600 mt-1">
            {new Date(e.startTime).toLocaleString()} ~ {new Date(e.endTime).toLocaleString()}
          </div>
          <div className="text-sm text-neutral-600 mt-1">📍 {e.location}</div>
        </div>
        <button onClick={handleJoin} disabled={joining} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60">
          {joining ? "참가 중..." : "이벤트 참가"}
        </button>
      </header>

      <section>
        <h2 className="text-lg font-semibold mb-2">설명</h2>
        <p className="text-neutral-800 whitespace-pre-line">{e.description}</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">참가자 목록</h2>
        {usersLoading ? (
          <div>불러오는 중...</div>
        ) : (
          <ul className="space-y-1">
            {users?.map((u) => (
              <li key={u.id} className="text-sm text-neutral-700">
                • {u.email}
              </li>
            ))}
            {!users?.length && <li className="text-sm text-neutral-500">아직 참가자가 없습니다.</li>}
          </ul>
        )}
      </section>
    </div>
  );
}
