import type { EventDTO } from "./api";

const now = Date.now();

export const sampleEvents: EventDTO[] = [
  {
    id: 1,
    title: "로컬 스터디 모임",
    description: "프론트엔드 입문자를 위한 리액트/TS 기초",
    location: "서울 마포",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    capacity: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "주말 농구 번개",
    description: "초급~중급 환영, 체육관 대관 완료",
    location: "부산 진구",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    capacity: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "주말 버스킹 공연",
    description: "지역 아마추어 뮤지션들과 함께하는 소규모 공연",
    location: "대구 동성로",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    capacity: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
