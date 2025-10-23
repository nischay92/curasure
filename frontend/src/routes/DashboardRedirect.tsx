import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const DashboardRedirect = () => {
  const { profile } = useAuth();

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  const dashboardByRole = {
    patient: "/dashboard/patient",
    doctor: "/dashboard/doctor",
    insurance_provider: "/dashboard/insurance",
    admin: "/dashboard/admin"
  };

  return <Navigate to={dashboardByRole[profile.role]} replace />;
};
