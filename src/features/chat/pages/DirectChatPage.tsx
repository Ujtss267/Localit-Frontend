import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useChat } from "@/app/providers/ChatProvider";
import { mobileText } from "@/components/ui/mobileTypography";
import ParticipantPanel from "@/features/chat/components/ParticipantPanel";

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export default function DirectChatPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { openDirectChat, getMessages, sendMessage, markAsRead, getRoomMembers, directContacts, openChats } = useChat();
  const [text, setText] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const id = Number(userId);
  if (Number.isNaN(id)) {
    return <div className="p-4 text-sm text-neutral-200">잘못된 사용자 ID입니다.</div>;
  }

  const contact = useMemo(() => directContacts.find((c) => c.userId === id), [directContacts, id]);
  const opened = useMemo(() => openChats.find((c) => c.kind === "DIRECT" && c.id === id), [openChats, id]);
  const title = opened?.title ?? contact?.name ?? `사용자 #${id}`;

  const messages = getMessages("DIRECT", id);
  const members = getRoomMembers("DIRECT", id);

  useEffect(() => {
    openDirectChat({ userId: id, name: title, avatarUrl: contact?.avatarUrl });
    markAsRead("DIRECT", id);
  }, [id, title, contact?.avatarUrl, openDirectChat, markAsRead]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  const onSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage({ kind: "DIRECT", id, text: trimmed, fromMe: true });
    setText("");
  };

  const canSend = text.trim().length > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-2 px-2 py-2 text-neutral-100 sm:space-y-3 sm:px-4 sm:py-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <img
            src={contact?.avatarUrl || opened?.counterpart?.avatarUrl || "https://i.pravatar.cc/80"}
            alt={title}
            className="h-10 w-10 rounded-full border border-neutral-700 object-cover"
          />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold sm:text-base">{title}</h1>
            <p className={`${mobileText.meta} mt-1 text-neutral-400`}>1:1 채팅</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowMembers((v) => !v)}>
            정보
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/chat")}>
            목록
          </Button>
        </div>
      </div>
      <ParticipantPanel
        open={showMembers}
        title={`${title} 대화 정보`}
        members={members}
        onClose={() => setShowMembers(false)}
        onStartDirect={(member) => {
          openDirectChat({ userId: member.userId, name: member.name, avatarUrl: member.avatarUrl });
          setShowMembers(false);
          navigate(`/chat/direct/${member.userId}`);
        }}
      />

      <Card className="rounded-2xl border border-neutral-800 bg-neutral-900 p-0">
        <div className="flex h-[calc(100svh-165px)] min-h-[420px] flex-col sm:h-[68svh]">
          <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex items-end gap-2 ${m.fromMe ? "justify-end" : "justify-start"}`}>
              {!m.fromMe && (
                <img src={m.avatarUrl || "https://i.pravatar.cc/80"} alt={m.name} className="h-7 w-7 rounded-full border border-neutral-700 object-cover" />
              )}
              <div className={`max-w-[84%] rounded-2xl px-3 py-2 ${m.fromMe ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-100"}`}>
                {!m.fromMe && <div className="mb-0.5 text-[10px] text-neutral-400">{m.name}</div>}
                <div className="whitespace-pre-wrap break-words text-sm">{m.text}</div>
                <div className={`mt-1 text-[10px] ${m.fromMe ? "text-blue-100" : "text-neutral-500"}`}>{formatTime(m.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>

          <div className="border-t border-neutral-800 bg-neutral-900/95 px-2 py-2 backdrop-blur">
            <div className="flex items-end gap-2">
              <textarea
                className="min-h-11 max-h-28 flex-1 resize-none rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-3 text-sm text-neutral-100 placeholder:text-neutral-500"
                placeholder="메시지를 입력하세요... (Shift+Enter 줄바꿈)"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
              />
              <Button size="sm" onClick={onSend} disabled={!canSend} className="h-11 shrink-0">
                전송
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
