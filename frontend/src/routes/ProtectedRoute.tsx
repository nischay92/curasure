import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = () => {
  const { firebaseUser, isLoading, profile } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="loading-screen">Loading CuraSure...</div>;
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!profile) {
    return <Navigate to="/register" replace />;
  }

  return <Outlet />;
};
