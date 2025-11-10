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
  onOpen?: () => void;
}

export function EventMyCard({ event, editable, onVisibilityChange, onOpen }: EventMyCardProps) {
  return (
    <div
      role={onOpen ? "button" : undefined}
      onClick={onOpen}
      className="cursor-pointer overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-40 w-full bg-gray-100">
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm opacity-60">No image</div>
        )}
        {editable && (
          <div className="absolute right-2 top-2">
            <VisibilitySelect value={event.visibility} onChange={(v) => onVisibilityChange?.(v)} />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-center">
          <span className="text-sm uppercase tracking-wide opacity-70">{event.type ? EVENT_TYPE_LABEL[event.type] : "Event"}</span>
          <VisibilityBadge v={event.visibility} />
        </div>
        <div className="text-base font-semibold">{event.title}</div>
        <div className="mt-1 text-sm opacity-80">{formatRange(event.startTime, event.endTime)}</div>
        {event.location && <div className="mt-0.5 text-sm opacity-80">📍 {event.location}</div>}
      </div>
    </div>
  );
}
