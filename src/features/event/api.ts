import { api } from "@/lib/axios";
// import type { EventListParams, EventDTO } from "./types"; // ← 타입 전용 import

// src/features/event/types.ts
/* ──────────────────────────────
 * Event DTO (프론트엔드 전용)
 * Prisma 모델의 주요 필드 + 관계형 데이터 간략 포함
 * ────────────────────────────── */

export type EventDTO = {
  /** PK */
  id: number;

  /** 기본 정보 */
  title: string;
  description: string;
  location: string;
  startTime: string; // ISO
  endTime: string; // ISO
  capacity: number;
  createdAt: string;
  updatedAt: string;

  /** 부가 정보 */
  type: "GENERAL" | "MENTORING" | "WORKSHOP" | "MEETUP";
  price: number;
  paidToHost: boolean;
  hostType: string;

  /** 관계형 (optional: null 허용) */
  mentor?: {
    id: number;
    email: string;
    name?: string | null; // optional 필드
  } | null;

  creator?: {
    id: number;
    email: string;
    name?: string | null;
  } | null;

  category?: {
    id: number;
    name: string;
  } | null;

  room?: {
    id: number;
    name: string;
    location: string;
  } | null;

  /** 이미지 (단순 URL 리스트로 Flatten) */
  imageUrls?: string[];

  /** (선택) 참가 등록 수 */
  registrationsCount?: number;
};

/* ──────────────────────────────
 * Event 리스트 조회용 파라미터
 * ────────────────────────────── */
export type EventListParams = {
  categoryId?: number;
  startTime?: string; // ISO
  endTime?: string; // ISO
  location?: string;
  type?: "GENERAL" | "MENTORING" | "WORKSHOP" | "MEETUP";
};

/* ──────────────────────────────
 * Event 생성 DTO
 * ────────────────────────────── */
export type CreateEventDto = {
  title: string;
  description: string;
  location: string;
  startTime: string; // ISO
  endTime: string; // ISO
  capacity: number;
  price?: number;
  type?: "GENERAL" | "MENTORING" | "WORKSHOP" | "MEETUP";
  categoryId?: number;
  roomId?: number;
  mentorId?: number;
  hostType?: string;
};

export const getEvents = (params?: EventListParams) => api.get<EventDTO[]>("/event", { params }).then((r) => r.data);

export const getEventById = (id: number) => api.get<EventDTO>(`/event/${id}`).then((r) => r.data);

// ✅ 신규 추가: 생성
export const createEvent = (dto: CreateEventDto) => api.post<EventDTO>("/event/create", dto).then((r) => r.data);
