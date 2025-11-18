// src/app/providers/ChatProvider.tsx
import { createContext, useContext, useState, ReactNode } from "react";

export type ChatSession = {
  kind: "EVENT";
  id: number;
  title: string;
  path: string; // 예: /chat/events/1
};

type ChatContextValue = {
  openChats: ChatSession[];
  openEventChat: (params: { eventId: number; title: string }) => void;
  closeChat: (kind: ChatSession["kind"], id: number) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [openChats, setOpenChats] = useState<ChatSession[]>([]);

  const openEventChat = ({ eventId, title }: { eventId: number; title: string }) => {
    setOpenChats((prev) => {
      const exists = prev.find((c) => c.kind === "EVENT" && c.id === eventId);
      if (exists) {
        // 이미 있으면 그대로 유지
        return prev;
      }
      return [
        ...prev,
        {
          kind: "EVENT",
          id: eventId,
          title,
          path: `/chat/events/${eventId}`,
        },
      ];
    });
  };

  const closeChat = (kind: ChatSession["kind"], id: number) => {
    setOpenChats((prev) => prev.filter((c) => !(c.kind === kind && c.id === id)));
  };

  return <ChatContext.Provider value={{ openChats, openEventChat, closeChat }}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
