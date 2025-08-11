// src/app/router.tsx
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layout/RootLayout";
import ProtectedRoute from "./layout/ProtectedRoute";
import { AuthProvider } from "./providers/AuthProvider"; // ✅ 추가

import HomePage from "@/pages/HomePage";
import LoginPage from "@/features/auth/pages/LoginPage";
import SignupPage from "@/features/auth/pages/SignupPage";

import EventListPage from "@/features/event/pages/EventListPage";
import EventDetailPage from "@/features/event/pages/EventDetailPage";

import MentoringListPage from "@/features/mentoring/pages/MentoringListPage";
import MentoringDetailPage from "@/features/mentoring/pages/MentoringDetailPage";

import RoomListPage from "@/features/room/pages/RoomListPage";
import RoomReservePage from "@/features/room/pages/RoomReservePage";

import MyPage from "@/features/my/pages/MyPage";

export const router = createBrowserRouter([
  {
    // ✅ Router 컨텍스트 안쪽에 AuthProvider 배치
    element: (
      <AuthProvider>
        <RootLayout />
      </AuthProvider>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "events", element: <EventListPage /> },
          { path: "events/:id", element: <EventDetailPage /> },
          { path: "mentoring", element: <MentoringListPage /> },
          { path: "mentoring/:id", element: <MentoringDetailPage /> },
          { path: "rooms", element: <RoomListPage /> },
          { path: "rooms/reserve", element: <RoomReservePage /> },
          { path: "my", element: <MyPage /> },
        ],
      },
    ],
  },
]);
