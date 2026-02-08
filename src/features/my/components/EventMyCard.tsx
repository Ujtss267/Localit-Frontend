import React from "react";
import type { EventItemDto, Visibility } from "../types";
import { VisibilityBadge } from "./VisibilityBadge";
import { VisibilitySelect } from "./VisibilitySelect";

const EVENT_TYPE_LABEL: Record<NonNullable<EventItemDto["type"]>, string> = {
  GENERAL: "Event",
  MENTORING: "Mentoring",
  WORKSHOP: "Workshop",
  MEETUP: "Meetup",
};

function formatRange(fromIso: string, toIso: string) {
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

interface EventMyCardProps {
  event: EventItemDto;
  editable?: boolean;
  onVisibilityChange?: (v: Visibility) => void;
  onOpen?: () => void; // 카드 전체 클릭
  onOpenManage?: () => void; // 승인/참여자 관리 (Host)
  onOpenChat?: () => void; // 이벤트 채팅
  onOpenTicket?: () => void; // 티켓/입장 QR 보기 (참석자)
}

export function EventMyCard({ event, editable, onVisibilityChange, onOpen, onOpenManage, onOpenChat, onOpenTicket }: EventMyCardProps) {
  const clickable = Boolean(onOpen);

  const handleCardClick = () => {
    if (onOpen) onOpen();
  };

  const handleManageClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    onOpenManage?.();
  };

  const handleChatClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    onOpenChat?.();
  };

  const handleTicketClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    onOpenTicket?.();
  };

  return (
    <div
      role={clickable ? "button" : undefined}
      onClick={clickable ? handleCardClick : undefined}
      className={`overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 text-neutral-100 shadow-sm transition hover:border-neutral-700 hover:shadow-md ${clickable ? "cursor-pointer" : ""}`}
    >
      {/* 이미지 영역 */}
      <div className="relative h-40 w-full bg-neutral-800">
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-300/80">No image</div>
        )}

        {editable && (
          <div className="absolute right-2 top-2">
            <VisibilitySelect value={event.visibility} onChange={(v) => onVisibilityChange?.(v)} />
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className="p-4">
        <div className="mb-1 flex items-center">
          <span className="text-sm uppercase tracking-wide text-neutral-400">{event.type ? EVENT_TYPE_LABEL[event.type] : "Event"}</span>
          <VisibilityBadge v={event.visibility} />
        </div>
        <div className="text-base font-semibold text-neutral-100">{event.title}</div>
        <div className="mt-1 text-sm text-neutral-300">{formatRange(event.startTime, event.endTime)}</div>
        {event.location && <div className="mt-0.5 text-sm text-neutral-300">📍 {event.location}</div>}

        {/* 하단 액션 영역: 승인/참여자 + 티켓 + 채팅 */}
        {(onOpenManage || onOpenTicket || onOpenChat) && (
          <div className="mt-3 flex items-center justify-end gap-2">
            {onOpenManage && (
              <button type="button" onClick={handleManageClick} className="min-h-11 rounded-xl border border-neutral-700 px-3 py-2 text-xs font-medium hover:bg-neutral-800">
                승인/참여자
              </button>
            )}

            {onOpenTicket && (
              <button type="button" onClick={handleTicketClick} className="min-h-11 rounded-xl border border-neutral-700 px-3 py-2 text-xs font-medium hover:bg-neutral-800">
                입장 QR
              </button>
            )}

            {onOpenChat && (
              <button
                type="button"
                onClick={handleChatClick}
                className="min-h-11 rounded-xl bg-neutral-700 px-3 py-2 text-xs font-medium text-neutral-100 hover:bg-neutral-600"
              >
                채팅
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
