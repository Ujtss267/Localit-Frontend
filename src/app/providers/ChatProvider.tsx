import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type ChatKind = "EVENT" | "GROUP" | "DIRECT";

export type ChatMember = {
  userId: number;
  name: string;
  avatarUrl?: string;
  role?: "HOST" | "MANAGER" | "MEMBER";
  isOnline?: boolean;
};

export type ChatSession = {
  kind: ChatKind;
  id: number;
  title: string;
  path: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageAt?: string;
  membersCount?: number;
  counterpart?: ChatMember;
};

export type ChatMessage = {
  id: string;
  kind: ChatKind;
  roomId: number;
  text: string;
  createdAt: string;
  fromMe: boolean;
  senderId: number;
  name: string;
  avatarUrl?: string;
  isAnnouncement?: boolean;
};

type SendMessageInput = {
  kind: ChatKind;
  id: number;
  text: string;
  fromMe?: boolean;
  senderId?: number;
  name?: string;
  avatarUrl?: string;
  isAnnouncement?: boolean;
};

type OpenEventChatInput = {
  eventId: number;
  title: string;
  members?: ChatMember[];
};

type OpenGroupChatInput = {
  groupId: number;
  title: string;
  membersCount?: number;
  members?: ChatMember[];
};

type OpenDirectChatInput = {
  userId: number;
  name: string;
  avatarUrl?: string;
};

type ChatContextValue = {
  openChats: ChatSession[];
  directContacts: ChatMember[];
  openEventChat: (input: OpenEventChatInput) => void;
  openGroupChat: (input: OpenGroupChatInput) => void;
  openDirectChat: (input: OpenDirectChatInput) => void;
  getMessages: (kind: ChatKind, id: number) => ChatMessage[];
  getRoomMembers: (kind: ChatKind, id: number) => ChatMember[];
  sendMessage: (input: SendMessageInput) => void;
  markAsRead: (kind: ChatKind, id: number) => void;
  closeChat: (kind: ChatKind, id: number) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

const MY_PROFILE: ChatMember = {
  userId: 999,
  name: "나",
  avatarUrl: "https://i.pravatar.cc/80?img=5",
  role: "MEMBER",
  isOnline: true,
};

const DIRECT_CONTACTS: ChatMember[] = [
  { userId: 1, name: "Alice", avatarUrl: "https://i.pravatar.cc/80?img=1", role: "MEMBER", isOnline: true },
  { userId: 2, name: "Bob", avatarUrl: "https://i.pravatar.cc/80?img=2", role: "MEMBER", isOnline: false },
  { userId: 3, name: "Charlie", avatarUrl: "https://i.pravatar.cc/80?img=3", role: "MEMBER", isOnline: true },
  { userId: 4, name: "Dana", avatarUrl: "https://i.pravatar.cc/80?img=4", role: "MEMBER", isOnline: false },
];

type SessionMap = Record<string, ChatSession>;
type MessageMap = Record<string, ChatMessage[]>;
type MemberMap = Record<string, ChatMember[]>;

function roomKey(kind: ChatKind, id: number) {
  return `${kind}:${id}`;
}

function roomPath(kind: ChatKind, id: number) {
  if (kind === "EVENT") return `/chat/events/${id}`;
  if (kind === "GROUP") return `/chat/groups/${id}`;
  return `/chat/direct/${id}`;
}

function withCountFromMembers(session: ChatSession, members: ChatMember[] | undefined) {
  if (!members || session.kind === "DIRECT") return session;
  return { ...session, membersCount: members.length };
}

function buildInitialData(): { sessions: SessionMap; messages: MessageMap; members: MemberMap } {
  const eventId = 101;
  const groupId = 301;
  const directUser = DIRECT_CONTACTS[0];
  const now = new Date();

  const sessions: SessionMap = {
    [roomKey("EVENT", eventId)]: {
      kind: "EVENT",
      id: eventId,
      title: "영어회화 스터디 1회차",
      path: roomPath("EVENT", eventId),
      unreadCount: 2,
      lastMessage: "늦는 분 있으면 채팅 남겨주세요.",
      lastMessageAt: new Date(now.getTime() - 3 * 60 * 1000).toISOString(),
      membersCount: 4,
    },
    [roomKey("GROUP", groupId)]: {
      kind: "GROUP",
      id: groupId,
      title: "주말 러닝 크루",
      path: roomPath("GROUP", groupId),
      unreadCount: 0,
      lastMessage: "이번 주 코스 공유 완료!",
      lastMessageAt: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
      membersCount: 5,
    },
    [roomKey("DIRECT", directUser.userId)]: {
      kind: "DIRECT",
      id: directUser.userId,
      title: directUser.name,
      path: roomPath("DIRECT", directUser.userId),
      unreadCount: 1,
      lastMessage: "내일 일정 괜찮아요?",
      lastMessageAt: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
      counterpart: directUser,
    },
  };

  const members: MemberMap = {
    [roomKey("EVENT", eventId)]: [
      { userId: 7, name: "호스트", avatarUrl: "https://i.pravatar.cc/80?img=15", role: "HOST", isOnline: true },
      { userId: 11, name: "Mina", avatarUrl: "https://i.pravatar.cc/80?img=11", role: "MEMBER", isOnline: true },
      { userId: 12, name: "Alex", avatarUrl: "https://i.pravatar.cc/80?img=12", role: "MEMBER", isOnline: false },
      MY_PROFILE,
    ],
    [roomKey("GROUP", groupId)]: [
      { userId: 21, name: "Runner Jay", avatarUrl: "https://i.pravatar.cc/80?img=21", role: "MANAGER", isOnline: true },
      { userId: 22, name: "Eun", avatarUrl: "https://i.pravatar.cc/80?img=22", role: "MEMBER", isOnline: true },
      { userId: 23, name: "Noah", avatarUrl: "https://i.pravatar.cc/80?img=23", role: "MEMBER", isOnline: false },
      { userId: 24, name: "Sora", avatarUrl: "https://i.pravatar.cc/80?img=24", role: "MEMBER", isOnline: false },
      MY_PROFILE,
    ],
    [roomKey("DIRECT", directUser.userId)]: [MY_PROFILE, directUser],
  };

  const messages: MessageMap = {
    [roomKey("EVENT", eventId)]: [
      {
        id: "seed-ev-1",
        kind: "EVENT",
        roomId: eventId,
        text: "내일 19:30 시작입니다.",
        createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        fromMe: false,
        senderId: 7,
        name: "호스트",
        avatarUrl: "https://i.pravatar.cc/80?img=15",
        isAnnouncement: true,
      },
      {
        id: "seed-ev-2",
        kind: "EVENT",
        roomId: eventId,
        text: "늦는 분 있으면 채팅 남겨주세요.",
        createdAt: new Date(now.getTime() - 3 * 60 * 1000).toISOString(),
        fromMe: false,
        senderId: 11,
        name: "Mina",
        avatarUrl: "https://i.pravatar.cc/80?img=11",
      },
    ],
    [roomKey("GROUP", groupId)]: [
      {
        id: "seed-gr-1",
        kind: "GROUP",
        roomId: groupId,
        text: "이번 주 코스 공유 완료!",
        createdAt: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
        fromMe: false,
        senderId: 21,
        name: "Runner Jay",
        avatarUrl: "https://i.pravatar.cc/80?img=21",
      },
    ],
    [roomKey("DIRECT", directUser.userId)]: [
      {
        id: "seed-dm-1",
        kind: "DIRECT",
        roomId: directUser.userId,
        text: "내일 일정 괜찮아요?",
        createdAt: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
        fromMe: false,
        senderId: directUser.userId,
        name: directUser.name,
        avatarUrl: directUser.avatarUrl,
      },
    ],
  };

  return { sessions, messages, members };
}

function buildDefaultMembers(kind: ChatKind, id: number, title: string): ChatMember[] {
  if (kind === "DIRECT") {
    const match = DIRECT_CONTACTS.find((c) => c.userId === id);
    return match ? [MY_PROFILE, match] : [MY_PROFILE, { userId: id, name: title, role: "MEMBER" }];
  }
  if (kind === "EVENT") {
    return [
      { userId: 100 + id, name: `${title} 호스트`, avatarUrl: "https://i.pravatar.cc/80?img=32", role: "HOST", isOnline: true },
      { userId: 200 + id, name: "참여자 A", avatarUrl: "https://i.pravatar.cc/80?img=33", role: "MEMBER", isOnline: true },
      { userId: 300 + id, name: "참여자 B", avatarUrl: "https://i.pravatar.cc/80?img=34", role: "MEMBER", isOnline: false },
      MY_PROFILE,
    ];
  }
  return [
    { userId: 400 + id, name: `${title} 운영자`, avatarUrl: "https://i.pravatar.cc/80?img=35", role: "MANAGER", isOnline: true },
    { userId: 500 + id, name: "멤버 1", avatarUrl: "https://i.pravatar.cc/80?img=36", role: "MEMBER", isOnline: true },
    { userId: 600 + id, name: "멤버 2", avatarUrl: "https://i.pravatar.cc/80?img=37", role: "MEMBER", isOnline: false },
    MY_PROFILE,
  ];
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => buildInitialData(), []);
  const [sessionMap, setSessionMap] = useState<SessionMap>(initial.sessions);
  const [messageMap, setMessageMap] = useState<MessageMap>(initial.messages);
  const [memberMap, setMemberMap] = useState<MemberMap>(initial.members);

  const ensureSession = useCallback(
    (kind: ChatKind, id: number, title: string, options?: { membersCount?: number; counterpart?: ChatMember }) => {
      setSessionMap((prev) => {
        const key = roomKey(kind, id);
        const existing = prev[key];

        if (existing) {
          return {
            ...prev,
            [key]: {
              ...existing,
              title,
              path: roomPath(kind, id),
              membersCount: kind === "DIRECT" ? undefined : options?.membersCount ?? existing.membersCount,
              counterpart: kind === "DIRECT" ? options?.counterpart ?? existing.counterpart : undefined,
            },
          };
        }

        return {
          ...prev,
          [key]: {
            kind,
            id,
            title,
            path: roomPath(kind, id),
            unreadCount: 0,
            membersCount: kind === "DIRECT" ? undefined : options?.membersCount,
            counterpart: kind === "DIRECT" ? options?.counterpart : undefined,
          },
        };
      });

      setMemberMap((prev) => {
        const key = roomKey(kind, id);
        if (prev[key]) return prev;
        const defaults = buildDefaultMembers(kind, id, title);
        return { ...prev, [key]: defaults };
      });
    },
    []
  );

  const openEventChat = useCallback(
    ({ eventId, title, members }: OpenEventChatInput) => {
      const normalizedMembers = members?.length ? members : buildDefaultMembers("EVENT", eventId, title);
      ensureSession("EVENT", eventId, title, { membersCount: normalizedMembers.length });
      setMemberMap((prev) => ({ ...prev, [roomKey("EVENT", eventId)]: normalizedMembers }));
      setSessionMap((prev) => {
        const key = roomKey("EVENT", eventId);
        const target = prev[key];
        if (!target) return prev;
        return { ...prev, [key]: withCountFromMembers(target, normalizedMembers) };
      });
    },
    [ensureSession]
  );

  const openGroupChat = useCallback(
    ({ groupId, title, membersCount, members }: OpenGroupChatInput) => {
      const normalizedMembers = members?.length ? members : buildDefaultMembers("GROUP", groupId, title);
      ensureSession("GROUP", groupId, title, { membersCount: membersCount ?? normalizedMembers.length });
      setMemberMap((prev) => ({ ...prev, [roomKey("GROUP", groupId)]: normalizedMembers }));
      setSessionMap((prev) => {
        const key = roomKey("GROUP", groupId);
        const target = prev[key];
        if (!target) return prev;
        return {
          ...prev,
          [key]: {
            ...target,
            membersCount: membersCount ?? normalizedMembers.length,
          },
        };
      });
    },
    [ensureSession]
  );

  const openDirectChat = useCallback(
    ({ userId, name, avatarUrl }: OpenDirectChatInput) => {
      const counterpart: ChatMember = {
        userId,
        name,
        avatarUrl,
        role: "MEMBER",
      };
      ensureSession("DIRECT", userId, name, { counterpart });
      setMemberMap((prev) => ({ ...prev, [roomKey("DIRECT", userId)]: [MY_PROFILE, counterpart] }));
    },
    [ensureSession]
  );

  const getMessages = useCallback(
    (kind: ChatKind, id: number) => {
      return messageMap[roomKey(kind, id)] ?? [];
    },
    [messageMap]
  );

  const getRoomMembers = useCallback(
    (kind: ChatKind, id: number) => {
      return memberMap[roomKey(kind, id)] ?? [];
    },
    [memberMap]
  );

  const sendMessage = useCallback((input: SendMessageInput) => {
    const { kind, id, text, fromMe = true, senderId, name, avatarUrl, isAnnouncement } = input;
    const key = roomKey(kind, id);
    const createdAt = new Date().toISOString();

    const members = memberMap[key] ?? buildDefaultMembers(kind, id, `채팅 ${id}`);
    const me = members.find((m) => m.userId === MY_PROFILE.userId) ?? MY_PROFILE;
    const sender =
      !fromMe && senderId != null
        ? members.find((m) => m.userId === senderId) ?? { userId: senderId, name: name ?? `User #${senderId}`, avatarUrl }
        : me;

    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      kind,
      roomId: id,
      text,
      createdAt,
      fromMe,
      senderId: fromMe ? me.userId : sender.userId,
      name: name ?? sender.name,
      avatarUrl: avatarUrl ?? sender.avatarUrl,
      isAnnouncement,
    };

    setMessageMap((prev) => ({
      ...prev,
      [key]: [...(prev[key] ?? []), message],
    }));

    setSessionMap((prev) => {
      const existing = prev[key];
      if (!existing) return prev;
      return {
        ...prev,
        [key]: {
          ...existing,
          lastMessage: text,
          lastMessageAt: createdAt,
          unreadCount: fromMe ? existing.unreadCount : existing.unreadCount + 1,
        },
      };
    });
  }, [memberMap]);

  const markAsRead = useCallback((kind: ChatKind, id: number) => {
    const key = roomKey(kind, id);
    setSessionMap((prev) => {
      const existing = prev[key];
      if (!existing) return prev;
      if (existing.unreadCount === 0) return prev;
      return {
        ...prev,
        [key]: {
          ...existing,
          unreadCount: 0,
        },
      };
    });
  }, []);

  const closeChat = useCallback((kind: ChatKind, id: number) => {
    const key = roomKey(kind, id);
    setSessionMap((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const openChats = useMemo(() => {
    return Object.values(sessionMap).sort((a, b) => {
      const at = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bt = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bt - at;
    });
  }, [sessionMap]);

  const value = useMemo<ChatContextValue>(
    () => ({
      openChats,
      directContacts: DIRECT_CONTACTS,
      openEventChat,
      openGroupChat,
      openDirectChat,
      getMessages,
      getRoomMembers,
      sendMessage,
      markAsRead,
      closeChat,
    }),
    [openChats, openEventChat, openGroupChat, openDirectChat, getMessages, getRoomMembers, sendMessage, markAsRead, closeChat]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
}
