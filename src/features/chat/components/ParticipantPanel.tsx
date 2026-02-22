import type { ChatMember } from "@/app/providers/ChatProvider";

type ParticipantPanelProps = {
  open: boolean;
  title: string;
  members: ChatMember[];
  myUserId?: number;
  onClose: () => void;
  onStartDirect: (member: ChatMember) => void;
};

export default function ParticipantPanel({ open, title, members, myUserId = 999, onClose, onStartDirect }: ParticipantPanelProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="참여자 목록 닫기" className="absolute inset-0 bg-black/45" onClick={onClose} />

      <aside className="absolute right-0 top-0 h-full w-[88%] max-w-sm border-l border-neutral-800 bg-neutral-900 text-neutral-100 shadow-2xl">
        <div className="flex h-14 items-center justify-between border-b border-neutral-800 px-4">
          <div className="text-sm font-semibold">{title}</div>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800">
            닫기
          </button>
        </div>

        <div className="h-[calc(100%-56px)] overflow-y-auto">
          <div className="border-b border-neutral-800 px-4 py-3 text-xs text-neutral-400">참여자를 눌러 1:1 대화를 시작할 수 있어요.</div>
          {members.map((member) => {
            const isMe = member.userId === myUserId;
            return (
              <button
                key={member.userId}
                type="button"
                disabled={isMe}
                onClick={() => onStartDirect(member)}
                className={`flex w-full items-center gap-3 border-b border-neutral-800 px-4 py-3 text-left ${
                  isMe ? "cursor-default opacity-70" : "hover:bg-neutral-800"
                }`}
              >
                <img
                  src={member.avatarUrl || "https://i.pravatar.cc/80"}
                  alt={member.name}
                  className="h-10 w-10 rounded-full border border-neutral-700 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{member.name}</div>
                  <div className="mt-0.5 text-[11px] text-neutral-400">
                    {isMe ? "나" : member.role || "MEMBER"} · {member.isOnline ? "온라인" : "오프라인"}
                  </div>
                </div>
                {!isMe && <span className="text-[11px] text-neutral-300">1:1</span>}
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
