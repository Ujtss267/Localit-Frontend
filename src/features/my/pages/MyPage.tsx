// src/features/my/pages/MyPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MyPageDto, Visibility } from "../types";
import { sampleData } from "@/mocks/sampleData";
import { useChat } from "@/app/providers/ChatProvider";

// 이미 있는 컴포넌트
import { EventMyCard } from "../components/EventMyCard";
import { useAuth } from "@/app/providers/AuthProvider";
import { Tabs } from "@/components/ui";
import { mobileText } from "@/components/ui/mobileTypography";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="w-full rounded-2xl border border-neutral-700 bg-neutral-900/80 p-6 text-center text-neutral-100">
      <div className="text-base font-medium">{title}</div>
      {hint && <div className="mt-1 text-sm text-neutral-400">{hint}</div>}
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

export default function MyPage() {
  const { user } = useAuth(); // { id: number, ... } 라고 가정
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { openEventChat } = useChat();
  // 1순위: URL 파라미터
  // 2순위: 로그인 사용자
  // 3순위: 샘플 999
  const targetUserId = userId ? Number(userId) : (user?.id ?? 999);
  const initialData = sampleData.myPages[targetUserId] ?? sampleData.myPages[999];

  const [data, setData] = useState<MyPageDto>(initialData);
  const [eventTab, setEventTab] = useState<EventTab>("HOSTED");
  const [searchId, setSearchId] = useState("");

  // URL 바뀔 때마다 해당 사용자로 갈아끼우기
  useEffect(() => {
    const next = sampleData.myPages[targetUserId] ?? sampleData.myPages[999];
    setData(next);
    setEventTab("HOSTED");
    setSearchId("");
  }, [targetUserId]);

  const { sections, isOwner, isFollower } = data;

  // 가시성 필터
  const hostedEvents = sections.hostedEvents.filter((e) => canView(e.visibility, isOwner, isFollower));
  const participatingEvents = sections.participatingEvents.filter((e) => canView(e.visibility, isOwner, isFollower));

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

  // 프로필 팔로우/언팔
  const toggleFollowProfile = () => {
    setData((prev) => ({ ...prev, isFollower: !prev.isFollower }));
  };

  // 상단에서 userId 입력 → 그 사용자 페이지로 이동
  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(searchId);
    if (!Number.isNaN(n) && sampleData.myPages[n]) {
      navigate(`/my/${n}`);
    } else {
      alert("해당 ID의 사용자 샘플이 없습니다.");
    }
  };

  const onOpenProfileSettings = () => {
    navigate("/settings/account");
  };

  const onChangeProfilePhoto = () => {
    navigate("/settings/account#profile-photo");
  };

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 pb-8 sm:pb-10 pt-4 sm:pt-6 text-neutral-100">
      {/* 아이디로 이동하는 검색폼 (샘플용) */}
      <form onSubmit={onSearchSubmit} className="mb-3 sm:mb-4 rounded-2xl border border-neutral-700 bg-neutral-900/90 p-2.5 sm:p-3">
        <div className="flex items-center justify-between gap-2">
          <div className={`${mobileText.meta} text-neutral-400`}>사용자 ID로 마이페이지 조회</div>
          <div className="text-[11px] sm:text-xs text-neutral-500">예: 1, 999</div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <input
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            inputMode="numeric"
            placeholder="userId 입력"
            className="h-10 sm:h-11 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500"
          />
          <button type="submit" className="h-10 sm:h-11 shrink-0 rounded-xl border border-neutral-700 px-3 sm:px-4 text-xs sm:text-sm hover:bg-neutral-800">
            열기
          </button>
        </div>
      </form>

      {/* 프로필 헤더 */}
      <div className="overflow-hidden rounded-3xl border border-neutral-700 bg-neutral-900/90 shadow-sm">
        <div className="h-24 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/25 sm:h-32" />
        <div className="grid gap-4 sm:gap-5 px-4 sm:px-6 pb-5 sm:pb-6 sm:grid-cols-[auto,1fr,auto]">
          <div className="-mt-10 h-20 w-20 sm:-mt-12 sm:h-24 sm:w-24 relative">
            <div className="h-full w-full overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-800 shadow-sm" />
            {isOwner && (
              <button
                type="button"
                onClick={onChangeProfilePhoto}
                className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-600 bg-neutral-900/95 text-neutral-100 hover:bg-neutral-800"
                aria-label="프로필 사진 변경"
                title="프로필 사진 변경"
              >
                <CameraAltOutlinedIcon sx={{ fontSize: 16 }} />
              </button>
            )}
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-xl sm:text-2xl font-semibold">{data.profileName}</div>
              <div className={`${mobileText.meta} text-neutral-400`}>
                {data.profileTitle ?? (isOwner ? "프로필 타이틀을 추가해 보세요" : "호스트")}
              </div>
            </div>
            <div className={`${mobileText.body} text-neutral-300`}>
              {data.profileBio ?? (isOwner ? "짧은 소개를 작성해 보세요." : "소개가 없습니다.")}
            </div>
            <div className={`flex flex-wrap items-center gap-2 ${mobileText.meta} text-neutral-400`}>
              {data.profileLocation && (
                <span className="rounded-full bg-neutral-800 px-2 py-1 text-neutral-300">{data.profileLocation}</span>
              )}
              {(data.profileTags ?? []).map((tag) => (
                <span key={tag} className="rounded-full bg-neutral-800 px-2 py-1 text-neutral-300">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {isOwner ? (
              <button className="rounded-2xl border border-neutral-700 px-3 sm:px-4 py-2 text-xs sm:text-sm min-h-10 sm:min-h-11 hover:bg-neutral-800">
                프로필 편집
              </button>
            ) : (
              <button
                onClick={toggleFollowProfile}
                className={
                  "rounded-2xl border border-neutral-700 px-3 sm:px-4 py-2 text-xs sm:text-sm min-h-10 sm:min-h-11 shadow-sm " +
                  (data.isFollower ? "bg-neutral-700 text-neutral-100" : "hover:bg-neutral-800")
                }
              >
                {data.isFollower ? "언팔로우" : "팔로우"}
              </button>
            )}
            <button className="rounded-2xl border border-neutral-700 px-3 sm:px-4 py-2 text-xs sm:text-sm min-h-10 sm:min-h-11 hover:bg-neutral-800">
              공유
            </button>
            {isOwner && (
              <button
                type="button"
                onClick={onOpenProfileSettings}
                className="rounded-2xl border border-neutral-700 px-3 sm:px-4 py-2 text-xs sm:text-sm min-h-10 sm:min-h-11 hover:bg-neutral-800 inline-flex items-center gap-1.5"
              >
                <SettingsOutlinedIcon sx={{ fontSize: 16 }} />
                설정
              </button>
            )}
          </div>
        </div>
        <div className="grid gap-3 sm:gap-4 px-4 sm:px-6 pb-5 sm:pb-6 sm:grid-cols-[2fr,1fr]">
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900 px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-neutral-200">
            <div className={`mb-2 ${mobileText.meta} font-semibold text-neutral-400`}>소개</div>
            <div>{data.profileIntro ?? (isOwner ? "프로필 소개를 추가해 보세요." : "소개가 없습니다.")}</div>
          </div>
          <div className="grid gap-2.5 sm:gap-3">
            <div className="rounded-2xl border border-neutral-700 px-3 sm:px-4 py-2.5 sm:py-3">
              <div className={`${mobileText.meta} text-neutral-400`}>내가 만든 이벤트</div>
              <div className="text-xl sm:text-2xl font-semibold">{hostedEvents.length}</div>
            </div>
            <div className="rounded-2xl border border-neutral-700 px-3 sm:px-4 py-2.5 sm:py-3">
              <div className={`${mobileText.meta} text-neutral-400`}>참석 중인 이벤트</div>
              <div className="text-xl sm:text-2xl font-semibold">{participatingEvents.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* EVENTS */}
      <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="text-base font-semibold sm:text-lg">이벤트</div>
            <div className={`${mobileText.meta} text-neutral-400`}>내가 만든 이벤트와 참석 중인 이벤트</div>
          </div>
          <Tabs
            value={eventTab}
            onChange={setEventTab}
            tabs={[
              { value: "HOSTED", label: "개설 이벤트" },
              { value: "PARTICIPATING", label: "참여 이벤트" },
            ]}
          />
        </div>

        <div className="rounded-3xl border border-neutral-700 bg-neutral-900 p-3 sm:p-6">
          {eventTab === "HOSTED" ? (
            hostedEvents.length ? (
              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

    </div>
  );
}
