import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const DashboardLayout = () => {
  const { logoutUser, profile } = useAuth();

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div className="brand-mark">
          <span className="brand-icon">+</span>
          <span>CuraSure</span>
        </div>
        <button className="secondary-button" type="button" onClick={logoutUser}>
          Sign out
        </button>
      </header>
      <main className="dashboard-main">
        <p>{profile?.email}</p>
        <Outlet />
      </main>
    </div>
  );
};
