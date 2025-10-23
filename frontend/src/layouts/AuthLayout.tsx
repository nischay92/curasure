import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="auth-shell">
      <section className="auth-panel" aria-label="CuraSure overview">
        <div className="brand-mark">
          <span className="brand-icon">+</span>
          <span>CuraSure</span>
        </div>
        <div>
          <h1>Care access, coverage, and coordination in one secure portal.</h1>
          <p>
            Patients, doctors, insurers, and admins each get a focused workspace for the
            healthcare moments that matter.
          </p>
        </div>
      </section>
      <section className="auth-card">
        <Outlet />
      </section>
    </div>
  );
};
