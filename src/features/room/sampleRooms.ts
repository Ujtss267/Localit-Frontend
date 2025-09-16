import type { RoomDTO } from "./api";

const now = Date.now();

export const sampleRooms: RoomDTO[] = [
  {
    id: 101,
    name: "브룸브레인 A실",
    location: "서울 강남구 테헤란로 123, 10F",
    capacity: 12,
    available: true,
    createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
    creatorId: 1,
  },
  {
    id: 102,
    name: "로컬잇 라운지",
    location: "부산 해운대구 센텀중앙로 45",
    capacity: 30,
    available: false,
    createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    creatorId: 2,
  },
  {
    id: 103,
    name: "멘토링 스튜디오",
    location: "경남 창원시 성산구 중앙대로 100",
    capacity: 8,
    available: true,
    createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
    creatorId: null,
  },
];
