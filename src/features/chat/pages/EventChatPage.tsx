// src/features/chat/pages/EventChatPage.tsx
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useChat } from "@/app/providers/ChatProvider";
import { mobileText } from "@/components/ui/mobileTypography";

export default function EventChatPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { openEventChat } = useChat();

  const id = Number(eventId);
  if (Number.isNaN(id)) {
    // 잘못된 URL 방어
    return <div className="p-4 text-sm text-neutral-200">잘못된 이벤트 ID입니다.</div>;
  }

  // TODO: 실제로는 이벤트 제목을 API로 가져오기
  const eventTitle = `이벤트 #${id}`;

  // 이 방을 "열린 채팅" 목록에 등록
  useEffect(() => {
    openEventChat({ eventId: id, title: eventTitle });
  }, [id, eventTitle, openEventChat]);

  // TODO: 실제 메시지는 useEventChat(eventId) 등으로 교체
  const messages = [
    { id: 1, fromMe: false, name: "Anna", text: "안녕하세요! 처음 가는 사람도 괜찮나요?" },
    { id: 2, fromMe: true, name: "호스트(나)", text: "물론이죠 :) 편하게 오시면 됩니다." },
  ];

  return (
    <div className="mx-auto max-w-3xl p-4 text-neutral-100 sm:p-6">
      {/* 상단 헤더 */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <button className={`hidden ${mobileText.meta} text-neutral-400 hover:underline sm:inline-block`} onClick={() => navigate("/chat")}>
          ← 채팅 목록으로
        </button>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm font-medium sm:inline">{eventTitle}</span>
          <Button size="sm" variant="outline" onClick={() => navigate(`/events/${id}`)}>
            이벤트 상세
          </Button>
        </div>
      </div>

      {/* 채팅 카드 */}
      <Card className="flex h-[520px] flex-col rounded-2xl border border-neutral-800 bg-neutral-900">
        <div className="border-b border-neutral-800 px-4 py-3 text-sm font-semibold text-neutral-100">이벤트 채팅</div>
        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-sm">
          {messages.map((m) => (
            <div key={m.id} className={"flex " + (m.fromMe ? "justify-end" : "justify-start")}>
              <div className={"max-w-[70%] rounded-2xl px-3 py-2 " + (m.fromMe ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-100")}>
                {!m.fromMe && <div className={`mb-0.5 ${mobileText.meta} font-medium text-neutral-400`}>{m.name}</div>}
                <div>{m.text}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-neutral-800 px-3 py-2">
          <input
            className="h-11 flex-1 rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 placeholder:text-neutral-500"
            placeholder="메시지를 입력하세요…"
          />
          <Button size="sm">전송</Button>
        </div>
      </Card>
    </div>
  );
}
