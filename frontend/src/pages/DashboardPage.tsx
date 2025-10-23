import { useAuth } from "../context/AuthContext";
import type { AppRole } from "../types/auth";

const dashboardContent: Record<
  AppRole,
  {
    title: string;
    intro: string;
    cards: Array<{ title: string; body: string }>;
  }
> = {
  patient: {
    title: "Patient dashboard",
    intro: "Find care, prepare visits, and keep your coverage details close.",
    cards: [
      { title: "Find doctors", body: "Search and filters arrive in Milestone 9." },
      { title: "Appointments", body: "Booking arrives in Milestone 11." },
      { title: "Documents", body: "Medical upload arrives in Milestone 18." }
    ]
  },
  doctor: {
    title: "Doctor dashboard",
    intro: "Manage your profile, availability, and patient conversations.",
    cards: [
      { title: "Profile", body: "Doctor onboarding arrives in Milestone 8." },
      { title: "Availability", body: "Scheduling arrives in Milestone 11." },
      { title: "Messages", body: "Secure chat arrives in Milestone 13." }
    ]
  },
  insurance_provider: {
    title: "Insurance provider dashboard",
    intro: "Prepare plan, rule, and claim workflows for coverage decisions.",
    cards: [
      { title: "Plans", body: "Plan management arrives in Milestone 14." },
      { title: "Rules", body: "Coverage rules arrive in Milestone 14." },
      { title: "Claims", body: "Claims workflows arrive in Milestone 14." }
    ]
  },
  admin: {
    title: "Admin dashboard",
    intro: "Review verification queues and platform audit trails.",
    cards: [
      { title: "Doctor verification", body: "Admin verification arrives in Milestone 19." },
      { title: "Provider verification", body: "Provider approvals arrive in Milestone 19." },
      { title: "Audit logs", body: "Audit visibility arrives in Milestone 19." }
    ]
  }
};

export const DashboardPage = () => {
  const { profile } = useAuth();
  const content = dashboardContent[profile?.role ?? "patient"];

  return (
    <>
      <h1>{content.title}</h1>
      <p>{content.intro}</p>
      <section className="dashboard-grid" aria-label="Dashboard actions">
        {content.cards.map((card) => (
          <article className="dashboard-card" key={card.title}>
            <h2>{card.title}</h2>
            <p>{card.body}</p>
          </article>
        ))}
      </section>
    </>
  );
};
