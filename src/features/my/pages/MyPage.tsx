// src/features/my/pages/MyPage.tsx
import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MyPageDto, Visibility } from "../types";
import { sampleMyPages } from "../sampleMyPage";

// 이미 있는 컴포넌트
import { EventMyCard } from "../components/EventMyCard";
import { RoomMyCard } from "../components/RoomMyCard";
import { ReservationMyCard } from "../components/ReservationMyCard";
import { FollowersScreen } from "../components/FollowersScreen";
import { FollowingScreen } from "../components/FollowingScreen";

// ───────────────────────────
// 작은 공용 UI
// ───────────────────────────
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

// 이 Tabs 는 네 원래 소스에 있던 구조랑 똑같이 둠
// 공용 Tabs
function Tabs<T extends string>({
  value,
  onChange,
  tabs,
}: {
  value: T;
  onChange: React.Dispatch<React.SetStateAction<T>>; // ← 여기!
  tabs: { value: T; label: string }[];
}) {
  return (
    <div className="flex gap-2 rounded-2xl border p-1">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)} // setState에 값 넣는 건 OK
            className={"rounded-xl px-4 py-2 text-sm font-medium transition " + (active ? "bg-black text-white" : "hover:bg-gray-100")}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// 공개 범위 체크
function canView(v: Visibility | undefined, isOwner: boolean, isFollower: boolean) {
  if (isOwner) return true;
  if (!v) return true;
  if (v === "PUBLIC") return true;
  if (v === "FOLLOWERS") return isFollower;
  return false;
}

type MajorTab = "EVENTS" | "ROOMS";
type EventTab = "HOSTED" | "PARTICIPATING";
type RoomTab = "MYROOMS" | "RESERVATIONS";
type ViewMode = "MAIN" | "FOLLOWERS" | "FOLLOWING";

export default function MyPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  // URL이 없으면 999번 샘플을 기본으로
  const targetUserId = userId ? Number(userId) : 999;
  const initialData = sampleMyPages[targetUserId] ?? sampleMyPages[999];

  const [data, setData] = React.useState<MyPageDto>(initialData);
  const [majorTab, setMajorTab] = React.useState<MajorTab>("EVENTS");
  const [eventTab, setEventTab] = React.useState<EventTab>("HOSTED");
  const [roomTab, setRoomTab] = React.useState<RoomTab>("MYROOMS");
  const [view, setView] = React.useState<ViewMode>("MAIN");
  const [searchId, setSearchId] = React.useState("");

  // URL 바뀔 때마다 해당 사용자로 갈아끼우기
  React.useEffect(() => {
    const next = sampleMyPages[targetUserId] ?? sampleMyPages[999];
    setData(next);
    setView("MAIN");
    setMajorTab("EVENTS");
    setEventTab("HOSTED");
    setRoomTab("MYROOMS");
    setSearchId("");
  }, [targetUserId]);

  const { sections, isOwner, isFollower } = data;

  // 가시성 필터
  const hostedEvents = sections.hostedEvents.filter((e) => canView(e.visibility, isOwner, isFollower));
  const participatingEvents = sections.participatingEvents.filter((e) => canView(e.visibility, isOwner, isFollower));
  const myRooms = sections.myRooms.filter((r) => canView(r.visibility, isOwner, isFollower));
  const reservations = sections.roomReservations.filter((x) => canView(x.room.visibility, isOwner, isFollower));

  // 이벤트 공개 범위 변경
  const updateEventVisibility = (eventId: number, v: Visibility) => {
    setData((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        hostedEvents: prev.sections.hostedEvents.map((e) => (e.eventId === eventId ? { ...e, visibility: v } : e)),
      },
    }));
  };

  // 룸 공개 범위 변경
  const updateRoomVisibility = (roomId: number, v: Visibility) => {
    setData((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        myRooms: prev.sections.myRooms.map((r) => (r.roomId === roomId ? { ...r, visibility: v } : r)),
      },
    }));
  };

  // 프로필 팔로우/언팔
  const toggleFollowProfile = () => {
    setData((prev) => ({ ...prev, isFollower: !prev.isFollower }));
  };

  // 리스트 화면에서 팔로우/언팔
  const toggleFollowUserInList = (userId: number) => {
    setData((prev) => ({
      ...prev,
      followers: prev.followers.map((u) => (u.userId === userId ? { ...u, iFollow: !u.iFollow } : u)),
      following: prev.following.map((u) => (u.userId === userId ? { ...u, iFollow: !u.iFollow } : u)),
    }));
  };

  // 상단에서 userId 입력 → 그 사용자 페이지로 이동
  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(searchId);
    if (!Number.isNaN(n) && sampleMyPages[n]) {
      navigate(`/my/${n}`);
    } else {
      alert("해당 ID의 사용자 샘플이 없습니다.");
    }
  };

  // 팔로워/팔로잉 뷰 (네 컴포넌트는 onOpenProfile 없음)
  if (view === "FOLLOWERS") {
    return <FollowersScreen list={data.followers} onBack={() => setView("MAIN")} onToggleFollow={toggleFollowUserInList} />;
  }
  if (view === "FOLLOWING") {
    return <FollowingScreen list={data.following} onBack={() => setView("MAIN")} onToggleFollow={toggleFollowUserInList} />;
  }

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      {/* 헤더 */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 overflow-hidden rounded-full bg-gray-200" />
          <div>
            <div className="text-xl font-semibold">{data.profileName}</div>
            <div className="text-sm opacity-70">{isOwner ? "내 페이지" : data.isFollower ? "팔로잉 중" : "팔로우하여 더 보기"}</div>
          </div>
        </div>

        {/* 아이디로 이동하는 검색폼 */}
        <form onSubmit={onSearchSubmit} className="flex items-center gap-2">
          <input
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="userId로 열기 (예: 1)"
            className="w-32 rounded-xl border px-3 py-1 text-sm"
          />
          <button type="submit" className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50">
            열기
          </button>
        </form>

        <div className="flex items-center gap-3">
          <button className="rounded-2xl border px-3 py-1 text-sm hover:bg-gray-50" onClick={() => setView("FOLLOWERS")}>
            팔로워 <span className="font-semibold">{data.followers.length}</span>
          </button>
          <button className="rounded-2xl border px-3 py-1 text-sm hover:bg-gray-50" onClick={() => setView("FOLLOWING")}>
            팔로잉 <span className="font-semibold">{data.following.length}</span>
          </button>
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

      {/* 대분류 탭 */}
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

      {/* EVENTS */}
      {majorTab === "EVENTS" ? (
        <div className="space-y-6">
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
            hostedEvents.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {hostedEvents.map((e) => (
                  <EventMyCard key={e.eventId} event={e} editable={isOwner} onVisibilityChange={(v) => updateEventVisibility(e.eventId, v)} />
                ))}
              </div>
            ) : (
              <EmptyState title="호스팅한 이벤트가 없습니다." hint="새 이벤트를 생성해 보세요." />
            )
          ) : participatingEvents.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {participatingEvents.map((e) => (
                <EventMyCard key={e.eventId} event={e} />
              ))}
            </div>
          ) : (
            <EmptyState title="참여 예정 이벤트가 없습니다." hint="관심 이벤트에 등록해 보세요." />
          )}
        </div>
      ) : (
        // ROOMS
        <div className="space-y-6">
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
            myRooms.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myRooms.map((r) => (
                  <RoomMyCard key={r.roomId} room={r} editable={isOwner} onVisibilityChange={(v) => updateRoomVisibility(r.roomId, v)} />
                ))}
              </div>
            ) : (
              <EmptyState title="등록한 공간이 없습니다." hint="새 공간을 등록해 보세요." />
            )
          ) : reservations.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reservations.map((x) => (
                <ReservationMyCard key={x.roomReservationId} item={x} />
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
