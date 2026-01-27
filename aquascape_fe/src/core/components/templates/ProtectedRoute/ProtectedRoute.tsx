import type { ReactNode } from "react";
import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  isAuth?: boolean;
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuth = true,
  children,
}) => {
  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export { ProtectedRoute };
