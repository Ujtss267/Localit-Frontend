import { api } from "@/lib/axios";
import type { ApplicationStatus, RegistrationStatus } from "../event/api";

export const joinEvent = (eventId: number) => api.post("/event-registration", { eventId }).then((r) => r.data);

export type EventUser = { id: number; email: string };
export const getEventUsers = (eventId: number) => api.get<EventUser[]>(`/event/${eventId}/users`).then((r) => r.data);

export const getMyEventRegistrations = () => api.get("/event-registration/me").then((r) => r.data);

export type EventApplicationItem = {
  eventApplicationId: number;
  eventId: number;
  userId: number;
  status: ApplicationStatus;
  note?: string | null;
  answers?: unknown;
  createdAt: string;
  user?: {
    userId: number;
    name?: string | null;
    nickname?: string | null;
    email?: string | null;
  } | null;
};

export type EventParticipantItem = {
  eventRegistrationId: number;
  eventId: number;
  userId: number;
  status: RegistrationStatus;
  checkInAt?: string | null;
  cancelAt?: string | null;
  createdAt: string;
  user?: {
    userId: number;
    name?: string | null;
    nickname?: string | null;
    email?: string | null;
  } | null;
};

export const getEventApplications = (eventId: number) =>
  api.get<EventApplicationItem[]>(`/event/${eventId}/applications`).then((r) => r.data);

export const updateEventApplicationStatus = (eventApplicationId: number, status: ApplicationStatus, note?: string) =>
  api.patch<EventApplicationItem>(`/event-application/${eventApplicationId}/status`, { status, note }).then((r) => r.data);

export const getEventParticipants = (eventId: number) =>
  api.get<EventParticipantItem[]>(`/event/${eventId}/participants`).then((r) => r.data);

export const updateEventParticipantStatus = (eventRegistrationId: number, status: RegistrationStatus) =>
  api.patch<EventParticipantItem>(`/event-registration/${eventRegistrationId}/status`, { status }).then((r) => r.data);

export const checkinEventByToken = (eventId: number, token: string) =>
  api.post<{ ok: boolean; registration?: EventParticipantItem; message?: string }>(`/event/${eventId}/checkin`, { token }).then((r) => r.data);

export const applyEvent = (eventId: number, answers?: unknown) => api.post("/event-application", { eventId, answers }).then((r) => r.data);
