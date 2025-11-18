// src/features/chat/pages/ChatListPage.tsx
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useChat } from "@/app/providers/ChatProvider";

export default function ChatListPage() {
  const { openChats, closeChat } = useChat();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <h1 className="mb-4 text-xl font-semibold">내 채팅방</h1>

      {!openChats.length ? (
        <Card className="rounded-2xl border p-4 text-sm text-neutral-600">
          아직 열린 채팅이 없어요.
          <br />
          이벤트나 모임에서 채팅을 시작하면 여기에 표시됩니다.
        </Card>
      ) : (
        <div className="space-y-3">
          {openChats.map((c) => (
            <Card key={`${c.kind}-${c.id}`} className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm">
              <div>
                <div className="font-medium">{c.title}</div>
                {c.kind === "EVENT" && <div className="text-xs text-neutral-500">이벤트 채팅</div>}
              </div>
              <div className="flex items-center gap-2">
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
