import { api } from "@/lib/axios";
// import type { EventListParams, EventDTO } from "./types"; // ← 타입 전용 import

// src/features/event/types.ts
export type EventDTO = {
  id: number;
  title: string;
  description: string;
  location: string;
  startTime: string; // ISO
  endTime: string; // ISO
  capacity: number;
  createdAt: string;
  updatedAt: string;
  imageUrls?: string[]; // 선택적
};

export type EventListParams = {
  categoryId?: number;
  startTime?: string; // ISO
  endTime?: string; // ISO
  location?: string;
};

export type CreateEventDto = {
  title: string;
  description: string;
  location: string;
  startTime: string; // ISO
  endTime: string; // ISO
  capacity: number;
};

export const getEvents = (params?: EventListParams) => api.get<EventDTO[]>("/event", { params }).then((r) => r.data);

export const getEventById = (id: number) => api.get<EventDTO>(`/event/${id}`).then((r) => r.data);

// ✅ 신규 추가: 생성
export const createEvent = (dto: CreateEventDto) => api.post<EventDTO>("/event/create", dto).then((r) => r.data);
