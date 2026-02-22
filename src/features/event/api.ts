// src/features/event/api.ts
import { api } from "@/lib/axios";

export type SeriesOption = { seriesId: number; title: string };

export type SeriesConnectorProps = {
  selectedSeries: SeriesOption | null;
  setSelectedSeries: (v: SeriesOption | null) => void;
  canEdit: boolean;
  seriesDetails: {
    details: {
      description?: string;
      isPublic?: boolean;
      recentEpisodes?: { id: number; title: string; episodeNo?: number; startTime?: string }[];
    } | null;
  };
  createSeriesOpen: boolean;
  setCreateSeriesOpen: (v: boolean) => void;
  setEditSeriesOpen: (v: boolean) => void;
  setBulkOpen: (v: boolean) => void;
  seriesSearch: { options: SeriesOption[]; isLoading: boolean; search: (keyword: string) => Promise<void> };
  seriesKeyword: string;
  setSeriesKeyword: (v: string) => void;
  episodeNo: number | "";
  setEpisodeNo: (v: number | "") => void;
};

/* ──────────────────────────────
 * Prisma Enum unions (TS)
 * ────────────────────────────── */
export type EventType = "GENERAL" | "MENTORING" | "WORKSHOP" | "MEETUP";
export type SlotDuration = "MIN30" | "MIN60" | "MIN90" | "MIN120";
export type Visibility = "PUBLIC" | "FOLLOWERS" | "PRIVATE";
export type FeedbackType = "UX" | "CONTENT" | "PRICE" | "HOST" | "FACILITY" | "OTHER";
export type AdmissionPolicy = "FIRST_COME" | "REVIEW";
/** 신청이후 프로세스 상태 */
export type RegistrationStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "ATTENDED" | "NO_SHOW";
/** 신청/심사 프로세스 상태 (신청서 관점) */
export type ApplicationStatus = "SUBMITTED" | "APPROVED" | "REJECTED" | "WAITLIST";

/** 현재 로그인 사용자의 신청/등록 상태 DTO */
export type MyRegistrationDTO = {
  applicationStatus: ApplicationStatus | null; // 신청/심사 상태
  registrationStatus?: RegistrationStatus | null; // 실제 참석 상태(승인 이후)
  checkInAt?: string | null; // QR 체크인 시각
  cancelAt?: string | null; // 취소 시각
};

/* ──────────────────────────────
 * Series DTOs (프론트 전용)
 * ────────────────────────────── */
export type SeriesDTO = {
  seriesId: number;
  title: string;
  description?: string;
  isPublic: boolean;
  hostId: number;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type SeriesDetailDTO = SeriesDTO & {
  recentEpisodes: Array<{
    id: number;
    title: string;
    episodeNo?: number | null;
    startTime?: string | null; // ISO
    endTime?: string | null; // ISO
  }>;
};

export type CreateSeriesDto = {
  title: string;
  description?: string;
  isPublic?: boolean;
};

export type UpdateSeriesDto = {
  seriesId: number;
  title?: string;
  description?: string;
  isPublic?: boolean;
};

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
  lat?: number | null; // 위도
  lng?: number | null; // 경도
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
  visibility: Visibility;
  categoryId?: number | null;
  mentorId?: number | null;
  creatorId?: number | null;
  roomId?: number | null;

  /** 관계형 (optional) */
  mentor?: { id: number; email: string; name?: string | null } | null;
  creator?: { id?: number; userId?: number; email: string; name?: string | null; isPremiumHost?: boolean } | null;
  category?: { id: number; name: string } | null;
  room?: { id: number; name: string; location: string } | null;
  isPremiumHostEvent?: boolean;

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
  genderControl?: GenderControlDto;

  /** ▼▼▼ NEW: 현재 로그인 사용자의 신청/참석 상태 ▼▼▼ */
  myRegistration?: MyRegistrationDTO;
  policy?: EventPolicyDto | null;
};

/* ──────────────────────────────
 * gender control dto (옵션)
 * ────────────────────────────── */
export type GenderControlDto = {
  maleLimit?: boolean;
  femaleLimit?: boolean;
  balanceRequired?: boolean;
};

export type EventPolicyDto = {
  admission: AdmissionPolicy;
  requiresInterview?: boolean;
  enforceGenderBalance?: boolean;
  capacityMale?: number | null;
  capacityFemale?: number | null;
  capacityOther?: number | null;
  allowWaitlist?: boolean;
  applyDeadline?: string | null;
};

/** Server(API) Event shape aligned with Prisma */
export type ApiEvent = {
  eventId: number;
  title: string;
  description: string;
  location: string;
  lat?: number | null;
  lng?: number | null;
  startTime: string;
  endTime: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
  type: EventType;
  mentorId?: number | null;
  categoryId?: number | null;
  creatorId?: number | null;
  roomId?: number | null;
  price: number;
  paidToHost: boolean;
  hostType: string;
  seriesId?: number | null;
  episodeNo?: number | null;
  ratingAvg?: string | number | null; // Prisma Decimal -> string
  ratingCount?: number | null;
  visibility: Visibility;
  imageUrls?: string[];
  genderControl?: GenderControlDto;
};

/** Mapper: ApiEvent -> EventDTO (UI) */
export function mapApiEventToEventDTO(e: ApiEvent): EventDTO {
  return {
    id: e.eventId,
    title: e.title,
    description: e.description,
    location: e.location,
    lat: e.lat ?? null,
    lng: e.lng ?? null,
    startTime: e.startTime,
    endTime: e.endTime,
    capacity: e.capacity,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
    type: e.type,
    price: e.price,
    paidToHost: e.paidToHost,
    hostType: e.hostType,
    visibility: e.visibility,
    categoryId: e.categoryId ?? null,
    mentorId: e.mentorId ?? null,
    creatorId: e.creatorId ?? null,
    roomId: e.roomId ?? null,
    imageUrls: e.imageUrls,
    seriesId: e.seriesId ?? null,
    episodeNo: e.episodeNo ?? null,
    ratingAvg: e.ratingAvg == null ? null : typeof e.ratingAvg === "string" ? parseFloat(e.ratingAvg) : e.ratingAvg,
    ratingCount: e.ratingCount ?? null,
    // Optional relations (creator/mentor/category/room) can be expanded in a richer mapper when API returns joins
    genderControl: e.genderControl ?? null,
  } as EventDTO;
}

/* ──────────────────────────────
 * Event 리스트 조회용 파라미터
 * ────────────────────────────── */
export type EventListParams = {
  categoryId?: number;
  startTime?: string; // ISO
  endTime?: string; // ISO
  location?: string;
  type?: "GENERAL" | "MENTORING" | "WORKSHOP" | "MEETUP"; // 이벤트 타입 필터
  sort?: "latest" | "popular" | "upcoming"; // 정렬 방식
  page?: number;
  /** ▼▼▼ NEW: 추가 필터 ▼▼▼ */
  seriesId?: number; // 특정 시리즈의 회차만
  minRating?: number; // 최소 평점
  onlySeries?: boolean; // true면 seriesId != null 인 것만
  onlyOneOff?: boolean; // true면 seriesId == null 인 것만 (단발형)
  creatorId?: number;
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
  lat?: number; // 위도
  lng?: number; // 경도
  price?: number;
  type?: EventType;
  categoryId?: number;
  roomId?: number;
  mentorId?: number;
  creatorId?: number;
  hostType?: string;
  paidToHost?: boolean;
  visibility?: Visibility;
  admissionPolicy?: AdmissionPolicy;
  /** ▼▼▼ NEW: 시리즈 회차 생성 지원 ▼▼▼ */
  seriesId?: number; // 있으면 회차형
  episodeNo?: number; // 선택 (표시/정렬용)
  genderControl?: GenderControlDto;
};

export type UpdateEventDto = Partial<CreateEventDto>;

/* ──────────────────────────────
 * API
 * ────────────────────────────── */
export const getEvents = (params?: EventListParams) => api.get<EventDTO[]>("/event", { params }).then((r) => r.data);

export const getEventById = (id: number) => api.get<EventDTO>(`/event/${id}`).then((r) => r.data);

export const createEvent = (dto: CreateEventDto) => api.post<EventDTO>("/event/create", dto).then((r) => r.data);

/** ✅ 이벤트 수정 API */
export const updateEvent = (id: number, dto: UpdateEventDto) => api.put<EventDTO>(`/event/${id}`, dto).then((r) => r.data);

/* ──────────────────────────────
 * Series API
 * ────────────────────────────── */
export const searchSeries = (q: string) => api.get<SeriesDTO[]>("/series/search", { params: { q } }).then((r) => r.data);

export const getSeriesById = (seriesId: number) => api.get<SeriesDetailDTO>(`/series/${seriesId}`).then((r) => r.data);

export const createSeriesApi = (dto: CreateSeriesDto) => api.post<SeriesDTO>("/series", dto).then((r) => r.data);

export const updateSeriesApi = (dto: UpdateSeriesDto) => api.patch<SeriesDTO>(`/series/${dto.seriesId}`, dto).then((r) => r.data);
