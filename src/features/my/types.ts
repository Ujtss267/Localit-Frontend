// src/features/my/types.ts

export type Visibility = "PUBLIC" | "FOLLOWERS" | "PRIVATE";
export type EventType = "GENERAL" | "MENTORING" | "WORKSHOP" | "MEETUP";

export interface EventItemDto {
  eventId: number;
  title: string;
  startTime: string; // ISO
  endTime: string; // ISO
  location?: string;
  lat?: number | null;
  lng?: number | null;
  type?: EventType;
  imageUrl?: string;
  visibility?: Visibility;
}

export interface RoomItemDto {
  roomId: number;
  name: string;
  location?: string;
  lat?: number | null;
  lng?: number | null;
  capacity?: number;
  available?: boolean;
  imageUrl?: string;
  visibility?: Visibility;
}

export interface ReservationItemDto {
  roomReservationId: number;
  room: Pick<RoomItemDto, "roomId" | "name" | "location" | "imageUrl" | "visibility">;
  startTime: string;
  endTime: string;
}

export interface MyPageSectionsDto {
  hostedEvents: EventItemDto[];
  participatingEvents: EventItemDto[];
  roomReservations: ReservationItemDto[];
  myRooms: RoomItemDto[];
}

export interface UserBriefDto {
  userId: number;
  displayName: string;
  avatarUrl?: string;
  isFollowingMe: boolean; // 나를 팔로우함
  iFollow: boolean; // 내가 팔로우함
}

export interface MyPageDto {
  profileUserId: number;
  profileName: string;
  profileTitle?: string;
  profileBio?: string;
  profileLocation?: string;
  profileIntro?: string;
  profileTags?: string[];
  isOwner: boolean;
  isFollower: boolean;
  sections: MyPageSectionsDto;
  followers: UserBriefDto[];
  following: UserBriefDto[];
}
