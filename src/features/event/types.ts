// src/features/event/types.ts
export type EventDTO = {
  id: number;
  title: string;
  description: string;
  location: string;
  startTime: string; // ISO
  endTime: string; // ISO
  capacity: number;
  createdAt: string;
  updatedAt: string;
};

export type EventListParams = {
  categoryId?: number;
  startTime?: string; // ISO
  endTime?: string; // ISO
  location?: string;
};