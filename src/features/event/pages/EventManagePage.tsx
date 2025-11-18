// src/features/event/pages/EventManagePage.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs"; // 없으면 MyPage 처럼 로컬 탭 컴포넌트 써도 됨
import { useChat } from "@/app/providers/ChatProvider";

// TODO: 실제 API 훅으로 교체
// import { useEventApplications, useEventParticipants } from "../queries";

type ManageTab = "APPLICATIONS" | "PARTICIPANTS";

export default function EventManagePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<ManageTab>("APPLICATIONS");

  const id = Number(eventId);

  // 실제로는 React Query로 불러오면 됨
  const eventTitle = `이벤트 #${id}`;
  const summary = {
    capacity: 16,
    pendingApplications: 3,
    confirmed: 10,
  };

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      {/* 상단 헤더 */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <button className="mb-1 text-xs text-neutral-500 hover:underline" onClick={() => navigate(-1)}>
            ← MyPage로 돌아가기
          </button>
          <h1 className="text-xl font-semibold sm:text-2xl">{eventTitle}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <Badge tone="blue">정원 {summary.capacity}명</Badge>
            <Badge tone="indigo">승인 대기 {summary.pendingApplications}명</Badge>
            <Badge tone="green">확정 {summary.confirmed}명</Badge>
          </div>
        </div>

        <Button size="sm" onClick={() => navigate(`/events/${id}`)}>
          이벤트 상세 보기
        </Button>
      </div>

      {/* 탭 */}
      <div className="mb-4">
        <div className="flex gap-2 rounded-2xl border p-1">
          {[
            { value: "APPLICATIONS", label: "신청/심사" },
            { value: "PARTICIPANTS", label: "참여자" },
          ].map((t) => {
            const active = tab === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setTab(t.value as ManageTab)}
                className={"rounded-xl px-4 py-2 text-sm font-medium transition " + (active ? "bg-black text-white" : "hover:bg-gray-100")}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 내용 */}
      {tab === "APPLICATIONS" && <ApplicationsPanel eventId={id} />}
      {tab === "PARTICIPANTS" && <ParticipantsPanel eventId={id} />}
    </div>
  );
}

// ───────────────────────────
// 신청/심사 탭
// ───────────────────────────
function ApplicationsPanel({ eventId }: { eventId: number }) {
  // const { data, isLoading } = useEventApplications(eventId);
  const mock = [
    { applicationId: 1, userName: "Anna", status: "SUBMITTED" },
    { applicationId: 2, userName: "Brian", status: "WAITLIST" },
  ];

  return (
    <Card className="rounded-2xl border p-4">
      <h2 className="mb-3 text-lg font-semibold">신청 목록</h2>
      <div className="space-y-2">
        {mock.map((a) => (
          <div key={a.applicationId} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
            <div className="flex flex-col">
              <span className="font-medium">{a.userName}</span>
              <span className="text-xs text-neutral-500">#{a.applicationId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="blue">{a.status}</Badge>
              <Button variant="outline">승인</Button>
              <Button variant="outline">거절</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ───────────────────────────
// 참여자 탭
// ───────────────────────────
function ParticipantsPanel({ eventId }: { eventId: number }) {
  // const { data } = useEventParticipants(eventId);
  const mock = [
    { registrationId: 1, userName: "Anna", status: "CONFIRMED" },
    { registrationId: 2, userName: "Brian", status: "ATTENDED" },
  ];

  return (
    <Card className="rounded-2xl border p-4">
      <h2 className="mb-3 text-lg font-semibold">참여자 목록</h2>
      <div className="space-y-2">
        {mock.map((p) => (
          <div key={p.registrationId} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
            <div className="flex flex-col">
              <span className="font-medium">{p.userName}</span>
              <span className="text-xs text-neutral-500">{p.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">출석 처리</Button>
              <Button variant="outline">노쇼 처리</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ───────────────────────────
// 채팅 탭 (이벤트 전용 그룹 채팅)
// ───────────────────────────
function ChatPanel({ eventId }: { eventId: number }) {
  // 추후: useEventChat(eventId) + WebSocket/SSE 연결
  const messages = [
    { id: 1, fromMe: false, name: "Anna", text: "안녕하세요! 처음 가는 사람도 괜찮나요?" },
    { id: 2, fromMe: true, name: "호스트(나)", text: "물론이죠 :) 편하게 오시면 됩니다." },
  ];

  return (
    <Card className="flex h-[480px] flex-col rounded-2xl border">
      <div className="border-b px-4 py-2 text-sm font-semibold">이벤트 채팅</div>
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-sm">
        {messages.map((m) => (
          <div key={m.id} className={"flex " + (m.fromMe ? "justify-end" : "justify-start")}>
            <div className={"max-w-[70%] rounded-2xl px-3 py-2 " + (m.fromMe ? "bg-black text-white" : "bg-gray-100 text-neutral-900")}>
              {!m.fromMe && <div className="mb-0.5 text-[11px] font-medium text-neutral-500">{m.name}</div>}
              <div>{m.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t px-3 py-2">
        <input className="flex-1 rounded-xl border px-3 py-2 text-sm" placeholder="메시지를 입력하세요…" />
        <Button size="sm">전송</Button>
      </div>
    </Card>
  );
}
