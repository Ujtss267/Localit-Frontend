// src/features/event/sampleEvents.ts
import type { EventDTO, SeriesDTO, SeriesDetailDTO, ApplicationStatus, RegistrationStatus } from "./api";

export const sampleSeries: SeriesDTO[] = [
  {
    seriesId: 1000,
    title: "영어회화 스터디",
    description: "기초 회화 시리즈",
    isPublic: true,
    hostId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    seriesId: 2000,
    title: "보드게임 정모",
    description: "주말 모임 시리즈",
    isPublic: true,
    hostId: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    seriesId: 3000,
    title: "사진 동호회",
    description: "야외 출사 시리즈",
    isPublic: false,
    hostId: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const sampleSeriesDetails: SeriesDetailDTO = {
  seriesId: 1000,
  title: "영어회화 스터디",
  description: "최근 회차 미리보기",
  isPublic: true,
  hostId: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  recentEpisodes: [
    {
      id: 101,
      title: "1회차: 아이스브레이킹",
      episodeNo: 1,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 2 * 3600_000).toISOString(),
    },
    {
      id: 102,
      title: "2회차: 패턴 트레이닝",
      episodeNo: 2,
      startTime: new Date(Date.now() + 24 * 3600_000).toISOString(),
      endTime: new Date(Date.now() + 26 * 3600_000).toISOString(),
    },
    {
      id: 103,
      title: "3회차: test",
      episodeNo: 3,
      startTime: new Date(Date.now() + 24 * 3600_000).toISOString(),
      endTime: new Date(Date.now() + 26 * 3600_000).toISOString(),
    },
  ],
};

// 현재 로그인 유저를 id=1로 가정
export const sampleEvents: EventDTO[] = [
  {
    id: 101,
    title: "영어회화 스터디 1회차",
    description: "기본 문장 말하기 연습, 아이스브레이킹과 쉬운 패턴부터!",
    location: "서울 마포",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    capacity: 16,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: "MEETUP",
    price: 0,
    paidToHost: true,
    hostType: "creator",
    imageUrls: [
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
    ],
    seriesId: 1000,
    seriesTitle: "영어회화 스터디",
    episodeNo: 1,
    ratingAvg: 4.6,
    ratingCount: 18,
    ratingBreakdown: { 5: 12, 4: 4, 3: 2, 2: 0, 1: 0 },
    reviews: [
      {
        id: 1,
        eventId: 101,
        user: { id: 9, name: "Alex Kim", email: "alex@example.com" },
        rating: 5,
        title: "분위기 최고",
        content: "처음 와도 편하게 얘기할 수 있었어요. 진행도 깔끔!",
        createdAt: new Date(Date.now() - 86400_000).toISOString(),
      },
      {
        id: 2,
        eventId: 101,
        user: { id: 11, name: "Mina", email: "mina@example.com" },
        rating: 4,
        title: "유익했습니다",
        content: "기초 문장 반복이 도움됐어요. 다음 회차도 참여할래요.",
        createdAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
      },
    ],
    creator: {
      id: 1,
      email: "host1@example.com",
      name: "욱진",
    },
    // ✅ 신청 승인 + 참석 예정 상태
    myRegistration: {
      applicationStatus: "APPROVED", // 심사 승인 완료
      registrationStatus: "CONFIRMED", // 실제 등록도 확정(참석 예정)
      checkInAt: null,
      cancelAt: null,
    },
  },
  {
    id: 102,
    title: "영어회화 스터디 2회차",
    description: "지난 회차 복습 + 실전 롤플레이. 파트너 스피킹 위주!",
    location: "서울 마포",
    startTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    capacity: 16,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: "MEETUP",
    price: 0,
    paidToHost: true,
    hostType: "creator",
    imageUrls: ["https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800"],
    seriesId: 1000,
    seriesTitle: "영어회화 스터디",
    episodeNo: 2,
    ratingAvg: 4.7,
    ratingCount: 9,
    ratingBreakdown: { 5: 6, 4: 2, 3: 1 },
    reviews: [],
    creator: {
      id: 1,
      email: "host1@example.com",
      name: "욱진",
    },
    // ✅ 신청 완료(심사/승인 대기 상태)
    myRegistration: {
      applicationStatus: "SUBMITTED", // 신청서 제출만 된 상태
      registrationStatus: null, // 아직 등록(참석 확정) 전
      checkInAt: null,
      cancelAt: null,
    },
  },
  {
    id: 201,
    title: "주말 버스킹 공연",
    description: "지역 아마추어 뮤지션들과 함께하는 소규모 공연",
    location: "대구 동성로",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    capacity: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: "GENERAL",
    price: 0,
    paidToHost: true,
    hostType: "creator",
    imageUrls: [
      "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800",
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800",
      "https://images.unsplash.com/photo-1485988412941-77a35537dae4?w=800",
    ],
    ratingAvg: 4.2,
    ratingCount: 5,
    ratingBreakdown: { 5: 2, 4: 2, 3: 1 },
    reviews: [
      {
        id: 3,
        eventId: 201,
        user: { id: 3, name: "JH", email: "jh@example.com" },
        rating: 4,
        title: "분위기 좋았어요",
        content: "무대랑 관객 거리도 가깝고 몰입감 있었습니다.",
        createdAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
      },
    ],
    creator: {
      id: 2,
      email: "host1@example.com",
      name: "욱진",
    },
    // ✅ 정원/조건 때문에 대기열로 간 상태 예시
    myRegistration: {
      applicationStatus: "WAITLIST", // 대기열
      registrationStatus: null, // 아직 실제 등록은 안 됨
      checkInAt: null,
      cancelAt: null,
    },
  },
  {
    id: 202,
    title: "블라인드 소개팅",
    description: "당신의 단짝을 만나게 도와드립니다.",
    location: "서울 강남",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    capacity: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: "GENERAL",
    price: 0,
    paidToHost: true,
    hostType: "creator",
    imageUrls: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800",
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800",
      "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=800",
    ],
    ratingAvg: 4.2,
    ratingCount: 5,
    ratingBreakdown: { 5: 2, 4: 2, 3: 1 },
    reviews: [
      {
        id: 3,
        eventId: 201,
        user: { id: 3, name: "JH", email: "jh@example.com" },
        rating: 4,
        title: "감사합니다",
        content: "여기서 정말 좋은 인연 만나갑니다",
        createdAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
      },
    ],
    creator: {
      id: 2,
      email: "host1@example.com",
      name: "욱진",
    },
    // ✅ 정원/조건 때문에 대기열로 간 상태 예시
    myRegistration: {
      applicationStatus: null, // 참가하기
      registrationStatus: null, // 아직 실제 등록은 안 됨
      checkInAt: null,
      cancelAt: null,
    },
  },
];

export async function searchSampleSeries(q: string): Promise<SeriesDTO[]> {
  const keyword = q.trim();
  if (!keyword) return sampleSeries;
  return sampleSeries.filter((s) => s.title.includes(keyword));
}

export async function getSampleSeriesById(seriesId: number): Promise<SeriesDetailDTO | null> {
  if (seriesId === 1000) return sampleSeriesDetails;
  return null;
}
