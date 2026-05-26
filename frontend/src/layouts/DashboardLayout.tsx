import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { AppRole } from "../types/auth";

const navItems: Record<AppRole, Array<{ label: string; href: string }>> = {
  patient: [
    { label: "Home", href: "/dashboard/patient" },
    { label: "Doctors", href: "/doctors" },
    { label: "Appointments", href: "/appointments" },
    { label: "Messages", href: "/chat" },
    { label: "Coverage", href: "/coverage" },
    { label: "Documents", href: "/documents" }
  ],
  doctor: [
    { label: "Home", href: "/dashboard/doctor" },
    { label: "Profile", href: "/doctor/onboarding" },
    { label: "Schedule", href: "/appointments" },
    { label: "Messages", href: "/chat" },
    { label: "Telehealth", href: "/telehealth" }
  ],
  insurance_provider: [
    { label: "Home", href: "/dashboard/insurance" },
    { label: "Provider portal", href: "/insurance/provider" }
  ],
  admin: [
    { label: "Home", href: "/dashboard/admin" },
    { label: "Admin console", href: "/admin" }
  ]
};

export const DashboardLayout = () => {
  const { logoutUser, profile } = useAuth();
  const role = profile?.role ?? "patient";
  const roleLabel = role.replace("_", " ");

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-mark">
            <span className="brand-icon">+</span>
            <span>CuraSure</span>
          </div>
          <span className="role-chip">{roleLabel}</span>
        </div>
        <nav className="app-nav" aria-label="Primary navigation">
          {navItems[role].map((item) => (
            <NavLink
              className={({ isActive }) => (isActive ? "app-nav-link active" : "app-nav-link")}
              key={item.href}
              to={item.href}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="topbar-account">
          <span>{profile?.email}</span>
          <button className="secondary-button compact-button" type="button" onClick={logoutUser}>
            Sign out
          </button>
        </div>
      </header>
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
};
