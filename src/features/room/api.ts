// src/features/room/api.ts
import { api } from "@/lib/axios";

export type RoomDTO = {
  id: number;
  name: string;
  location: string;
  capacity: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId?: number | null;
};

export type CreateRoomDto = {
  name: string;
  location: string;
  capacity: number;
  available: boolean;
  // 이미지 업로드를 멀티파트로 처리할 계획이면 여기 대신 FormData 사용 권장
};

export const getRooms = () => api.get<RoomDTO[]>("/room").then((r) => r.data);

export const getRoomById = (id: number) => api.get<RoomDTO>(`/room/${id}`).then((r) => r.data);

export const createRoom = (dto: CreateRoomDto) => api.post<RoomDTO>("/room", dto).then((r) => r.data);
