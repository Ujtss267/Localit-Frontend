import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import ChatIcon from "@mui/icons-material/Chat";

export function TabPageTemplate() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-3 py-5 sm:px-4 sm:py-6 pb-28 sm:pb-6">
        <Outlet />
      </section>
      <BottomTab />
    </>
  );
}

export function BackNavPageTemplate() {
  const navigate = useNavigate();

  const onBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/events", { replace: true });
  };

  return (
    <>
      <div className="sm:hidden sticky top-14 z-20 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex min-h-12 max-w-6xl items-center px-3 py-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-11 items-center gap-1 rounded-lg px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
            aria-label="뒤로가기"
          >
            <span aria-hidden>←</span>
            <span>뒤로가기</span>
          </button>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
        <Outlet />
      </section>
    </>
  );
}

export function PlainPageTemplate() {
  return (
    <section className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-6">
      <Outlet />
    </section>
  );
}

function BottomTab() {
  const style = {
    paddingBottom: "max(8px, env(safe-area-inset-bottom))",
  } as React.CSSProperties;

  const itemBase = "flex flex-col items-center justify-center gap-1 min-h-14 flex-1 text-xs text-neutral-400";
  const icon = "w-[22px] h-[22px]";

  return (
    <nav
      aria-label="모바일 하단 내비게이션"
      style={style}
      className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-neutral-950/90 backdrop-blur border-t border-neutral-800"
    >
      <div className="flex">
        <NavLink to="/events" className={({ isActive }) => `${itemBase} ${isActive ? "text-white" : ""}`}>
          <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 2v4M16 2v4M3 10h18M5 8h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z" />
          </svg>
          <span>이벤트</span>
        </NavLink>

        <NavLink to="/rooms" className={({ isActive }) => `${itemBase} ${isActive ? "text-white" : ""}`}>
          <MeetingRoomOutlinedIcon className={icon} />
          <span>공간</span>
        </NavLink>

        <NavLink to="/my" className={({ isActive }) => `${itemBase} ${isActive ? "text-white" : ""}`}>
          <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 7l-8-4-8 4 8 4 8-4z" />
            <path d="M4 11l8 4 8-4" />
            <path d="M4 15l8 4 8-4" />
          </svg>
          <span>마이</span>
        </NavLink>

        <NavLink to="/chat" className={({ isActive }) => `${itemBase} ${isActive ? "text-white" : ""}`}>
          <ChatIcon className={icon} />
          <span>채팅</span>
        </NavLink>

        <NavLink to="/subscription" className={({ isActive }) => `${itemBase} ${isActive ? "text-white" : ""}`}>
          <AccountBalanceWalletIcon className={icon} />
          <span>구독</span>
        </NavLink>
      </div>
    </nav>
  );
}
