// src/features/my/pages/MyPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MyPageDto, Visibility } from "../types";
import { sampleMyPages } from "../sampleMyPage";
import { useChat } from "@/app/providers/ChatProvider";

// 이미 있는 컴포넌트
import { EventMyCard } from "../components/EventMyCard";
import { RoomMyCard } from "../components/RoomMyCard";
import { ReservationMyCard } from "../components/ReservationMyCard";
import { useAuth } from "@/app/providers/AuthProvider";
import { Tabs } from "@/components/ui";

function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white/80 p-6 text-center text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-100">
      <div className="text-base font-medium">{title}</div>
      {hint && <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{hint}</div>}
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

type EventTab = "HOSTED" | "PARTICIPATING";
type RoomTab = "MYROOMS" | "RESERVATIONS";

export default function MyPage() {
  const { user } = useAuth(); // { id: number, ... } 라고 가정
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { openEventChat } = useChat();
  // 1순위: URL 파라미터
  // 2순위: 로그인 사용자
  // 3순위: 샘플 999
  const targetUserId = userId ? Number(userId) : (user?.id ?? 999);
  const initialData = sampleMyPages[targetUserId] ?? sampleMyPages[999];

  const [data, setData] = useState<MyPageDto>(initialData);
  const [eventTab, setEventTab] = useState<EventTab>("HOSTED");
  const [roomTab, setRoomTab] = useState<RoomTab>("MYROOMS");
  const [searchId, setSearchId] = useState("");

  // URL 바뀔 때마다 해당 사용자로 갈아끼우기
  useEffect(() => {
    const next = sampleMyPages[targetUserId] ?? sampleMyPages[999];
    setData(next);
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

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 text-gray-900 dark:text-gray-100 sm:px-6">
      {/* 프로필 헤더 */}
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white/90 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
        <div className="h-24 bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 dark:from-amber-500/25 dark:via-orange-500/20 dark:to-rose-500/25 sm:h-32" />
        <div className="grid gap-5 px-5 pb-6 sm:grid-cols-[auto,1fr,auto] sm:px-6">
          <div className="-mt-10 h-20 w-20 overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 shadow-sm dark:border-white/10 dark:bg-white/10 sm:-mt-12 sm:h-24 sm:w-24" />
          <div className="space-y-2">
            <div>
              <div className="text-2xl font-semibold">{data.profileName}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {data.profileTitle ?? (isOwner ? "프로필 타이틀을 추가해 보세요" : "호스트")}
              </div>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {data.profileBio ?? (isOwner ? "짧은 소개를 작성해 보세요." : "소개가 없습니다.")}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {data.profileLocation && (
                <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                  {data.profileLocation}
                </span>
              )}
              {(data.profileTags ?? []).map((tag) => (
                <span key={tag} className="rounded-full bg-gray-100 px-2 py-1 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {isOwner ? (
              <button className="rounded-2xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10">
                프로필 편집
              </button>
            ) : (
              <button
                onClick={toggleFollowProfile}
                className={
                  "rounded-2xl border px-4 py-2 text-sm shadow-sm dark:border-white/10 " +
                  (data.isFollower ? "bg-black text-white dark:bg-white dark:text-black" : "hover:bg-gray-50 dark:hover:bg-white/10")
                }
              >
                {data.isFollower ? "언팔로우" : "팔로우"}
              </button>
            )}
            <button className="rounded-2xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10">
              공유
            </button>
          </div>
        </div>
        <div className="grid gap-4 px-5 pb-6 sm:grid-cols-[2fr,1fr] sm:px-6">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">
            <div className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">소개</div>
            <div>{data.profileIntro ?? (isOwner ? "프로필 소개를 추가해 보세요." : "소개가 없습니다.")}</div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-gray-200 px-4 py-3 dark:border-white/10">
              <div className="text-xs text-gray-500 dark:text-gray-400">내가 만든 이벤트</div>
              <div className="text-2xl font-semibold">{hostedEvents.length}</div>
            </div>
            <div className="rounded-2xl border border-gray-200 px-4 py-3 dark:border-white/10">
              <div className="text-xs text-gray-500 dark:text-gray-400">참석 중인 이벤트</div>
              <div className="text-2xl font-semibold">{participatingEvents.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 아이디로 이동하는 검색폼 (샘플용) */}
      <form onSubmit={onSearchSubmit} className="mt-4 hidden items-center gap-2 sm:flex">
        <input
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="userId로 열기 (예: 1)"
          className="w-40 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 dark:border-white/10 dark:bg-neutral-900 dark:text-gray-100 dark:placeholder:text-gray-500"
        />
        <button type="submit" className="rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10">
          열기
        </button>
      </form>

      {/* EVENTS */}
      <div className="mt-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">이벤트</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">내가 만든 이벤트와 참석 중인 이벤트</div>
          </div>
          <Tabs
            value={eventTab}
            onChange={setEventTab}
            tabs={[
              { value: "HOSTED", label: "내가 만든 이벤트" },
              { value: "PARTICIPATING", label: "참석 중인 이벤트" },
            ]}
          />
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-neutral-900/70 sm:p-6">
          {eventTab === "HOSTED" ? (
            hostedEvents.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {hostedEvents.map((e) => (
                  <EventMyCard
                    key={e.eventId}
                    event={e}
                    editable={isOwner}
                    onVisibilityChange={(v) => updateEventVisibility(e.eventId, v)}
                    onOpenManage={() => navigate(`/events/${e.eventId}/manage`)}
                    onOpenChat={() => {
                      // 열린 채팅 목록에 등록
                      openEventChat({ eventId: e.eventId, title: e.title });
                      // 채팅 상세 페이지로 이동
                      navigate(`/chat/events/${e.eventId}`);
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="호스팅한 이벤트가 없습니다." hint="새 이벤트를 생성해 보세요." />
            )
          ) : participatingEvents.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {participatingEvents.map((e) => (
                <EventMyCard
                  key={e.eventId}
                  event={e}
                  onOpenChat={() => {
                    // 열린 채팅 목록에 등록
                    openEventChat({ eventId: e.eventId, title: e.title });
                    // 채팅 상세 페이지로 이동
                    navigate(`/chat/events/${e.eventId}`);
                  }}
                  onOpenTicket={() => navigate(`/ticket/events/${e.eventId}`)} // 내 참가권/입장 QR
                />
              ))}
            </div>
          ) : (
            <EmptyState title="참여 예정 이벤트가 없습니다." hint="관심 이벤트에 등록해 보세요." />
          )}
        </div>
      </div>

      {/* ROOMS */}
      <div className="mt-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">공간</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">공간 등록 및 예약 정보</div>
          </div>
          <Tabs
            value={roomTab}
            onChange={setRoomTab}
            tabs={[
              { value: "MYROOMS", label: "내 공간" },
              { value: "RESERVATIONS", label: "예약 내역" },
            ]}
          />
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-neutral-900/70 sm:p-6">
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
      </div>
    </div>
  );
}
