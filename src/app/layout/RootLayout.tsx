import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import Button from "@/components/ui/Button";
import { useAuth } from "../providers/AuthProvider";

export default function RootLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[100svh] flex flex-col bg-background text-foreground">
      <TopNav user={user} onLogout={logout} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

/* ───────────────────── Top (Desktop-first) ───────────────────── */

type TopNavProps = { user: unknown; onLogout: () => void };

function TopNav({ user, onLogout }: TopNavProps) {
  return (
    <div className="sticky top-0 z-30 backdrop-blur bg-neutral-950/80 border-b border-neutral-800">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-5 text-[15px]">
          <Link to="/events" className="font-semibold tracking-tight text-white">
            Localit
          </Link>

          {/* 데스크탑에서만 보이는 상단 네비 */}
          <nav className="hidden sm:flex items-center gap-4 text-neutral-300">
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
      className={({ isActive }) =>
        ["text-sm transition-colors duration-150", isActive ? "text-white font-semibold" : "text-neutral-300 hover:text-neutral-100"].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}
