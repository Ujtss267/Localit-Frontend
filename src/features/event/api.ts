import { api } from "@/lib/axios";
import type { EventListParams, EventDTO } from "./types"; // ← 타입 전용 import

export const getEvents = (params?: EventListParams) =>
  api.get<EventDTO[]>("/event", { params }).then((r) => r.data);

export const getEventById = (id: number) =>
  api.get<EventDTO>(`/event/${id}`).then((r) => r.data);

// ❌ (삭제) export { EventListParams };
// ✅ (선택) 타입 re-export가 필요하면 type으로만 내보내세요
export type { EventListParams, EventDTO };