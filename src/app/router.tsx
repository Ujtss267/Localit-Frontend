// src/app/router.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "./layout/RootLayout";
import ProtectedRoute from "./layout/ProtectedRoute";
import { AuthProvider, useAuth } from "./providers/AuthProvider";

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
import StyleDemo from "@/pages/StyleDemo";
import MobileFirstDemo from "@/pages/MobileFirstDemo";
import PhoneVerifyPage from "@/features/auth/pages/PhoneVerifyPage";

// (옵션) 로그인 상태라면 / 로 돌려보내는 공개 전용 라우트
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : <>{children}</>;
}

export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <RootLayout />
      </AuthProvider>
    ),
    children: [
      // ✅ 공개 경로
      { index: true, element: <HomePage /> },
      { path: "events", element: <EventListPage /> },
      { path: "events/:id", element: <EventDetailPage /> },
      { path: "mentoring", element: <MentoringListPage /> },
      { path: "mentoring/:id", element: <MentoringDetailPage /> },
      { path: "rooms", element: <RoomListPage /> },
      { path: "auth/phone-verify", element: <PhoneVerifyPage /> },
      { path: "m-demo", element: <MobileFirstDemo /> },
      // ✅ 로그인/회원가입 (원하면 PublicOnlyRoute로 보호)
      {
        path: "login",
        element: (
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: "signup",
        element: (
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        ),
      },

      // 🔐 보호 경로
      {
        element: <ProtectedRoute />,
        children: [
          // 데모는 유지하고 싶으면 여기 두세요(또는 공개로 빼도 됨)
          { path: "style-demo", element: <StyleDemo /> },

          { path: "rooms/reserve", element: <RoomReservePage /> },
          { path: "my", element: <MyPage /> },
        ],
      },
    ],
  },
]);
