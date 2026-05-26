import { api } from "./api";

export const fetchAdminOverview = async () => {
  const [users, doctors, providers, auditLogs] = await Promise.all([
    api.get("/admin/users"),
    api.get("/admin/doctors"),
    api.get("/admin/insurance-providers"),
    api.get("/admin/audit-logs")
  ]);
  return {
    users: users.data.users,
    doctors: doctors.data.doctors,
    providers: providers.data.providers,
    auditLogs: auditLogs.data.auditLogs
  };
};

export const updateDoctorVerification = async (doctorId: string, status: string) => {
  const response = await api.patch(`/admin/doctors/${doctorId}/verification`, { status });
  return response.data.doctor;
};

export const updateProviderVerification = async (providerId: string, status: string) => {
  const response = await api.patch(`/admin/insurance-providers/${providerId}/verification`, { status });
  return response.data.provider;
};
