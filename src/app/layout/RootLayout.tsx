// src/layouts/RootLayout.tsx
import { Link, NavLink, Outlet } from "react-router-dom";
import Button from "@/components/ui/Button";
import { useAuth } from "../providers/AuthProvider";
import React from "react";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import ChatIcon from "@mui/icons-material/Chat";

export default function RootLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[100svh] flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <TopNav user={user} onLogout={logout} />

      <main className="flex-1 pb-20 sm:pb-0">
        {/* 모바일 하단탭 높이만큼 여백 확보: pb-20 */}
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
          <Outlet />
        </div>
      </main>

      <BottomTab />
    </div>
  );
}

/* ───────────────────── Top (Desktop-first) ───────────────────── */
type TopNavProps = { user: unknown; onLogout: () => void };

function TopNav({ user, onLogout }: TopNavProps) {
  return (
    <div className="sticky top-0 z-30 backdrop-blur bg-white/75 dark:bg-neutral-950/60 border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-5 text-[15px]">
          <Link to="/events" className="font-semibold tracking-tight">
            Localit
          </Link>

          {/* 데스크탑에서만 보이는 상단 네비 */}
          <nav className="hidden sm:flex items-center gap-4 text-neutral-600 dark:text-neutral-300">
            <TopLink to="/events">이벤트</TopLink>
            <TopLink to="/rooms">공간</TopLink>
            <TopLink to="/my">마이</TopLink>
            <TopLink to="/chat">체팅</TopLink>
            <TopLink to="/subscription">구독</TopLink>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden sm:inline-flex">
            도움말
          </Button>

          {user ? (
            <Button size="sm" onClick={onLogout}>
              로그아웃
            </Button>
          ) : (
            <Link to="/login">
              <Button size="sm">로그인</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function TopLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `hover:text-neutral-900 dark:hover:text-white ${isActive ? "text-neutral-900 dark:text-white font-medium" : ""}`}
    >
      {children}
    </NavLink>
  );
}

/* ───────────────────── Bottom (Mobile-only) ───────────────────── */
function BottomTab() {
  const style = { paddingBottom: "max(8px, env(safe-area-inset-bottom))" } as React.CSSProperties;
  const item = "flex flex-col items-center justify-center gap-1 h-12 flex-1 text-[11px] text-neutral-600 dark:text-neutral-300";
  const icon = "w-5 h-5";

  return (
    <nav
      aria-label="모바일 하단 내비게이션"
      style={style}
      className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-neutral-950/80 backdrop-blur border-t border-neutral-200 dark:border-neutral-800"
    >
      <div className="flex">
        {/* <NavLink to="/" className={({ isActive }) => `${item} ${isActive ? "text-neutral-900 dark:text-white" : ""}`}>
          <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <path d="M9 22V12h6v10" />
          </svg>
          <span>홈</span>
        </NavLink> */}

        <NavLink to="/events" className={({ isActive }) => `${item} ${isActive ? "text-neutral-900 dark:text-white" : ""}`}>
          <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 2v4M16 2v4M3 10h18M5 8h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z" />
          </svg>
          <span>이벤트</span>
        </NavLink>

        <NavLink to="/rooms" className={({ isActive }) => `${item} ${isActive ? "text-neutral-900 dark:text-white" : ""}`}>
          <MeetingRoomOutlinedIcon className={`${icon}`} />
          <span>공간</span>
        </NavLink>

        <NavLink to="/my" className={({ isActive }) => `${item} ${isActive ? "text-neutral-900 dark:text-white" : ""}`}>
          <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 7l-8-4-8 4 8 4 8-4z" />
            <path d="M4 11l8 4 8-4" />
            <path d="M4 15l8 4 8-4" />
          </svg>
          <span>마이</span>
        </NavLink>

        <NavLink to="/chat" className={({ isActive }) => `${item} ${isActive ? "text-neutral-900 dark:text-white" : ""}`}>
          <ChatIcon className={`${icon}`} />
          <span>체팅</span>
        </NavLink>

        <NavLink to="/subscription" className={({ isActive }) => `${item} ${isActive ? "text-neutral-900 dark:text-white" : ""}`}>
          <AccountBalanceWalletIcon className={`${icon}`} />
          <span>구독</span>
        </NavLink>
      </div>
    </nav>
  );
}
