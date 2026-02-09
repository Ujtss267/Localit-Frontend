// src/features/room/api.ts
import { api } from "@/lib/axios";

export type RoomDTO = {
  id: number;
  name: string;
  location: string;
  lat?: number | null;
  lng?: number | null;
  capacity: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId?: number | null;
  imageUrls?: string[];
};

export type CreateRoomDto = {
  name: string;
  location: string;
  capacity: number;
  available: boolean;
  // 이미지 업로드를 멀티파트로 처리할 계획이면 여기 대신 FormData 사용 권장
};

export type RoomAvailability = {
  available: boolean;
  reason: "ROOM_NOT_AVAILABLE" | "TIME_CONFLICT" | null;
};

type ApiRoom = {
  roomId: number;
  name: string;
  location: string;
  lat?: number | null;
  lng?: number | null;
  capacity: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId?: number | null;
  imageUrls?: string[];
};

function mapApiRoom(r: ApiRoom): RoomDTO {
  return {
    id: r.roomId,
    name: r.name,
    location: r.location,
    lat: r.lat ?? null,
    lng: r.lng ?? null,
    capacity: r.capacity,
    available: r.available,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    creatorId: r.creatorId ?? null,
    imageUrls: r.imageUrls ?? [],
  };
}

export const getRooms = () => api.get<ApiRoom[]>("/room").then((r) => r.data.map(mapApiRoom));

export const getRoomById = (id: number) => api.get<ApiRoom>(`/room/${id}`).then((r) => mapApiRoom(r.data));

export const createRoom = (dto: CreateRoomDto) => api.post<ApiRoom>("/room", dto).then((r) => mapApiRoom(r.data));

export const checkRoomAvailability = (roomId: number, startTime: string, endTime: string) =>
  api
    .get<RoomAvailability>("/room-reservation/availability", {
      params: { roomId, startTime, endTime },
    })
    .then((r) => r.data);
