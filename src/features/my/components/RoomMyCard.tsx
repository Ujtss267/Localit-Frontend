// src/features/my/components/RoomMyCard.tsx
import React from "react";
import { RoomItemDto, Visibility } from "../types";
import { VisibilityBadge } from "./VisibilityBadge";
import { VisibilitySelect } from "./VisibilitySelect";

interface RoomMyCardProps {
  room: RoomItemDto;
  editable?: boolean;
  onVisibilityChange?: (v: Visibility) => void;
  onOpen?: () => void;
}

export function RoomMyCard({ room, editable, onVisibilityChange, onOpen }: RoomMyCardProps) {
  return (
    <div role={onOpen ? "button" : undefined} onClick={onOpen} className="overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md">
      <div className="relative h-40 w-full bg-gray-100">
        {room.imageUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={room.imageUrl} alt={room.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm opacity-60">No Image</div>
        )}
        {editable && (
          <div className="absolute right-2 top-2">
            <VisibilitySelect value={room.visibility} onChange={(v) => onVisibilityChange?.(v)} />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-center">
          <span className="text-sm uppercase tracking-wide opacity-70">ROOM</span>
          <VisibilityBadge v={room.visibility} />
        </div>
        <div className="text-base font-semibold">{room.name}</div>
        {room.location && <div className="mt-1 text-sm opacity-80">📍 {room.location}</div>}
        <div className="mt-1 text-sm opacity-80">
          정원 {room.capacity ?? "-"} • {room.available ? "예약 가능" : "예약 불가"}
        </div>
      </div>
    </div>
  );
}
