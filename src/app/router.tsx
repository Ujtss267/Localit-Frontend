// src/app/router.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "./layout/RootLayout";
import ProtectedRoute from "./layout/ProtectedRoute";
import { AuthProvider, useAuth } from "./providers/AuthProvider";
import { BackNavPageTemplate, PlainPageTemplate, TabPageTemplate } from "./layout/PageTemplates";

import LoginPage from "@/features/auth/pages/LoginPage";
import SignupPage from "@/features/auth/pages/SignupPage";

import EventListPage from "@/features/event/pages/EventListPage";
import EventDetailPage from "@/features/event/pages/EventDetailPage";

import RoomListPage from "@/features/room/pages/RoomListPage";
import RoomReservePage from "@/features/room/pages/RoomReservePage";

import MyPage from "@/features/my/pages/MyPage";
import AccountSettingsPage from "@/features/my/pages/AccountSettingsPage";
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
      { index: true, element: <Navigate to="/events" replace /> },
      {
        element: <TabPageTemplate />,
        children: [
          { path: "events", element: <EventListPage /> },
          { path: "rooms", element: <RoomListPage /> },
          { path: "my", element: <MyPage /> },
          { path: "my/:userId", element: <MyPage /> },
          { path: "chat", element: <ChatListPage /> },
          { path: "subscription", element: <SubscriptionPage /> },
        ],
      },
      {
        element: <BackNavPageTemplate />,
        children: [
          { path: "events/:id", element: <EventDetailPage /> },
          { path: "events/new", element: <EventCreatePage /> },
          { path: "events/:id/edit", element: <EventEditPage /> },
          { path: "events/:eventId/manage", element: <EventManagePage /> },
          { path: "rooms/new", element: <RoomCreatePage /> },
          { path: "chat/events/:eventId", element: <EventChatPage /> },
          { path: "ticket/events/:eventId", element: <EventTicketPage /> },
          { path: "m-demo", element: <MobileFirstDemo /> },
          { path: "rooms/reserve", element: <RoomReservePage /> },
          { path: "settings/account", element: <AccountSettingsPage /> },
          {
            element: <ProtectedRoute />,
            children: [{ path: "style-demo", element: <StyleDemo /> }],
          },
        ],
      },
      {
        element: <PlainPageTemplate />,
        children: [
          { path: "auth/phone-verify", element: <PhoneVerifyPage /> },
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
        ],
      },
    ],
  },
]);
