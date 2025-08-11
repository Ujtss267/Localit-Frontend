import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEvents, getEventById, type EventListParams } from "./api";
import { getEventUsers, joinEvent } from "../eventRegistration/api";

export const qk = {
  events: (p?: EventListParams) => ["events", p] as const,
  event: (id: number) => ["event", id] as const,
  eventUsers: (id: number) => ["eventUsers", id] as const,
};

export function useEvents(p?: EventListParams) {
  return useQuery({ queryKey: qk.events(p), queryFn: () => getEvents(p) });
}

export function useEvent(id: number) {
  return useQuery({ queryKey: qk.event(id), queryFn: () => getEventById(id) });
}

export function useEventUsers(id: number) {
  return useQuery({ queryKey: qk.eventUsers(id), queryFn: () => getEventUsers(id) });
}

export function useJoinEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) => joinEvent(eventId),
    onSuccess: (_data, eventId) => {
      qc.invalidateQueries({ queryKey: qk.eventUsers(eventId) });
      qc.invalidateQueries({ queryKey: ["event-registration", "me"] });
    },
  });
}
