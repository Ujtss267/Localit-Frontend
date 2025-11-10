// src/features/my/components/ReservationMyCard.tsx
import React from "react";
import { ReservationItemDto } from "../types";
import { VisibilityBadge } from "./VisibilityBadge";

function formatRange(fromIso: string, toIso: string) {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  return `${from.toLocaleString("ko-KR")} ~ ${to.toLocaleString("ko-KR")}`;
}

interface ReservationMyCardProps {
  item: ReservationItemDto;
  onOpen?: () => void;
}

export function ReservationMyCard({ item, onOpen }: ReservationMyCardProps) {
  return (
    <div role={onOpen ? "button" : undefined} onClick={onOpen} className="overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md">
      <div className="h-40 w-full bg-gray-100">
        {item.room.imageUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={item.room.imageUrl} alt={item.room.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm opacity-60">No Image</div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-center">
          <span className="text-sm uppercase tracking-wide opacity-70">RESERVATION</span>
          <VisibilityBadge v={item.room.visibility} />
        </div>
        <div className="text-base font-semibold">{item.room.name}</div>
        <div className="mt-1 text-sm opacity-80">{formatRange(item.startTime, item.endTime)}</div>
        {item.room.location && <div className="mt-0.5 text-sm opacity-80">📍 {item.room.location}</div>}
      </div>
    </div>
  );
}
