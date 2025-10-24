import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { EventDTO } from "../api";
import ImageCarousel from "@/components/ui/ImageCarousel";

type Props = {
  e: EventDTO;
  className?: string;
  toBuilder?: (e: EventDTO) => string;
  onRegister?: (e: EventDTO) => void | Promise<void>;
  showCapacityBadge?: boolean;
  hideMeta?: boolean;
  registerText?: string;
};

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

export default function EventCardPretty({
  e,
  className = "",
  toBuilder = (ev) => `/events/${ev.id}`,
  onRegister,
  showCapacityBadge = true,
  hideMeta = false,
  registerText = "참가하기",
}: Props) {
  const navigate = useNavigate();
  const date = useMemo(() => new Date(e.startTime), [e.startTime]);

  // ✅ 이미지 처리 (없을 때 placeholder)
  const fallback =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='420'>
        <defs><linearGradient id='g' x1='0' x2='1'>
          <stop stop-color='#dbeafe'/><stop offset='1' stop-color='#f0f9ff'/>
        </linearGradient></defs>
        <rect fill='url(#g)' width='100%' height='100%'/>
        <text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle'
          fill='#334155' font-family='Inter,system-ui' font-size='26'>Localit Event</text>
      </svg>`
    );

  const images: string[] = (() => {
    const urls = (e as any).imageUrls as string[] | undefined;
    const cover = (e as any).coverUrl as string | undefined;
    const list = urls && urls.length > 0 ? urls : cover ? [cover] : [fallback];
    return Array.from(new Set(list.filter(Boolean)));
  })();

  // ✅ 참가하기 버튼 클릭 시 상세 페이지 이동
  const handleRegisterClick = async () => {
    if (onRegister) await onRegister(e);
    navigate(toBuilder(e));
  };

  return (
    <Card className={`group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition h-full flex flex-col ${className}`}>
      {/* 이미지 영역 */}
      <div className="relative">
        {images.length > 1 ? (
          <ImageCarousel images={images} autoplayMs={0} fit="cover" alt={e.title} options={{ loop: true }} />
        ) : (
          <img src={images[0]} alt={e.title} className="h-40 w-full object-cover" loading="lazy" />
        )}

        {showCapacityBadge && (
          <div className="absolute left-2 bottom-2">
            <Badge tone="blue">정원 {e.capacity}명</Badge>
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[17px] sm:text-lg font-semibold tracking-tight truncate">{e.title}</h3>
            {!hideMeta && (
              <div className="mt-1 text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-400">
                {formatKoreanDate(date)} · <span className="inline-flex items-center gap-1">📍{e.location}</span>
              </div>
            )}
          </div>
        </div>

        <p className="mt-3 text-[13px] sm:text-sm text-neutral-800 dark:text-neutral-200 line-clamp-2">{e.description}</p>

        {/* ✅ 푸터 (참가하기 버튼만 남김) */}
        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={handleRegisterClick}>
            {registerText}
          </Button>
        </div>
      </div>
    </Card>
  );
}
