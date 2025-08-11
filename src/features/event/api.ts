import { api } from "@/lib/axios";

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
};

export type EventListParams = {
  categoryId?: number;
  startTime?: string; // ISO
  endTime?: string; // ISO
  location?: string;
};

export const getEvents = (params?: EventListParams) => api.get<EventDTO[]>("/event", { params }).then((r) => r.data);

export const getEventById = (id: number) => api.get<EventDTO>(`/event/${id}`).then((r) => r.data);
