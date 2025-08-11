import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
