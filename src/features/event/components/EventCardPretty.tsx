// src/features/event/components/EventCardPretty.tsx
import { useMemo } from "react";
import { Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { EventDTO } from "../types"; // ← 여기만 변경

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
  const date = useMemo(() => new Date(e.startTime), [e.startTime]);

  return (
    <Card className={`group relative overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/30 blur-2xl transition group-hover:scale-110" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[17px] sm:text-lg font-semibold tracking-tight truncate">{e.title}</h3>
          {!hideMeta && (
            <div className="mt-1 text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-400">
              {formatKoreanDate(date)} · <span className="inline-flex items-center gap-1">📍{e.location}</span>
            </div>
          )}
        </div>
        {showCapacityBadge && <Badge tone="blue">정원 {e.capacity}명</Badge>}
      </div>

      <p className="mt-3 text-[13px] sm:text-sm text-neutral-800 dark:text-neutral-200 line-clamp-2">{e.description}</p>

      <div className="mt-4 flex items-center justify-between">
        <Link to={toBuilder(e)} className="text-[13px] sm:text-sm font-medium text-blue-700 hover:underline dark:text-blue-300">
          자세히 보기 →
        </Link>
        <Button size="sm" onClick={() => onRegister?.(e)}>{registerText}</Button>
      </div>
    </Card>
  );
}