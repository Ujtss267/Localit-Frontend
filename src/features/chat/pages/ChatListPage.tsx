import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { mobileText } from "@/components/ui/mobileTypography";
import { useChat, type ChatKind } from "@/app/providers/ChatProvider";

type MainTab = "CHATS" | "FRIENDS";
type ChatTab = "ALL" | "EVENT" | "GROUP" | "DIRECT";

function formatTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function KindBadge({ kind }: { kind: ChatKind }) {
  const label = kind === "EVENT" ? "이벤트" : kind === "GROUP" ? "그룹" : "1:1";
  const compact = kind === "EVENT" ? "E" : kind === "GROUP" ? "G" : "1";
  return (
    <>
      <span
        aria-label={label}
        title={label}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-neutral-700 text-[10px] font-semibold text-neutral-300 sm:hidden"
      >
        {compact}
      </span>
      <span className="hidden rounded-full border border-neutral-700 px-2 py-0.5 text-[10px] text-neutral-300 sm:inline-flex">{label}</span>
    </>
  );
}

export default function ChatListPage() {
  const { openChats, closeChat, openGroupChat, openDirectChat, directContacts } = useChat();
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState<MainTab>("CHATS");
  const [chatTab, setChatTab] = useState<ChatTab>("ALL");
  const [query, setQuery] = useState("");

  const filteredChats = useMemo(() => {
    const q = query.trim().toLowerCase();
    return openChats.filter((c) => {
      if (chatTab !== "ALL" && c.kind !== chatTab) return false;
      if (!q) return true;
      return c.title.toLowerCase().includes(q) || (c.lastMessage ?? "").toLowerCase().includes(q);
    });
  }, [openChats, chatTab, query]);

  const filteredFriends = useMemo(() => {
    const q = query.trim().toLowerCase();
    return directContacts.filter((c) => (!q ? true : c.name.toLowerCase().includes(q)));
  }, [directContacts, query]);

  return (
    <div className="mx-auto max-w-3xl space-y-3 px-3 py-4 text-neutral-100 sm:px-4 sm:py-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className={`${mobileText.title} font-semibold`}>채팅</h1>
          <p className={`${mobileText.meta} mt-1 text-neutral-400`}>목록을 분리해서 채팅방과 친구를 번갈아 관리할 수 있어요.</p>
        </div>
        {mainTab === "CHATS" && (
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
        )}
      </div>

      <Card className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "CHATS" as MainTab, label: "채팅" },
              { value: "FRIENDS" as MainTab, label: "친구" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setMainTab(item.value)}
                className={`h-9 rounded-lg text-sm ${mainTab === item.value ? "bg-yellow-400 text-neutral-950" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mainTab === "CHATS" ? "채팅방/메시지 검색" : "친구 검색"}
            className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs text-neutral-100 placeholder:text-neutral-500 sm:text-sm"
          />

          {mainTab === "CHATS" && (
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: "ALL" as ChatTab, label: "전체" },
                { value: "EVENT" as ChatTab, label: "이벤트" },
                { value: "GROUP" as ChatTab, label: "그룹" },
                { value: "DIRECT" as ChatTab, label: "1:1" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setChatTab(item.value)}
                  className={`h-9 rounded-lg text-xs sm:text-sm ${chatTab === item.value ? "bg-blue-500 text-white" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {mainTab === "CHATS" ? (
        <Card className="rounded-2xl border border-neutral-800 bg-neutral-900 p-0">
          <div className="border-b border-neutral-800 px-4 py-3 text-xs font-medium text-neutral-400 sm:text-sm">채팅방</div>
          {!filteredChats.length ? (
            <div className="px-4 py-8 text-center text-sm text-neutral-400">표시할 채팅방이 없습니다.</div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {filteredChats.map((c) => (
                <div key={`${c.kind}-${c.id}`} className="flex items-center gap-2 px-2 py-2 sm:px-3">
                  <button type="button" onClick={() => navigate(c.path)} className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1 py-1 text-left hover:bg-neutral-800 sm:gap-3">
                    <img
                      src={c.counterpart?.avatarUrl || "https://i.pravatar.cc/80?img=40"}
                      alt={c.title}
                      className="h-10 w-10 rounded-full border border-neutral-700 object-cover sm:h-11 sm:w-11"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="truncate text-sm font-medium text-neutral-100 sm:text-[15px]">{c.title}</span>
                        <KindBadge kind={c.kind} />
                        {c.unreadCount > 0 && <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] leading-none text-white sm:px-2">{c.unreadCount}</span>}
                      </div>
                      <div className="mt-0.5 truncate text-[11px] text-neutral-400 sm:text-xs">{c.lastMessage || "아직 메시지가 없습니다."}</div>
                    </div>
                    <div className="shrink-0 text-[10px] text-neutral-500 sm:text-[11px]">{formatTime(c.lastMessageAt)}</div>
                  </button>
                  <button
                    type="button"
                    aria-label="채팅방 닫기"
                    onClick={() => closeChat(c.kind, c.id)}
                    className="rounded-md px-1.5 py-1 text-[11px] text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300 sm:px-2 sm:text-xs"
                  >
                    닫기
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <Card className="rounded-2xl border border-neutral-800 bg-neutral-900 p-0">
          <div className="border-b border-neutral-800 px-4 py-3 text-xs font-medium text-neutral-400 sm:text-sm">친구</div>
          {!filteredFriends.length ? (
            <div className="px-4 py-8 text-center text-sm text-neutral-400">검색된 친구가 없습니다.</div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {filteredFriends.map((contact) => (
                <button
                  key={contact.userId}
                  type="button"
                  onClick={() => {
                    openDirectChat({ userId: contact.userId, name: contact.name, avatarUrl: contact.avatarUrl });
                    navigate(`/chat/direct/${contact.userId}`);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-neutral-800"
                >
                  <img
                    src={contact.avatarUrl || "https://i.pravatar.cc/80"}
                    alt={contact.name}
                    className="h-10 w-10 rounded-full border border-neutral-700 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-neutral-100">{contact.name}</div>
                    <div className="mt-0.5 text-[11px] text-neutral-500">{contact.isOnline ? "온라인" : "오프라인"}</div>
                  </div>
                  <span className="text-xs text-neutral-300">대화</span>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
