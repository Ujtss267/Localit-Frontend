import { api } from "@/lib/axios";

export const joinEvent = (eventId: number) => api.post("/event-registration", { eventId }).then((r) => r.data);

export type EventUser = { id: number; email: string };
export const getEventUsers = (eventId: number) => api.get<EventUser[]>(`/event/${eventId}/users`).then((r) => r.data);

export const getMyEventRegistrations = () => api.get("/event-registration/me").then((r) => r.data);
