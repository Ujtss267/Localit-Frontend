import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useChat } from "@/app/providers/ChatProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import { useEvents } from "@/features/event/queries";
import { getMyEventRegistrations } from "@/features/eventRegistration/api";
import { EventMyCard } from "../components/EventMyCard";
import { Tabs } from "@/components/ui";
import { mobileText } from "@/components/ui/mobileTypography";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import type { EventItemDto } from "../types";

function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="w-full rounded-2xl border border-neutral-700 bg-neutral-900/80 p-6 text-center text-neutral-100">
      <div className="text-base font-medium">{title}</div>
      {hint ? <div className="mt-1 text-sm text-neutral-400">{hint}</div> : null}
    </div>
  );
}

type EventTab = "HOSTED" | "PARTICIPATING";

type MyRegistrationItem = {
  id: number;
  registeredAt: string;
  event: {
    id: number;
    title: string;
    startTime: string;
    location?: string;
  };
};

export default function MyPage() {
  const { user, loading } = useAuth();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { openEventChat } = useChat();
  const [eventTab, setEventTab] = useState<EventTab>("HOSTED");

  const currentUserId = user?.id ?? user?.userId ?? null;
  const requestedUserId = userId ? Number(userId) : currentUserId;
  const isOwner = currentUserId != null && requestedUserId === currentUserId;

  const hostedEventsQuery = useEvents();
  const registrationsQuery = useQuery({
    queryKey: ["event-registration", "me"],
    queryFn: () => getMyEventRegistrations() as Promise<MyRegistrationItem[]>,
    enabled: isOwner,
    staleTime: 30_000,
  });

  const hostedEvents = useMemo<EventItemDto[]>(() => {
    if (!currentUserId) return [];
    return (hostedEventsQuery.data ?? [])
      .filter((event) => (event.creator?.id ?? event.creator?.userId ?? event.creatorId ?? null) === currentUserId)
      .map((event) => ({
        eventId: event.id,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        lat: event.lat ?? null,
        lng: event.lng ?? null,
        type: event.type,
        imageUrl: event.imageUrls?.[0],
        visibility: event.visibility,
      }));
  }, [hostedEventsQuery.data, currentUserId]);

  const participatingEvents = useMemo<EventItemDto[]>(() => {
    return (registrationsQuery.data ?? []).map((registration) => ({
      eventId: registration.event.id,
      title: registration.event.title,
      startTime: registration.event.startTime,
      endTime: registration.event.startTime,
      location: registration.event.location,
      visibility: "PUBLIC",
    }));
  }, [registrationsQuery.data]);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-3 sm:px-6 py-6 text-sm text-neutral-300">불러오는 중...</div>;
  }

  if (!user || currentUserId == null) {
    return <div className="mx-auto max-w-6xl px-3 sm:px-6 py-6 text-sm text-neutral-300">로그인이 필요합니다.</div>;
  }

  if (!isOwner) {
    return (
      <div className="mx-auto max-w-6xl px-3 sm:px-6 py-6">
        <EmptyState title="다른 사용자 마이페이지 API는 아직 연결되지 않았습니다." hint="현재는 로그인한 사용자 기준 데이터만 표시합니다." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 pb-8 sm:pb-10 pt-4 sm:pt-6 text-neutral-100">
      <div className="overflow-hidden rounded-3xl border border-neutral-700 bg-neutral-900/90 shadow-sm">
        <div className="h-24 bg-gradient-to-r from-emerald-500/20 via-sky-500/20 to-cyan-500/25 sm:h-32" />
        <div className="grid gap-4 sm:gap-5 px-4 sm:px-6 pb-5 sm:pb-6 sm:grid-cols-[1fr,auto]">
          <div className="space-y-2">
            <div>
              <div className="text-xl sm:text-2xl font-semibold">{user.name ?? user.nickname ?? user.email}</div>
              <div className={`${mobileText.meta} text-neutral-400`}>{user.email}</div>
            </div>
            <div className={`${mobileText.body} text-neutral-300`}>
              현재 로그인한 계정의 실제 이벤트 데이터만 표시합니다. 프로필 소개, 팔로우, 외부 사용자 조회는 백엔드 API 준비 후 연결할 수 있습니다.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/settings/account")}
              className="rounded-2xl border border-neutral-700 px-3 sm:px-4 py-2 text-xs sm:text-sm min-h-10 sm:min-h-11 hover:bg-neutral-800 inline-flex items-center gap-1.5"
            >
              <SettingsOutlinedIcon sx={{ fontSize: 16 }} />
              설정
            </button>
          </div>
        </div>
        <div className="grid gap-3 sm:gap-4 px-4 sm:px-6 pb-5 sm:pb-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-700 px-3 sm:px-4 py-2.5 sm:py-3">
            <div className={`${mobileText.meta} text-neutral-400`}>내가 만든 이벤트</div>
            <div className="text-xl sm:text-2xl font-semibold">{hostedEvents.length}</div>
          </div>
          <div className="rounded-2xl border border-neutral-700 px-3 sm:px-4 py-2.5 sm:py-3">
            <div className={`${mobileText.meta} text-neutral-400`}>참여 중인 이벤트</div>
            <div className="text-xl sm:text-2xl font-semibold">{participatingEvents.length}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="text-base font-semibold sm:text-lg">이벤트</div>
            <div className={`${mobileText.meta} text-neutral-400`}>실제 개발 DB 기준으로 개설/참여 이벤트를 표시합니다.</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/series")}
              className="min-h-11 rounded-xl border border-neutral-700 px-3 py-2 text-xs sm:text-sm hover:bg-neutral-800"
            >
              시리즈 관리
            </button>
            <Tabs
              value={eventTab}
              onChange={setEventTab}
              tabs={[
                { value: "HOSTED", label: "개설 이벤트" },
                { value: "PARTICIPATING", label: "참여 이벤트" },
              ]}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-700 bg-neutral-900 p-3 sm:p-6">
          {eventTab === "HOSTED" ? (
            hostedEventsQuery.isLoading ? (
              <EmptyState title="개설 이벤트를 불러오는 중입니다." />
            ) : hostedEvents.length ? (
              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {hostedEvents.map((event) => (
                  <EventMyCard
                    key={event.eventId}
                    event={event}
                    editable={false}
                    onOpen={() => navigate(`/events/${event.eventId}`)}
                    onOpenManage={() => navigate(`/events/${event.eventId}/manage`)}
                    onOpenChat={() => {
                      openEventChat({ eventId: event.eventId, title: event.title });
                      navigate(`/chat/events/${event.eventId}`);
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="호스팅한 이벤트가 없습니다." hint="새 이벤트를 생성해 보세요." />
            )
          ) : registrationsQuery.isLoading ? (
            <EmptyState title="참여 이벤트를 불러오는 중입니다." />
          ) : participatingEvents.length ? (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {participatingEvents.map((event) => (
                <EventMyCard
                  key={event.eventId}
                  event={event}
                  onOpen={() => navigate(`/events/${event.eventId}`)}
                  onOpenTicket={() => navigate(`/ticket/events/${event.eventId}`)}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="참여 중인 이벤트가 없습니다." hint="관심 있는 이벤트에 참가해 보세요." />
          )}
        </div>
      </div>
    </div>
  );
}
