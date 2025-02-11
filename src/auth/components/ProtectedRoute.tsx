// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../utils/useAuth";

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>로딩 중...</div>;

  if (!user || user.role !== "ROLE_ADMIN") {
    alert("접근 권한이 없습니다.");
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
