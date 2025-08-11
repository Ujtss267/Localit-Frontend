import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, login as loginApi } from "@/features/auth/api";
import { clearToken, getToken, setToken } from "@/lib/storage";

type User = { id: number; email: string /* 필요시 확장 */ };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 부팅 시 토큰 검증
  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (getToken()) {
          const me = await getMe();
          setUser(me);
        }
      } catch {
        clearToken();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    const { access_token } = await loginApi({ email, password });
    setToken(access_token);
    const me = await getMe();
    setUser(me);
    navigate("/events");
  };

  const logout = () => {
    clearToken();
    setUser(null);
    navigate("/login");
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
