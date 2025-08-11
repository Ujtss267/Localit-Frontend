import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export default function RootLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <nav className="flex gap-4 text-sm">
            <Link to="/" className="font-semibold">
              Localit
            </Link>
            <Link to="/events">이벤트</Link>
            <Link to="/mentoring">멘토링</Link>
            <Link to="/rooms">공간</Link>
            <Link to="/my">마이페이지</Link>
          </nav>
          <div className="text-sm">
            {user ? (
              <button onClick={logout} className="px-3 py-1 rounded bg-neutral-900 text-white">
                로그아웃
              </button>
            ) : (
              <Link to="/login" className="px-3 py-1 rounded bg-blue-600 text-white">
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
