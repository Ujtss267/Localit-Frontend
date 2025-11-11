// src/features/event/queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent, // ✅ 방금 만든 거 임포트
  type EventListParams,
  type CreateEventDto,
  type EventDTO,
  type UpdateEventDto,
} from "./api";
import { getEventUsers, joinEvent } from "../eventRegistration/api";

export const qk = {
  events: (p?: EventListParams) => ["events", p] as const,
  event: (id: number) => ["event", id] as const,
  eventUsers: (id: number) => ["eventUsers", id] as const,
  myEventRegistrations: () => ["event-registration", "me"] as const,
};

/** 이벤트 목록 */
export function useEvents(p?: EventListParams) {
  return useQuery({
    queryKey: qk.events(p),
    queryFn: () => getEvents(p),
    staleTime: 30_000,
  });
}

/** 이벤트 상세 */
export function useEvent(id: number) {
  return useQuery({
    queryKey: qk.event(id),
    queryFn: () => getEventById(id),
    enabled: Number.isFinite(id),
    staleTime: 30_000,
  });
}

/** 이벤트 참가자 목록 */
export function useEventUsers(id: number) {
  return useQuery({
    queryKey: qk.eventUsers(id),
    queryFn: () => getEventUsers(id),
    enabled: Number.isFinite(id),
  });
}

/** 이벤트 참가 */
export function useJoinEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) => joinEvent(eventId),
    onSuccess: (_data, eventId) => {
      // 참가자 목록 갱신
      qc.invalidateQueries({ queryKey: qk.eventUsers(eventId) });
      // 내 참가 목록 갱신
      qc.invalidateQueries({ queryKey: qk.myEventRegistrations() });
    },
  });
}

/** 이벤트 생성 */
export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateEventDto) => createEvent(dto),
    onSuccess: (created: EventDTO) => {
      // 1) 목록(모든 필터 조합)을 폭넓게 무효화
      //    -> queryKey가 ["events", ...]로 시작하는 모든 쿼리 무효화
      qc.invalidateQueries({ queryKey: ["events"] });

      // 2) 상세 캐시 priming(선택): 생성 직후 상세로 이동한다면 유용
      if (created?.id) {
        qc.setQueryData(qk.event(created.id), created);
      }
    },
  });
}

export function useEventById(id: number) {
  return useEvent(id); // 이미 있는 훅을 재사용
}

/** 이벤트 수정 */
// ✅ 업데이트 훅
export function useUpdateEvent(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateEventDto) => updateEvent(id, dto),
    onSuccess: (updated) => {
      qc.setQueryData(qk.event(id), updated);
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
