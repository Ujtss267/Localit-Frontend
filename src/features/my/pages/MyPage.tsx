import * as React from "react";

/*
 MyPage (Events & Rooms) UI — React + TS + Tailwind
 + 카드별 공개 범위 편집(공개/팔로워/비공개)
 + 팔로우/언팔로우
 + 팔로워/팔로잉 카운트 클릭 시 상세 리스트 화면
*/

// -----------------------------
// Types
// -----------------------------
type Visibility = "PUBLIC" | "FOLLOWERS" | "PRIVATE";
type EventType = "GENERAL" | "MENTORING" | "WORKSHOP" | "MEETUP";

type EventItem = {
  eventId: number;
  title: string;
  startTime: string; // ISO
  endTime: string; // ISO
  location?: string;
  lat?: number | null;
  lng?: number | null;
  type?: EventType;
  imageUrl?: string;
  visibility?: Visibility;
};

type RoomItem = {
  roomId: number;
  name: string;
  location?: string;
  lat?: number | null;
  lng?: number | null;
  capacity?: number;
  available?: boolean;
  imageUrl?: string;
  visibility?: Visibility;
};

type ReservationItem = {
  roomReservationId: number;
  room: Pick<RoomItem, "roomId" | "name" | "location" | "imageUrl" | "visibility">;
  startTime: string; // ISO
  endTime: string; // ISO
};

type MyPageSections = {
  hostedEvents: EventItem[];
  participatingEvents: EventItem[];
  roomReservations: ReservationItem[];
  myRooms: RoomItem[];
};

type UserBrief = {
  userId: number;
  displayName: string;
  avatarUrl?: string;
  isFollowingMe: boolean; // 나를 팔로우함
  iFollow: boolean; // 내가 팔로우함(상대 기준)
};

type MyPageResponse = {
  profileUserId: number;
  profileName: string;
  isOwner: boolean; // 내가 내 페이지 보는지
  isFollower: boolean; // 내가 이 유저를 팔로우 중인지 (isOwner=false 때 의미 있음)
  sections: MyPageSections;
  // 팔로워/팔로잉 리스트
  followers: UserBrief[];
  following: UserBrief[];
};

// -----------------------------
// Mock data
// -----------------------------
const mock: MyPageResponse = {
  profileUserId: 999,
  profileName: "Wookjin",
  isOwner: false, // 데모 위해 false → true로 바꾸면 팔로우 버튼 숨김
  isFollower: false,
  sections: {
    hostedEvents: [
      {
        eventId: 1,
        title: "Flutter 워크숍 #1",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
        location: "선릉",
        type: "WORKSHOP",
        imageUrl: "https://picsum.photos/seed/ev1/480/300",
        visibility: "PUBLIC",
      },
      {
        eventId: 2,
        title: "멘토링 데이",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 5400000).toISOString(),
        location: "판교",
        type: "MENTORING",
        imageUrl: "https://picsum.photos/seed/ev2/480/300",
        visibility: "FOLLOWERS",
      },
    ],
    participatingEvents: [
      {
        eventId: 3,
        title: "리액트 밋업",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        location: "강남",
        type: "MEETUP",
        imageUrl: "https://picsum.photos/seed/ev3/480/300",
        visibility: "PUBLIC",
      },
    ],
    roomReservations: [
      {
        roomReservationId: 10,
        room: { roomId: 101, name: "Localit Lab A", location: "선릉", imageUrl: "https://picsum.photos/seed/room1/480/300", visibility: "PRIVATE" },
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
      },
    ],
    myRooms: [
      {
        roomId: 101,
        name: "Localit Lab A",
        location: "선릉",
        capacity: 16,
        available: true,
        imageUrl: "https://picsum.photos/seed/room2/480/300",
        visibility: "PUBLIC",
      },
      {
        roomId: 102,
        name: "Localit Seminar B",
        location: "역삼",
        capacity: 24,
        available: false,
        imageUrl: "https://picsum.photos/seed/room3/480/300",
        visibility: "FOLLOWERS",
      },
    ],
  },
  followers: [
    { userId: 1, displayName: "Alice", avatarUrl: "https://i.pravatar.cc/80?img=1", isFollowingMe: true, iFollow: false },
    { userId: 2, displayName: "Bob", avatarUrl: "https://i.pravatar.cc/80?img=2", isFollowingMe: true, iFollow: true },
  ],
  following: [
    { userId: 3, displayName: "Charlie", avatarUrl: "https://i.pravatar.cc/80?img=3", isFollowingMe: false, iFollow: true },
    { userId: 4, displayName: "Dana", avatarUrl: "https://i.pravatar.cc/80?img=4", isFollowingMe: true, iFollow: true },
  ],
};

// -----------------------------
// Helpers
// -----------------------------
const EVENT_TYPE_LABEL: Record<EventType, string> = {
  GENERAL: "Event",
  MENTORING: "Mentoring",
  WORKSHOP: "Workshop",
  MEETUP: "Meetup",
};

function formatDateTimeRange(fromIso: string, toIso: string) {
  const tz = "Asia/Seoul";
  const from = new Date(fromIso);
  const to = new Date(toIso);

  const sameDay = from.toDateString() === to.toDateString();
  const d1 = new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeZone: tz }).format(from);
  const d2 = new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeZone: tz }).format(to);
  const t1 = new Intl.DateTimeFormat("ko-KR", { timeStyle: "short", timeZone: tz }).format(from);
  const t2 = new Intl.DateTimeFormat("ko-KR", { timeStyle: "short", timeZone: tz }).format(to);

  return sameDay ? `${d1} • ${t1} – ${t2}` : `${d1} ${t1} → ${d2} ${t2}`;
}

function canView(v: Visibility | undefined, isOwner: boolean, isFollower: boolean) {
  if (isOwner) return true;
  if (!v) return true;
  if (v === "PUBLIC") return true;
  if (v === "FOLLOWERS") return isFollower;
  return false;
}

function VisibilityBadge({ v }: { v?: Visibility }) {
  if (!v) return null;
  const label = v === "PUBLIC" ? "공개" : v === "FOLLOWERS" ? "팔로워 공개" : "비공개";
  return <span className="ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs opacity-80">{label}</span>;
}

// -----------------------------
// Generic UI
// -----------------------------
function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-lg font-semibold">{title}</h3>
      {right}
    </div>
  );
}

function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="w-full rounded-2xl border p-6 text-center">
      <div className="text-base font-medium">{title}</div>
      {hint && <div className="mt-1 text-sm opacity-75">{hint}</div>}
    </div>
  );
}

function Card({ children, onClick, ariaLabel }: { children: React.ReactNode; onClick?: () => void; ariaLabel?: string }) {
  return (
    <div
      role={onClick ? "button" : undefined}
      aria-label={ariaLabel}
      tabIndex={onClick ? 0 : -1}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) onClick();
      }}
      className="cursor-pointer overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black/30"
    >
      {children}
    </div>
  );
}

function Media({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="h-40 w-full bg-gray-100">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm opacity-60">No Image</div>
      )}
    </div>
  );
}

// -----------------------------
// Visibility Editor (공개/팔로워/비공개)
// -----------------------------
function VisibilitySelect({ value, onChange }: { value?: Visibility; onChange: (v: Visibility) => void }) {
  return (
    <select
      value={value ?? "PUBLIC"}
      onChange={(e) => onChange(e.target.value as Visibility)}
      className="rounded-md border bg-white px-2 py-1 text-xs shadow-sm hover:bg-gray-50"
      title="공개 범위"
    >
      <option value="PUBLIC">공개</option>
      <option value="FOLLOWERS">팔로워 공개</option>
      <option value="PRIVATE">비공개</option>
    </select>
  );
}

// -----------------------------
// Cards (with inline visibility editor)
// -----------------------------
function EventCard({
  e,
  editable,
  onVisibilityChange,
  onOpen,
}: {
  e: EventItem;
  editable?: boolean; // isOwner일 때만 true
  onVisibilityChange?: (v: Visibility) => void;
  onOpen?: () => void;
}) {
  return (
    <Card onClick={onOpen} ariaLabel={e.title}>
      <div className="relative">
        <Media src={e.imageUrl} alt={e.title} />
        {editable && (
          <div className="absolute right-2 top-2">
            <VisibilitySelect value={e.visibility} onChange={(v) => onVisibilityChange?.(v)} />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-center">
          <span className="text-sm uppercase tracking-wide opacity-70">{e.type ? EVENT_TYPE_LABEL[e.type] : "Event"}</span>
          <VisibilityBadge v={e.visibility} />
        </div>
        <div className="text-base font-semibold">{e.title}</div>
        <div className="mt-1 text-sm opacity-80">{formatDateTimeRange(e.startTime, e.endTime)}</div>
        {e.location && <div className="mt-0.5 text-sm opacity-80">📍 {e.location}</div>}
      </div>
    </Card>
  );
}

function RoomCard({
  r,
  editable,
  onVisibilityChange,
  onOpen,
}: {
  r: RoomItem;
  editable?: boolean;
  onVisibilityChange?: (v: Visibility) => void;
  onOpen?: () => void;
}) {
  return (
    <Card onClick={onOpen} ariaLabel={r.name}>
      <div className="relative">
        <Media src={r.imageUrl} alt={r.name} />
        {editable && (
          <div className="absolute right-2 top-2">
            <VisibilitySelect value={r.visibility} onChange={(v) => onVisibilityChange?.(v)} />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-center">
          <span className="text-sm uppercase tracking-wide opacity-70">ROOM</span>
          <VisibilityBadge v={r.visibility} />
        </div>
        <div className="text-base font-semibold">{r.name}</div>
        {r.location && <div className="mt-1 text-sm opacity-80">📍 {r.location}</div>}
        <div className="mt-1 text-sm opacity-80">
          정원 {r.capacity ?? "-"} • {r.available ? "예약 가능" : "예약 불가"}
        </div>
      </div>
    </Card>
  );
}

function ReservationCard({ item, onOpen }: { item: ReservationItem; onOpen?: () => void }) {
  return (
    <Card onClick={onOpen} ariaLabel={`예약: ${item.room.name}`}>
      <Media src={item.room.imageUrl} alt={item.room.name} />
      <div className="p-4">
        <div className="mb-1 flex items-center">
          <span className="text-sm uppercase tracking-wide opacity-70">RESERVATION</span>
          <VisibilityBadge v={item.room.visibility} />
        </div>
        <div className="text-base font-semibold">{item.room.name}</div>
        <div className="mt-1 text-sm opacity-80">{formatDateTimeRange(item.startTime, item.endTime)}</div>
        {item.room.location && <div className="mt-0.5 text-sm opacity-80">📍 {item.room.location}</div>}
      </div>
    </Card>
  );
}

// -----------------------------
// Tabs
// -----------------------------
function Tabs<T extends string>({ value, onChange, tabs }: { value: T; onChange: (v: T) => void; tabs: { value: T; label: string }[] }) {
  return (
    <div role="tablist" aria-orientation="horizontal" className="flex gap-2 rounded-2xl border p-1">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={String(t.value)}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={"rounded-xl px-4 py-2 text-sm font-medium transition " + (active ? "bg-black text-white" : "hover:bg-gray-100")}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// -----------------------------
// Followers / Following List Screens
// -----------------------------
function UserRow({ u, onToggleFollow }: { u: UserBrief; onToggleFollow: (userId: number) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {u.avatarUrl ? <img src={u.avatarUrl} alt={u.displayName} className="h-full w-full object-cover" /> : null}
        </div>
        <div>
          <div className="text-sm font-medium">{u.displayName}</div>
          <div className="text-xs opacity-70">{u.isFollowingMe ? "나를 팔로우함" : "아직 나를 팔로우하지 않음"}</div>
        </div>
      </div>
      <button
        onClick={() => onToggleFollow(u.userId)}
        className={"rounded-full px-3 py-1 text-sm border " + (u.iFollow ? "bg-black text-white" : "hover:bg-gray-50")}
      >
        {u.iFollow ? "언팔로우" : "팔로우"}
      </button>
    </div>
  );
}

function FollowersScreen({ list, onBack, onToggleFollow }: { list: UserBrief[]; onBack: () => void; onToggleFollow: (userId: number) => void }) {
  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">팔로워</h2>
        <button onClick={onBack} className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50">
          ← 돌아가기
        </button>
      </div>
      <div className="space-y-3">
        {list.length === 0 ? (
          <EmptyState title="아직 팔로워가 없습니다." />
        ) : (
          list.map((u) => <UserRow key={u.userId} u={u} onToggleFollow={onToggleFollow} />)
        )}
      </div>
    </div>
  );
}

function FollowingScreen({ list, onBack, onToggleFollow }: { list: UserBrief[]; onBack: () => void; onToggleFollow: (userId: number) => void }) {
  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">팔로잉</h2>
        <button onClick={onBack} className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50">
          ← 돌아가기
        </button>
      </div>
      <div className="space-y-3">
        {list.length === 0 ? (
          <EmptyState title="아직 팔로잉한 사람이 없습니다." />
        ) : (
          list.map((u) => <UserRow key={u.userId} u={u} onToggleFollow={onToggleFollow} />)
        )}
      </div>
    </div>
  );
}

// -----------------------------
// Root Page
// -----------------------------
type MajorTab = "EVENTS" | "ROOMS";
type EventTab = "HOSTED" | "PARTICIPATING";
type RoomTab = "MYROOMS" | "RESERVATIONS";
type ViewMode = "MAIN" | "FOLLOWERS" | "FOLLOWING";

export default function MyPage() {
  // 데이터 상태 (샘플로 시작)
  const [data, setData] = React.useState<MyPageResponse | null>(mock);
  const [majorTab, setMajorTab] = React.useState<MajorTab>("EVENTS");
  const [eventTab, setEventTab] = React.useState<EventTab>("HOSTED");
  const [roomTab, setRoomTab] = React.useState<RoomTab>("MYROOMS");
  const [view, setView] = React.useState<ViewMode>("MAIN");

  if (!data) return <div className="p-6">Loading...</div>;

  const { sections, isOwner, isFollower, profileName } = data;

  // 가시성 필터링
  const hostedEventsVisible = React.useMemo(
    () => sections.hostedEvents.filter((e) => canView(e.visibility, isOwner, isFollower)),
    [sections.hostedEvents, isOwner, isFollower]
  );
  const participatingEventsVisible = React.useMemo(
    () => sections.participatingEvents.filter((e) => canView(e.visibility, isOwner, isFollower)),
    [sections.participatingEvents, isOwner, isFollower]
  );
  const myRoomsVisible = React.useMemo(
    () => sections.myRooms.filter((r) => canView(r.visibility, isOwner, isFollower)),
    [sections.myRooms, isOwner, isFollower]
  );
  const reservationsVisible = React.useMemo(
    () => sections.roomReservations.filter((x) => canView(x.room.visibility, isOwner, isFollower)),
    [sections.roomReservations, isOwner, isFollower]
  );

  // 공개 범위 변경 핸들러 (샘플 상태 갱신; 실제로는 API 호출)
  const updateEventVisibility = (eventId: number, v: Visibility) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      next.sections = { ...next.sections };
      next.sections.hostedEvents = next.sections.hostedEvents.map((e) => (e.eventId === eventId ? { ...e, visibility: v } : e));
      // TODO: await api.patch(`/events/${eventId}`, { visibility: v })
      return next;
    });
  };

  const updateRoomVisibility = (roomId: number, v: Visibility) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      next.sections = { ...next.sections };
      next.sections.myRooms = next.sections.myRooms.map((r) => (r.roomId === roomId ? { ...r, visibility: v } : r));
      // TODO: await api.patch(`/rooms/${roomId}`, { visibility: v })
      return next;
    });
  };

  // 팔로우/언팔로우 (프로필 상단 버튼)
  const toggleFollowProfile = () => {
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      // 언팔 → 팔로우 시, 내 팔로잉 목록에 상대를 추가하는 효과(샘플)
      if (next.isFollower) {
        next.isFollower = false;
        // followers에서 "나"를 제거하는 시뮬은 생략(실제는 서버에서 처리)
      } else {
        next.isFollower = true;
      }
      // TODO: await api.post(`/users/${next.profileUserId}/${next.isFollower ? 'follow' : 'unfollow'}`)
      return next;
    });
  };

  // 상세 리스트에서 각 사용자 팔로우 토글
  const toggleFollowUserInList = (userId: number) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      next.followers = next.followers.map((u) => (u.userId === userId ? { ...u, iFollow: !u.iFollow } : u));
      next.following = next.following.map((u) => (u.userId === userId ? { ...u, iFollow: !u.iFollow } : u));
      // TODO: await api.post(`/users/${userId}/${newState ? 'follow' : 'unfollow'}`)
      return next;
    });
  };

  // 헤더 카운트
  const followersCount = data.followers.length;
  const followingCount = data.following.length;

  // 팔로워/팔로잉 상세 화면
  if (view === "FOLLOWERS") {
    return <FollowersScreen list={data.followers} onBack={() => setView("MAIN")} onToggleFollow={toggleFollowUserInList} />;
  }
  if (view === "FOLLOWING") {
    return <FollowingScreen list={data.following} onBack={() => setView("MAIN")} onToggleFollow={toggleFollowUserInList} />;
  }

  // 메인 화면
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 overflow-hidden rounded-full bg-gray-200" />
          <div>
            <div className="text-xl font-semibold">{profileName}</div>
            <div className="text-sm opacity-70">{isOwner ? "내 페이지" : data.isFollower ? "팔로잉 중" : "팔로우하여 더 보기"}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 팔로워/팔로잉 카운트 + 클릭 시 상세 화면 */}
          <button className="rounded-2xl border px-3 py-1 text-sm hover:bg-gray-50" onClick={() => setView("FOLLOWERS")} title="팔로워 목록 보기">
            팔로워 <span className="font-semibold">{followersCount}</span>
          </button>
          <button className="rounded-2xl border px-3 py-1 text-sm hover:bg-gray-50" onClick={() => setView("FOLLOWING")} title="팔로잉 목록 보기">
            팔로잉 <span className="font-semibold">{followingCount}</span>
          </button>

          {/* 프로필 팔로우/언팔로우 */}
          {!isOwner && (
            <button
              onClick={toggleFollowProfile}
              className={"rounded-2xl border px-4 py-2 shadow-sm " + (data.isFollower ? "bg-black text-white" : "hover:bg-gray-50")}
            >
              {data.isFollower ? "언팔로우" : "팔로우"}
            </button>
          )}
        </div>
      </div>

      {/* Major Tabs: Events / Rooms */}
      <div className="mb-5">
        <Tabs
          value={majorTab}
          onChange={setMajorTab}
          tabs={[
            { value: "EVENTS", label: "Events" },
            { value: "ROOMS", label: "Rooms" },
          ]}
        />
      </div>

      {majorTab === "EVENTS" ? (
        <div className="space-y-6">
          {/* Sub Tabs: Hosted / Participating */}
          <div className="flex items-center justify-between">
            <SectionHeader title="Events" />
            <Tabs
              value={eventTab}
              onChange={setEventTab}
              tabs={[
                { value: "HOSTED", label: "Hosted" },
                { value: "PARTICIPATING", label: "Participating" },
              ]}
            />
          </div>

          {eventTab === "HOSTED" ? (
            hostedEventsVisible.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {hostedEventsVisible.map((e) => (
                  <EventCard
                    key={e.eventId}
                    e={e}
                    editable={isOwner}
                    onVisibilityChange={(v) => updateEventVisibility(e.eventId, v)}
                    onOpen={() => {
                      /* navigate(`/events/${e.eventId}`) */
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="호스팅한 이벤트가 없습니다." hint="새 이벤트를 생성해 보세요." />
            )
          ) : participatingEventsVisible.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {participatingEventsVisible.map((e) => (
                <EventCard
                  key={e.eventId}
                  e={e}
                  editable={false}
                  onOpen={() => {
                    /* navigate(`/events/${e.eventId}`) */
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="참여 예정 이벤트가 없습니다." hint="관심 이벤트에 등록해 보세요." />
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sub Tabs: My Rooms / Reservations */}
          <div className="flex items-center justify-between">
            <SectionHeader title="Rooms" />
            <Tabs
              value={roomTab}
              onChange={setRoomTab}
              tabs={[
                { value: "MYROOMS", label: "My Rooms" },
                { value: "RESERVATIONS", label: "Reservations" },
              ]}
            />
          </div>

          {roomTab === "MYROOMS" ? (
            myRoomsVisible.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myRoomsVisible.map((r) => (
                  <RoomCard
                    key={r.roomId}
                    r={r}
                    editable={isOwner}
                    onVisibilityChange={(v) => updateRoomVisibility(r.roomId, v)}
                    onOpen={() => {
                      /* navigate(`/rooms/${r.roomId}`) */
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="등록한 공간이 없습니다." hint="새 공간을 등록해 보세요." />
            )
          ) : reservationsVisible.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reservationsVisible.map((x) => (
                <ReservationCard
                  key={x.roomReservationId}
                  item={x}
                  onOpen={() => {
                    /* navigate(`/rooms/reserve/${x.roomReservationId}`) */
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="예약 내역이 없습니다." hint="공간을 예약해 보세요." />
          )}
        </div>
      )}
    </div>
  );
}
