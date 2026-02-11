import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import { mobileText } from "@/components/ui/mobileTypography";
import { useChat, type ChatKind } from "@/app/providers/ChatProvider";

type ChatTab = "ALL" | "EVENT" | "GROUP" | "DIRECT";

function formatTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function KindBadge({ kind }: { kind: ChatKind }) {
  const label = kind === "EVENT" ? "이벤트" : kind === "GROUP" ? "그룹" : "1:1";
  return <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-[10px] text-neutral-300">{label}</span>;
}

export default function ChatListPage() {
  const { openChats, closeChat, openGroupChat, openDirectChat, directContacts } = useChat();
  const navigate = useNavigate();
  const [tab, setTab] = useState<ChatTab>("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return openChats.filter((c) => {
      if (tab !== "ALL" && c.kind !== tab) return false;
      if (!q) return true;
      return c.title.toLowerCase().includes(q) || (c.lastMessage ?? "").toLowerCase().includes(q);
    });
  }, [openChats, tab, query]);

  return (
    <div className="mx-auto max-w-3xl space-y-3 px-3 py-4 text-neutral-100 sm:px-4 sm:py-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className={`${mobileText.title} font-semibold`}>채팅</h1>
          <p className={`${mobileText.meta} mt-1 text-neutral-400`}>이벤트, 그룹, 1:1 채팅을 한 곳에서 확인하세요.</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const groupId = Date.now();
              openGroupChat({ groupId, title: `새 그룹채팅 ${new Date().toLocaleDateString("ko-KR")}`, membersCount: 3 });
              navigate(`/chat/groups/${groupId}`);
            }}
            className="whitespace-nowrap text-[11px] sm:text-sm"
          >
            그룹 만들기
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const target = directContacts[0];
              if (!target) return;
              openDirectChat({ userId: target.userId, name: target.name, avatarUrl: target.avatarUrl });
              navigate(`/chat/direct/${target.userId}`);
            }}
            className="whitespace-nowrap text-[11px] sm:text-sm"
          >
            1:1 시작
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3">
        <div className="space-y-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="채팅방/메시지 검색"
            className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs text-neutral-100 placeholder:text-neutral-500 sm:text-sm"
          />
          <Tabs<ChatTab>
            value={tab}
            onChange={setTab}
            size="sm"
            fullWidth
            tabs={[
              { value: "ALL", label: "전체" },
              { value: "EVENT", label: "이벤트" },
              { value: "GROUP", label: "그룹" },
              { value: "DIRECT", label: "1:1" },
            ]}
          />
        </div>
      </Card>

      <Card className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-medium text-neutral-300 sm:text-sm">빠른 1:1 시작</div>
          <div className={`${mobileText.meta} text-neutral-500`}>팔로우/참여 기반 추천</div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {directContacts.map((contact) => (
            <button
              key={contact.userId}
              type="button"
              onClick={() => {
                openDirectChat({ userId: contact.userId, name: contact.name, avatarUrl: contact.avatarUrl });
                navigate(`/chat/direct/${contact.userId}`);
              }}
              className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-2 py-2 text-left hover:bg-neutral-800"
            >
              <img
                src={contact.avatarUrl || "https://i.pravatar.cc/80"}
                alt={contact.name}
                className="h-8 w-8 rounded-full border border-neutral-700 object-cover"
              />
              <div className="min-w-0">
                <div className="truncate text-xs text-neutral-100 sm:text-sm">{contact.name}</div>
                <div className="text-[10px] text-neutral-500">{contact.isOnline ? "온라인" : "오프라인"}</div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {!filtered.length ? (
        <Card className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-center text-sm text-neutral-300">
          표시할 채팅방이 없습니다.
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <Card key={`${c.kind}-${c.id}`} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3">
              <button type="button" onClick={() => navigate(c.path)} className="w-full text-left">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <img
                        src={c.counterpart?.avatarUrl || "https://i.pravatar.cc/80?img=40"}
                        alt={c.title}
                        className="mt-0.5 h-8 w-8 shrink-0 rounded-full border border-neutral-700 object-cover"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-neutral-100">{c.title}</span>
                          <KindBadge kind={c.kind} />
                          {c.unreadCount > 0 && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] text-white">{c.unreadCount}</span>}
                        </div>
                        <div className={`${mobileText.meta} mt-1 truncate text-neutral-400`}>{c.lastMessage || "아직 메시지가 없습니다."}</div>
                        {c.membersCount ? <div className={`${mobileText.meta} mt-1 text-neutral-500`}>참여 {c.membersCount}명</div> : null}
                      </div>
                    </div>
                  </div>
                  <div className={`${mobileText.meta} text-neutral-500`}>{formatTime(c.lastMessageAt)}</div>
                </div>
              </button>
              <div className="mt-2 flex items-center justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => closeChat(c.kind, c.id)}>
                  닫기
                </Button>
                <Button size="sm" onClick={() => navigate(c.path)}>
                  들어가기
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
