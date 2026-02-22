import { sampleEvents, sampleSeries, sampleSeriesDetails } from "@/features/event/sampleEvents";
import { sampleRooms } from "@/features/room/sampleRooms";
import { sampleMyPages } from "@/features/my/sampleMyPage";
import type { ApplicationStatus, RegistrationStatus, Visibility } from "@/features/event/api";

export type SampleUserPreference = {
  needsRoom: boolean;
  lat?: number;
  lng?: number;
};

export const sampleUserPreferences: Record<number, SampleUserPreference> = {
  1: { needsRoom: true, lat: 37.5665, lng: 126.978 },
  2: { needsRoom: true, lat: 35.1796, lng: 129.0756 },
  3: { needsRoom: false, lat: 35.1595, lng: 129.0756 },
  999: { needsRoom: true, lat: 37.504, lng: 127.048 },
};

export type SampleUser = {
  userId: number;
  email: string;
  name: string;
  nickname: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
};

export type SampleCategory = {
  categoryId: number;
  name: string;
};

export type SampleRoomReservation = {
  roomReservationId: number;
  roomId: number;
  userId: number;
  startTime: string;
  endTime: string;
  status: "BOOKED" | "CANCELLED";
  paymentId?: number | null;
};

export type SamplePayment = {
  paymentId: number;
  eventId?: number | null;
  roomReservationId?: number | null;
  userId: number;
  hostId?: number | null;
  amount: number;
  status: "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";
  paidAt?: string | null;
};

export type SampleEventRegistration = {
  eventRegistrationId: number;
  eventId: number;
  userId: number;
  applicationStatus: ApplicationStatus | null;
  registrationStatus: RegistrationStatus | null;
};

export const sampleUsers: SampleUser[] = [
  {
    userId: 1,
    email: "host1@example.com",
    name: "욱진",
    nickname: "wookjin",
    isEmailVerified: true,
    isPhoneVerified: true,
  },
  {
    userId: 2,
    email: "host2@example.com",
    name: "Alice",
    nickname: "alice",
    isEmailVerified: true,
    isPhoneVerified: false,
  },
  {
    userId: 3,
    email: "host3@example.com",
    name: "Dana",
    nickname: "dana",
    isEmailVerified: true,
    isPhoneVerified: false,
  },
  {
    userId: 999,
    email: "wookjin@example.com",
    name: "Wookjin",
    nickname: "wookjin",
    isEmailVerified: true,
    isPhoneVerified: true,
  },
];

export const sampleCategories: SampleCategory[] = [
  { categoryId: 1, name: "스터디" },
  { categoryId: 2, name: "공연/문화" },
  { categoryId: 3, name: "소셜" },
];

export const sampleRegistrations: SampleEventRegistration[] = [
  { eventRegistrationId: 5001, eventId: 101, userId: 1, applicationStatus: "APPROVED", registrationStatus: "CONFIRMED" },
  { eventRegistrationId: 5002, eventId: 102, userId: 1, applicationStatus: "SUBMITTED", registrationStatus: null },
  { eventRegistrationId: 5003, eventId: 201, userId: 1, applicationStatus: "WAITLIST", registrationStatus: null },
];

export const sampleRoomReservations: SampleRoomReservation[] = [
  {
    roomReservationId: 7001,
    roomId: 101,
    userId: 1,
    startTime: sampleEvents[0]?.startTime ?? new Date().toISOString(),
    endTime: sampleEvents[0]?.endTime ?? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: "BOOKED",
    paymentId: 9001,
  },
];

export const samplePayments: SamplePayment[] = [
  {
    paymentId: 9001,
    eventId: 101,
    roomReservationId: 7001,
    userId: 1,
    hostId: 1,
    amount: 0,
    status: "PAID",
    paidAt: new Date().toISOString(),
  },
];

const normalizeVisibility = (v?: Visibility): Visibility => v ?? "PUBLIC";
const premiumHostIds = new Set<number>([1, 3]);

const normalizedEvents = sampleEvents.map((event) => ({
  ...event,
  visibility: normalizeVisibility(event.visibility),
  categoryId: event.categoryId ?? sampleCategories[0].categoryId,
  creatorId: event.creatorId ?? event.creator?.id ?? sampleUsers[0].userId,
  mentorId: event.mentorId ?? event.mentor?.id ?? null,
  roomId: event.roomId ?? null,
  lat: event.lat ?? null,
  lng: event.lng ?? null,
  isPremiumHostEvent: event.isPremiumHostEvent ?? premiumHostIds.has(event.creatorId ?? event.creator?.id ?? -1),
  creator: event.creator
    ? {
        ...event.creator,
        isPremiumHost: event.creator.isPremiumHost ?? premiumHostIds.has(event.creator.id ?? -1),
      }
    : event.creator,
}));

export const sampleData = {
  users: sampleUsers,
  categories: sampleCategories,
  events: normalizedEvents,
  registrations: sampleRegistrations,
  series: sampleSeries,
  seriesDetails: sampleSeriesDetails,
  rooms: sampleRooms,
  roomReservations: sampleRoomReservations,
  payments: samplePayments,
  myPages: sampleMyPages,
  userPreferences: sampleUserPreferences,
} as const;
