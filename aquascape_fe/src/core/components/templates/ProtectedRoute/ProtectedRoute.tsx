import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  isAuth?: boolean;
}

const ProtectedRoute = ({ isAuth = true }: ProtectedRouteProps) => {
  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export { ProtectedRoute };
