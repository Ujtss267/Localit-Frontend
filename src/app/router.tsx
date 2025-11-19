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

import RoomListPage from "@/features/room/pages/RoomListPage";
import RoomReservePage from "@/features/room/pages/RoomReservePage";

import MyPage from "@/features/my/pages/MyPage";
import StyleDemo from "@/pages/StyleDemo";
import MobileFirstDemo from "@/pages/MobileFirstDemo";
import PhoneVerifyPage from "@/features/auth/pages/PhoneVerifyPage";
import EventCreatePage from "@/features/event/pages/EventCreatePage";
import RoomCreatePage from "@/features/room/pages/RoomCreatePage";
import SubscriptionPage from "@/features/subscription/pages/SubscriptionPage";
import EventEditPage from "@/features/event/pages/EventEditPage";
import EventManagePage from "@/features/event/pages/EventManagePage";
import ChatListPage from "@/features/chat/pages/ChatListPage";
import EventChatPage from "@/features/chat/pages/EventChatPage";

import { ChatProvider } from "./providers/ChatProvider";
import EventTicketPage from "@/features/ticket/pages/EventTicketPage";

// (옵션) 로그인 상태라면 / 로 돌려보내는 공개 전용 라우트
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : <>{children}</>;
}

export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <ChatProvider>
          <RootLayout />
        </ChatProvider>
      </AuthProvider>
    ),
    children: [
      // ✅ 공개 경로
      { index: true, element: <HomePage /> },
      { path: "events", element: <EventListPage /> },
      { path: "events/:id", element: <EventDetailPage /> },
      { path: "events/new", element: <EventCreatePage /> },
      { path: "events/:id/edit", element: <EventEditPage /> },
      { path: "rooms", element: <RoomListPage /> },
      { path: "rooms/new", element: <RoomCreatePage /> },
      { path: "auth/phone-verify", element: <PhoneVerifyPage /> },
      { path: "m-demo", element: <MobileFirstDemo /> },
      { path: "my", element: <MyPage /> },
      { path: "my/:userId", element: <MyPage /> },
      { path: "subscription", element: <SubscriptionPage /> },
      { path: "events/:eventId/manage", element: <EventManagePage /> },
      { path: "chat", element: <ChatListPage /> },
      { path: "chat/events/:eventId", element: <EventChatPage /> },
      { path: "ticket/events/:eventId", element: <EventTicketPage /> },
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
        ],
      },
    ],
  },
]);
