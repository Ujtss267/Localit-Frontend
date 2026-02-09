// src/features/my/sampleMyPages.ts
import { MyPageDto } from "./types";

const now = () => new Date().toISOString();
const plusHours = (h: number) => new Date(Date.now() + h * 60 * 60 * 1000).toISOString();

export const sampleMyPages: Record<number, MyPageDto> = {
  // ─────────────────────────────────────────
  // 999: 원래 있던 Wookjin 데이터
  // ─────────────────────────────────────────
  999: {
    profileUserId: 999,
    profileName: "Wookjin",
    profileTitle: "Product Builder · Community Host",
    profileBio: "로컬 커뮤니티에서 만남이 더 쉬워지도록 경험을 설계합니다.",
    profileLocation: "서울 · 선릉",
    profileIntro: "작게 시작해서 크게 성장하는 모임을 좋아해요. 워크숍과 멘토링을 자주 열고 있습니다.",
    profileTags: ["커뮤니티", "멘토링", "워크숍"],
    isOwner: true,
    isFollower: false,
    sections: {
      hostedEvents: [
        {
          eventId: 1,
          title: "Flutter 워크숍 #1",
          startTime: now(),
          endTime: plusHours(2),
          location: "선릉",
          type: "WORKSHOP",
          imageUrl: "https://picsum.photos/seed/ev1/480/300",
          visibility: "PUBLIC",
        },
        {
          eventId: 2,
          title: "멘토링 데이",
          startTime: now(),
          endTime: plusHours(1.5),
          location: "판교",
          type: "MENTORING",
          imageUrl: "https://picsum.photos/seed/ev2/480/300",
          visibility: "FOLLOWERS",
        },
      ],
      participatingEvents: [
        {
          eventId: 3,
          title: "리액트 밋업",
          startTime: now(),
          endTime: plusHours(1),
          location: "강남",
          type: "MEETUP",
          imageUrl: "https://picsum.photos/seed/ev3/480/300",
          visibility: "PUBLIC",
        },
      ],
      roomReservations: [
        {
          roomReservationId: 10,
          room: {
            roomId: 101,
            name: "Localit Lab A",
            location: "선릉",
            imageUrl: "https://picsum.photos/seed/room1/480/300",
            visibility: "PRIVATE",
          },
          startTime: now(),
          endTime: plusHours(1),
        },
      ],
      myRooms: [
        {
          roomId: 101,
          name: "Localit Lab A",
          location: "선릉",
          capacity: 16,
          available: true,
          imageUrl: "https://picsum.photos/seed/room2/480/300",
          visibility: "PUBLIC",
        },
        {
          roomId: 102,
          name: "Localit Seminar B",
          location: "역삼",
          capacity: 24,
          available: false,
          imageUrl: "https://picsum.photos/seed/room3/480/300",
          visibility: "FOLLOWERS",
        },
      ],
    },
    followers: [
      { userId: 1, displayName: "Alice", avatarUrl: "https://i.pravatar.cc/80?img=1", isFollowingMe: true, iFollow: false },
      { userId: 2, displayName: "Bob", avatarUrl: "https://i.pravatar.cc/80?img=2", isFollowingMe: true, iFollow: true },
    ],
    following: [
      { userId: 3, displayName: "Charlie", avatarUrl: "https://i.pravatar.cc/80?img=3", isFollowingMe: false, iFollow: true },
      { userId: 4, displayName: "Dana", avatarUrl: "https://i.pravatar.cc/80?img=4", isFollowingMe: true, iFollow: true },
    ],
  },

  // ─────────────────────────────────────────
  // 1: Alice
  // ─────────────────────────────────────────
  1: {
    profileUserId: 1,
    profileName: "Alice",
    profileTitle: "UX Designer · Figma Educator",
    profileBio: "일하는 사람들을 위한 유용한 도구와 워크숍을 만듭니다.",
    profileLocation: "서울 · 성수",
    profileIntro: "작은 팀이 더 빠르게 배우고 성장할 수 있도록 돕는 세션을 운영해요.",
    profileTags: ["디자인", "스터디", "워크숍"],
    isOwner: false,
    isFollower: true, // 내가 이 사람을 보고 있다고 가정하면 true/false로 바꿔가며 테스트 가능
    sections: {
      hostedEvents: [
        {
          eventId: 11,
          title: "Alice의 디자인 워크숍",
          startTime: now(),
          endTime: plusHours(2),
          location: "온라인",
          type: "WORKSHOP",
          imageUrl: "https://picsum.photos/seed/ev11/480/300",
          visibility: "PUBLIC",
        },
        {
          eventId: 12,
          title: "Figma 실습 스터디",
          startTime: now(),
          endTime: plusHours(1.5),
          location: "성수",
          type: "GENERAL",
          imageUrl: "https://picsum.photos/seed/ev12/480/300",
          visibility: "FOLLOWERS",
        },
      ],
      participatingEvents: [
        {
          eventId: 3,
          title: "리액트 밋업",
          startTime: now(),
          endTime: plusHours(1),
          location: "강남",
          type: "MEETUP",
          imageUrl: "https://picsum.photos/seed/ev3/480/300",
          visibility: "PUBLIC",
        },
      ],
      roomReservations: [],
      myRooms: [
        {
          roomId: 201,
          name: "성수 공유오피스 3층 회의실",
          location: "서울 성수",
          capacity: 8,
          available: true,
          imageUrl: "https://picsum.photos/seed/room201/480/300",
          visibility: "FOLLOWERS",
        },
      ],
    },
    followers: [
      { userId: 999, displayName: "Wookjin", avatarUrl: "https://i.pravatar.cc/80?img=5", isFollowingMe: true, iFollow: false },
      { userId: 2, displayName: "Bob", avatarUrl: "https://i.pravatar.cc/80?img=2", isFollowingMe: true, iFollow: false },
    ],
    following: [
      { userId: 2, displayName: "Bob", avatarUrl: "https://i.pravatar.cc/80?img=2", isFollowingMe: false, iFollow: true },
      { userId: 3, displayName: "Charlie", avatarUrl: "https://i.pravatar.cc/80?img=3", isFollowingMe: false, iFollow: false },
    ],
  },

  // ─────────────────────────────────────────
  // 2: Bob
  // ─────────────────────────────────────────
  2: {
    profileUserId: 2,
    profileName: "Bob",
    profileTitle: "Backend Engineer · NestJS",
    profileBio: "확장 가능한 API와 개발자 경험을 좋아합니다.",
    profileLocation: "서울 · 강남",
    profileIntro: "실무에서 바로 써먹을 수 있는 백엔드 지식을 나누고 싶어요.",
    profileTags: ["백엔드", "API", "멘토링"],
    isOwner: false,
    isFollower: false,
    sections: {
      hostedEvents: [
        {
          eventId: 21,
          title: "NestJS 백엔드 기초",
          startTime: now(),
          endTime: plusHours(2),
          location: "온라인",
          type: "GENERAL",
          imageUrl: "https://picsum.photos/seed/ev21/480/300",
          visibility: "PUBLIC",
        },
      ],
      participatingEvents: [
        {
          eventId: 1,
          title: "Flutter 워크숍 #1",
          startTime: now(),
          endTime: plusHours(2),
          location: "선릉",
          type: "WORKSHOP",
          imageUrl: "https://picsum.photos/seed/ev1/480/300",
          visibility: "PUBLIC",
        },
      ],
      roomReservations: [
        {
          roomReservationId: 210,
          room: {
            roomId: 102,
            name: "Localit Seminar B",
            location: "역삼",
            imageUrl: "https://picsum.photos/seed/room3/480/300",
            visibility: "FOLLOWERS",
          },
          startTime: now(),
          endTime: plusHours(1),
        },
      ],
      myRooms: [],
    },
    followers: [
      { userId: 1, displayName: "Alice", avatarUrl: "https://i.pravatar.cc/80?img=1", isFollowingMe: true, iFollow: false },
      { userId: 999, displayName: "Wookjin", avatarUrl: "https://i.pravatar.cc/80?img=5", isFollowingMe: true, iFollow: true },
    ],
    following: [{ userId: 1, displayName: "Alice", avatarUrl: "https://i.pravatar.cc/80?img=1", isFollowingMe: true, iFollow: true }],
  },

  // ─────────────────────────────────────────
  // 3: Dana
  // ─────────────────────────────────────────
  3: {
    profileUserId: 3,
    profileName: "Dana",
    profileTitle: "Community Manager",
    profileBio: "사람과 장소를 연결하는 일을 합니다.",
    profileLocation: "부산 · 센텀",
    profileIntro: "지역에서 의미 있는 만남이 일어나도록 공간과 프로그램을 기획해요.",
    profileTags: ["로컬", "커뮤니티", "모임"],
    isOwner: false,
    isFollower: false,
    sections: {
      hostedEvents: [],
      participatingEvents: [
        {
          eventId: 2,
          title: "멘토링 데이",
          startTime: now(),
          endTime: plusHours(1.5),
          location: "판교",
          type: "MENTORING",
          imageUrl: "https://picsum.photos/seed/ev2/480/300",
          visibility: "PUBLIC",
        },
      ],
      roomReservations: [],
      myRooms: [
        {
          roomId: 301,
          name: "부산 센텀 스터디룸",
          location: "부산 센텀",
          capacity: 12,
          available: true,
          imageUrl: "https://picsum.photos/seed/room301/480/300",
          visibility: "PUBLIC",
        },
      ],
    },
    followers: [{ userId: 999, displayName: "Wookjin", avatarUrl: "https://i.pravatar.cc/80?img=5", isFollowingMe: false, iFollow: true }],
    following: [{ userId: 1, displayName: "Alice", avatarUrl: "https://i.pravatar.cc/80?img=1", isFollowingMe: true, iFollow: false }],
  },
};
