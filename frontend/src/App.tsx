import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AuthLayout } from "./layouts/AuthLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DoctorOnboardingPage } from "./pages/DoctorOnboardingPage";
import { DoctorSearchPage } from "./pages/DoctorSearchPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardRedirect } from "./routes/DashboardRedirect";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleRoute } from "./routes/RoleRoute";

export const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard/patient" element={<DashboardPage />} />
            <Route path="/dashboard/doctor" element={<DashboardPage />} />
            <Route path="/dashboard/insurance" element={<DashboardPage />} />
            <Route path="/dashboard/admin" element={<DashboardPage />} />
            <Route element={<RoleRoute allowedRoles={["patient", "doctor"]} />}>
              <Route path="/appointments" element={<AppointmentsPage />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={["patient"]} />}>
              <Route path="/doctors" element={<DoctorSearchPage />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={["doctor"]} />}>
              <Route path="/doctor/onboarding" element={<DoctorOnboardingPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
};
