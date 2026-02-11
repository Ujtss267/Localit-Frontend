import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useChat } from "@/app/providers/ChatProvider";
import { mobileText } from "@/components/ui/mobileTypography";

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export default function GroupChatPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { openGroupChat, getMessages, sendMessage, markAsRead, openChats, getRoomMembers } = useChat();
  const [text, setText] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const id = Number(groupId);

  if (Number.isNaN(id)) {
    return <div className="p-4 text-sm text-neutral-200">잘못된 그룹 ID입니다.</div>;
  }

  const chatInfo = useMemo(() => openChats.find((c) => c.kind === "GROUP" && c.id === id), [openChats, id]);
  const chatTitle = chatInfo?.title ?? `그룹 #${id}`;
  const messages = getMessages("GROUP", id);
  const members = getRoomMembers("GROUP", id);
  const announcements = messages.filter((m) => m.isAnnouncement);

  useEffect(() => {
    openGroupChat({ groupId: id, title: chatTitle, membersCount: chatInfo?.membersCount ?? (members.length || 0) });
    markAsRead("GROUP", id);
  }, [id, chatTitle, chatInfo?.membersCount, members.length, openGroupChat, markAsRead]);

  const onSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage({ kind: "GROUP", id, text: trimmed, fromMe: true });
    setText("");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-3 px-3 py-4 text-neutral-100 sm:px-4 sm:py-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-sm font-semibold sm:text-base">{chatTitle}</h1>
          <p className={`${mobileText.meta} mt-1 text-neutral-400`}>그룹 채팅 · 참여 {members.length}명</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowMembers((v) => !v)}>
            참여자
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/chat")}>
            목록
          </Button>
        </div>
      </div>

      {showMembers && (
        <Card className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3">
          <div className="mb-2 text-xs font-medium text-neutral-300 sm:text-sm">참여자 목록</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {members.map((member) => (
              <div key={member.userId} className="flex items-center gap-2 rounded-xl border border-neutral-800 px-2 py-2">
                <img src={member.avatarUrl || "https://i.pravatar.cc/80"} alt={member.name} className="h-8 w-8 rounded-full border border-neutral-700 object-cover" />
                <div className="min-w-0">
                  <div className="truncate text-xs text-neutral-100 sm:text-sm">{member.name}</div>
                  <div className="text-[10px] text-neutral-500">
                    {member.role || "MEMBER"} · {member.isOnline ? "온라인" : "오프라인"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="rounded-2xl border border-neutral-800 bg-neutral-900">
        {announcements.length > 0 && (
          <div className="border-b border-neutral-800 px-3 py-2">
            <div className={`${mobileText.meta} font-medium text-amber-300`}>공지</div>
            <div className={`${mobileText.meta} mt-1 truncate text-neutral-300`}>{announcements[announcements.length - 1].text}</div>
          </div>
        )}

        <div className="h-[58svh] space-y-2 overflow-y-auto px-3 py-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex items-end gap-2 ${m.fromMe ? "justify-end" : "justify-start"}`}>
              {!m.fromMe && (
                <img src={m.avatarUrl || "https://i.pravatar.cc/80"} alt={m.name} className="h-7 w-7 rounded-full border border-neutral-700 object-cover" />
              )}
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${m.fromMe ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-100"}`}>
                {!m.fromMe && <div className="mb-0.5 text-[10px] text-neutral-400">{m.name}</div>}
                <div className="break-words text-sm">{m.text}</div>
                <div className={`mt-1 text-[10px] ${m.fromMe ? "text-blue-100" : "text-neutral-500"}`}>{formatTime(m.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-800 px-2 py-2">
          <div className="flex items-center gap-2">
            <input
              className="h-11 flex-1 rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 placeholder:text-neutral-500"
              placeholder="메시지를 입력하세요..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSend()}
            />
            <Button size="sm" onClick={onSend}>
              전송
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
