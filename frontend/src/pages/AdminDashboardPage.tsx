import { useEffect, useState } from "react";
import { fetchAdminOverview, updateDoctorVerification, updateProviderVerification } from "../services/admin";

export const AdminDashboardPage = () => {
  const [data, setData] = useState<any>({ users: [], doctors: [], providers: [], auditLogs: [] });
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setData(await fetchAdminOverview());
  };

  useEffect(() => {
    load().catch(() => setError("Unable to load admin dashboard."));
  }, []);

  const verifyDoctor = async (id: string, status: string) => {
    await updateDoctorVerification(id, status);
    await load();
  };

  const verifyProvider = async (id: string, status: string) => {
    await updateProviderVerification(id, status);
    await load();
  };

  return (
    <>
      <section className="dashboard-header">
        <div>
          <span className="eyebrow">Admin operations</span>
          <h1>Admin dashboard</h1>
          <p>Verify doctors and insurance providers, review users, and inspect audit logs.</p>
        </div>
      </section>
      {error && <div className="alert">{error}</div>}
      <section className="metric-strip" aria-label="Admin metrics">
        <div className="metric-tile"><span>Users</span><strong>{data.users.length}</strong><p>Registered accounts</p></div>
        <div className="metric-tile"><span>Doctors</span><strong>{data.doctors.length}</strong><p>Submitted profiles</p></div>
        <div className="metric-tile"><span>Providers</span><strong>{data.providers.length}</strong><p>Insurance organizations</p></div>
        <div className="metric-tile"><span>Audit logs</span><strong>{data.auditLogs.length}</strong><p>Recent admin events</p></div>
      </section>

      <section className="data-panel">
        <div className="panel-heading"><h2>Doctor verification</h2></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Clinic</th><th>Specialty</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {data.doctors.map((doctor: any) => (
                <tr key={doctor._id}>
                  <td>{doctor.clinicName}</td>
                  <td>{doctor.specialty}</td>
                  <td><span className="table-status">{doctor.verificationStatus}</span></td>
                  <td className="table-actions">
                    <button className="text-button" type="button" onClick={() => verifyDoctor(doctor._id, "verified")}>Verify</button>
                    <button className="text-button danger" type="button" onClick={() => verifyDoctor(doctor._id, "rejected")}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="data-panel stacked-panel">
        <div className="panel-heading"><h2>Insurance provider verification</h2></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Company</th><th>Support email</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {data.providers.map((provider: any) => (
                <tr key={provider._id}>
                  <td>{provider.companyName}</td>
                  <td>{provider.supportEmail}</td>
                  <td><span className="table-status">{provider.verificationStatus}</span></td>
                  <td className="table-actions">
                    <button className="text-button" type="button" onClick={() => verifyProvider(provider._id, "verified")}>Verify</button>
                    <button className="text-button danger" type="button" onClick={() => verifyProvider(provider._id, "rejected")}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-split">
        <div className="data-panel">
          <div className="panel-heading"><h2>Users</h2></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Email</th><th>Role</th><th>Active</th></tr></thead>
              <tbody>{data.users.map((user: any) => <tr key={user._id}><td>{user.email}</td><td>{user.role}</td><td>{String(user.isActive)}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
        <div className="data-panel">
          <div className="panel-heading"><h2>Audit logs</h2></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Action</th><th>When</th></tr></thead>
              <tbody>{data.auditLogs.map((log: any) => <tr key={log._id}><td>{log.action}</td><td>{new Date(log.createdAt).toLocaleString()}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
};
