// src/features/event/components/EventCardPretty.tsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { EventDTO, MyRegistrationDTO } from "../api";
import ImageCarousel from "@/components/ui/ImageCarousel";

type Props = {
  e: EventDTO;
  className?: string;
  toBuilder?: (e: EventDTO) => string;
  onRegister?: (e: EventDTO) => void | Promise<void>;
  showCapacityBadge?: boolean;
  hideMeta?: boolean;
  registerText?: string;
  canEdit?: boolean;
  distanceKm?: number | null;
};

// 한국형 날짜 출력
function formatKoreanDate(dt: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(dt);
}

function StarRating({ avg, count }: { avg?: number | null; count?: number | null }) {
  if (!avg || avg <= 0) return null;
  const display = Number.isFinite(avg) ? avg.toFixed(1) : "0.0";
  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-500">
      <span aria-hidden>★</span>
      <span>{display}</span>
      {count ? <span className="text-neutral-500">({count})</span> : null}
    </span>
  );
}

/** 신청/참석 상태에 따른 UI 텍스트 계산 */
function getRegistrationUI(
  e: EventDTO,
  defaultButtonText: string
): {
  badgeLabel: string | null;
  badgeTone: string | null;
  buttonText: string;
  buttonDisabled: boolean;
} {
  const r: MyRegistrationDTO | undefined = e.myRegistration ?? undefined;

  if (!r || !r.applicationStatus) {
    return {
      badgeLabel: null,
      badgeTone: null,
      buttonText: defaultButtonText || "참가하기",
      buttonDisabled: false,
    };
  }

  const app = r.applicationStatus;
  const reg = r.registrationStatus ?? null;

  let badgeLabel: string | null = null;
  let badgeTone: string | null = null;
  let buttonText = defaultButtonText || "참가하기";
  let buttonDisabled = false;

  switch (app) {
    case "SUBMITTED":
      badgeLabel = "승인 대기중";
      badgeTone = "amber";
      buttonText = "승인 대기중";
      buttonDisabled = true;
      break;
    case "WAITLIST":
      badgeLabel = "대기열";
      badgeTone = "amber";
      buttonText = "대기 중";
      buttonDisabled = true;
      break;
    case "REJECTED":
      badgeLabel = "신청 거절됨";
      badgeTone = "rose";
      buttonText = "신청 거절됨";
      buttonDisabled = true;
      break;

    case "APPROVED":
      switch (reg) {
        case "CONFIRMED":
          badgeLabel = "참석 예정";
          badgeTone = "green";
          buttonText = "자세히 보기";
          buttonDisabled = false;
          break;
        case "ATTENDED":
          badgeLabel = "참석 완료";
          badgeTone = "blue";
          buttonText = "후기 남기기";
          buttonDisabled = false;
          break;
        case "CANCELLED":
          badgeLabel = "취소됨";
          badgeTone = "slate";
          buttonText = "다시 신청";
          buttonDisabled = false;
          break;
        case "NO_SHOW":
          badgeLabel = "불참(노쇼)";
          badgeTone = "slate";
          buttonText = "상세 보기";
          buttonDisabled = false;
          break;
        default:
          badgeLabel = "승인 완료";
          badgeTone = "green";
          buttonText = "참여 확정하기";
          buttonDisabled = false;
          break;
      }
      break;
  }

  return { badgeLabel, badgeTone, buttonText, buttonDisabled };
}

export default function EventCardPretty({
  e,
  className = "",
  toBuilder = (ev) => `/events/${ev.id}`,
  onRegister,
  showCapacityBadge = true,
  hideMeta = false,
  registerText = "참가하기",
  canEdit = false,
  distanceKm = null,
}: Props) {
  const navigate = useNavigate();
  const date = useMemo(() => new Date(e.startTime), [e.startTime]);

  // fallback 이미지
  const fallback =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='420'>
        <defs><linearGradient id='g' x1='0' x2='1'>
          <stop stop-color='#1e293b'/><stop offset='1' stop-color='#0f172a'/>
        </linearGradient></defs>
        <rect fill='url(#g)' width='100%' height='100%'/>
        <text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle'
          fill='#e2e8f0' font-family='Inter,system-ui' font-size='26'>Localit Event</text>
      </svg>`
    );

  const images: string[] = useMemo(() => {
    const urls = e.imageUrls;
    const cover = (e as any).coverUrl as string | undefined;
    const list = urls && urls.length > 0 ? urls : cover ? [cover] : [fallback];
    return Array.from(new Set(list.filter(Boolean)));
  }, [e.imageUrls]);

  const isSeries = e.seriesId != null;
  const headerBadge = isSeries ? `시리즈 ${e.episodeNo ?? "-"}회차` : "단발형";

  const { badgeLabel, badgeTone, buttonText, buttonDisabled } = useMemo(() => getRegistrationUI(e, registerText), [e, registerText]);

  const handleRegisterClick = async () => {
    if (buttonDisabled) return;
    if (onRegister) await onRegister(e);
    navigate(toBuilder(e));
  };

  const handleEditClick = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    navigate(`/events/${e.id}/edit`);
  };

  const statusBadge = badgeLabel ? (
    <Badge tone={badgeTone as any} className="text-xs px-2 py-0.5">
      {badgeLabel}
    </Badge>
  ) : (
    <span className="text-xs text-neutral-400">신청 가능</span>
  );

  return (
    <Card
      className={`group relative flex h-full flex-col overflow-hidden rounded-xl sm:rounded-2xl shadow-sm bg-neutral-900 border border-neutral-800 transition hover:border-neutral-700 hover:shadow-md [&_.MuiCardContent-root]:!p-0 [&_.MuiCardContent-root:last-child]:!pb-0 ${className}`}
    >
      {/* 이미지 영역 */}
      <div className="relative">
        {images.length > 1 ? (
          <ImageCarousel
            images={images}
            autoplayMs={0}
            fit="cover"
            alt={e.title}
            options={{ loop: true }}
            className="[&_img]:!h-32 sm:[&_img]:!h-40"
          />
        ) : (
          <img src={images[0]} alt={e.title} className="h-32 sm:h-40 w-full object-cover" loading="lazy" />
        )}

        {/* 상단 배지 (시리즈 / 타이틀 등) */}
        <div className="absolute left-2 top-2 flex items-center gap-2">
          <Badge tone={isSeries ? "violet" : "rose"}>{headerBadge}</Badge>
          {e.seriesTitle && isSeries ? (
            <Badge tone="indigo" className="max-w-[140px] truncate">
              {e.seriesTitle}
            </Badge>
          ) : null}
        </div>

        {/* 하단 좌측: 정원/신청 현황 */}
        {showCapacityBadge && (
          <div className="absolute left-2 bottom-2 flex flex-wrap gap-2">
            <Badge tone="blue">정원 {e.capacity}명</Badge>
            {typeof e.registrationsCount === "number" ? <Badge tone="green">신청 {e.registrationsCount}명</Badge> : null}
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className="flex flex-1 flex-col p-3 sm:p-4 text-neutral-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] sm:text-lg font-semibold tracking-tight">{e.title}</h3>

            {!hideMeta && (
              <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-neutral-400">
                <span>{formatKoreanDate(date)}</span>
                <span className="inline-flex items-center gap-1">📍{e.location}</span>
                {typeof distanceKm === "number" ? <span className="text-emerald-300">{distanceKm.toFixed(1)}km</span> : null}
                <StarRating avg={e.ratingAvg} count={e.ratingCount} />
              </div>
            )}
          </div>
        </div>

        <p className="mt-2.5 sm:mt-3 line-clamp-2 text-xs sm:text-sm text-neutral-300">{e.description}</p>

        {/* 하단 상태/버튼 */}
        <div className="mt-3 sm:mt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">{statusBadge}</div>

          {/* 편집 + 액션 버튼 */}
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button size="sm" onClick={handleEditClick} className="hidden sm:inline-flex text-[12px]">
                편집
              </Button>
            )}
            <Button size="sm" onClick={handleRegisterClick} disabled={buttonDisabled} className="!h-9 sm:!h-11 px-2.5 sm:px-3 text-xs sm:text-sm">
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
