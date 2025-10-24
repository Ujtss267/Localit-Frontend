// src/features/event/api.ts
import { api } from "@/lib/axios";

/* ──────────────────────────────
 * Event DTO (프론트 전용)
 * ────────────────────────────── */
export type EventReviewDTO = {
  id: number;
  eventId: number;
  user: { id: number; name?: string | null; email: string };
  rating: number; // 1..5
  title?: string | null;
  content?: string | null;
  isAnonymous?: boolean;
  createdAt: string; // ISO
};

export type RatingBreakdown = {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
};

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

  /** 관계형 (optional) */
  mentor?: { id: number; email: string; name?: string | null } | null;
  creator?: { id: number; email: string; name?: string | null } | null;
  category?: { id: number; name: string } | null;
  room?: { id: number; name: string; location: string } | null;

  /** 이미지 */
  imageUrls?: string[];

  /** 참가 등록 수(옵션) */
  registrationsCount?: number;

  /** ▼▼▼ NEW: 시리즈/회차 + 리뷰 집계 ▼▼▼ */
  seriesId?: number | null; // null/undefined면 단발형
  seriesTitle?: string | null; // 목록 카드를 위해 시리즈 제목 같이 내려주면 UX 굿
  episodeNo?: number | null; // "1회차" 표기용

  ratingAvg?: number | null; // 예: 4.3
  ratingCount?: number | null; // 예: 12
  ratingBreakdown?: Partial<RatingBreakdown>;
  reviews?: EventReviewDTO[];
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

  /** ▼▼▼ NEW: 추가 필터 ▼▼▼ */
  seriesId?: number; // 특정 시리즈의 회차만
  minRating?: number; // 최소 평점
  onlySeries?: boolean; // true면 seriesId != null 인 것만
  onlyOneOff?: boolean; // true면 seriesId == null 인 것만 (단발형)
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

  /** ▼▼▼ NEW: 시리즈 회차 생성 지원 ▼▼▼ */
  seriesId?: number; // 있으면 회차형
  episodeNo?: number; // 선택 (표시/정렬용)
};

/* ──────────────────────────────
 * API
 * ────────────────────────────── */
export const getEvents = (params?: EventListParams) => api.get<EventDTO[]>("/event", { params }).then((r) => r.data);

export const getEventById = (id: number) => api.get<EventDTO>(`/event/${id}`).then((r) => r.data);

export const createEvent = (dto: CreateEventDto) => api.post<EventDTO>("/event/create", dto).then((r) => r.data);
