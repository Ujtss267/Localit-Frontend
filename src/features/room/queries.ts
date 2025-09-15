// src/features/room/queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRooms, getRoomById, createRoom, type CreateRoomDto, type RoomDTO } from "./api";

export const qk = {
  rooms: () => ["rooms"] as const,
  room: (id: number) => ["room", id] as const,
};

export function useRooms() {
  return useQuery({ queryKey: qk.rooms(), queryFn: getRooms, staleTime: 30_000 });
}

export function useRoom(id: number) {
  return useQuery({ queryKey: qk.room(id), queryFn: () => getRoomById(id), enabled: Number.isFinite(id) });
}

export function useCreateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRoomDto) => createRoom(dto),
    onSuccess: (created: RoomDTO) => {
      qc.invalidateQueries({ queryKey: qk.rooms() });
      if (created?.id) qc.setQueryData(qk.room(created.id), created);
    },
  });
}
