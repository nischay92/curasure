import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { AppRole } from "../types/auth";

interface DashboardCard {
  label: string;
  title: string;
  description: string;
  href: string;
  cta: string;
}

interface DashboardInsight {
  label: string;
  value: string;
  detail: string;
}

interface DashboardConfig {
  eyebrow: string;
  title: string;
  intro: string;
  primaryHref: string;
  primaryCta: string;
  secondaryHref: string;
  secondaryCta: string;
  cards: DashboardCard[];
  insights: DashboardInsight[];
  focus: string[];
}

const dashboardConfig: Record<AppRole, DashboardConfig> = {
  patient: {
    eyebrow: "Patient workspace",
    title: "Your care hub",
    intro: "Find care, book visits, check coverage, manage documents, and keep conversations in one place.",
    primaryHref: "/doctors",
    primaryCta: "Find a doctor",
    secondaryHref: "/appointments",
    secondaryCta: "View appointments",
    cards: [
      {
        label: "Care access",
        title: "Find nearby doctors",
        description: "Search by specialty, insurance, location, visit mode, and open appointment slots.",
        href: "/doctors",
        cta: "Search doctors"
      },
      {
        label: "Visits",
        title: "Appointments",
        description: "Review booked visits and open telehealth when an appointment supports it.",
        href: "/appointments",
        cta: "Open schedule"
      },
      {
        label: "Coverage",
        title: "Insurance check",
        description: "Check a doctor, service, specialty, and plan against insurer coverage rules.",
        href: "/coverage",
        cta: "Check coverage"
      },
      {
        label: "Records",
        title: "Documents",
        description: "Upload medical documents and insurance cards with owner-only access.",
        href: "/documents",
        cta: "Manage documents"
      },
      {
        label: "Messages",
        title: "Secure chat",
        description: "Continue conversations with doctors after a valid care relationship exists.",
        href: "/chat",
        cta: "Open messages"
      },
      {
        label: "Guidance",
        title: "Symptom assistant",
        description: "Get specialty routing help with a clear safety disclaimer, not a diagnosis.",
        href: "/symptoms",
        cta: "Start guidance"
      }
    ],
    insights: [
      { label: "Booking", value: "Open slots only", detail: "Patients cannot take an already booked doctor slot." },
      { label: "Maps", value: "OSM", detail: "Doctor markers appear when profiles include coordinates." },
      { label: "Privacy", value: "Protected", detail: "Documents and chats use ownership checks." }
    ],
    focus: [
      "Start with doctor search when you need a new visit.",
      "Use coverage checks before booking when insurance rules matter.",
      "Keep insurance cards and medical files in documents for quick access."
    ]
  },
  doctor: {
    eyebrow: "Doctor workspace",
    title: "Manage your clinic day",
    intro: "Keep your profile current, open hourly availability, review booked visits, and message patients.",
    primaryHref: "/appointments",
    primaryCta: "Open schedule",
    secondaryHref: "/doctor/onboarding",
    secondaryCta: "Update profile",
    cards: [
      {
        label: "Profile",
        title: "Doctor onboarding",
        description: "Maintain specialty, clinic, location, insurance, and verification details.",
        href: "/doctor/onboarding",
        cta: "Edit profile"
      },
      {
        label: "Availability",
        title: "Hourly slots",
        description: "Open appointment slots patients can select, with booked slots protected from reuse.",
        href: "/appointments",
        cta: "Manage slots"
      },
      {
        label: "Visits",
        title: "Appointments",
        description: "Review patient bookings and upcoming visit details in your appointment workspace.",
        href: "/appointments",
        cta: "View visits"
      },
      {
        label: "Messages",
        title: "Patient chat",
        description: "Reply inside secure conversations limited to the correct participants.",
        href: "/chat",
        cta: "Open messages"
      },
      {
        label: "Virtual care",
        title: "Telehealth",
        description: "Launch the Jitsi room for appointments where you are the assigned doctor.",
        href: "/telehealth",
        cta: "Open telehealth"
      }
    ],
    insights: [
      { label: "Schedule", value: "Hourly", detail: "Availability is opened by the doctor, not auto-generated." },
      { label: "Verification", value: "Admin reviewed", detail: "Admin approval controls public trust signals." },
      { label: "Access", value: "Participant only", detail: "Appointments and chat enforce user checks." }
    ],
    focus: [
      "Open appointment slots before patients can book you.",
      "Keep your profile location and accepted insurance up to date.",
      "Use messages and telehealth from the same appointment workflow."
    ]
  },
  insurance_provider: {
    eyebrow: "Insurance workspace",
    title: "Manage plans and coverage",
    intro: "Maintain provider details, plan catalogs, and the rules patients use during coverage checks.",
    primaryHref: "/insurance/provider",
    primaryCta: "Open provider portal",
    secondaryHref: "/dashboard/insurance",
    secondaryCta: "Review workspace",
    cards: [
      {
        label: "Provider",
        title: "Organization profile",
        description: "Keep company, payer, support, and verification information current.",
        href: "/insurance/provider",
        cta: "Edit profile"
      },
      {
        label: "Plans",
        title: "Plan catalog",
        description: "Create and maintain HMO, PPO, EPO, POS, and custom plan options.",
        href: "/insurance/provider",
        cta: "Manage plans"
      },
      {
        label: "Rules",
        title: "Coverage logic",
        description: "Define covered, not covered, and prior authorization rules by service.",
        href: "/insurance/provider",
        cta: "Manage rules"
      },
      {
        label: "Patient checks",
        title: "Coverage results",
        description: "Rules power the patient-facing checker and explain coverage outcomes clearly.",
        href: "/insurance/provider",
        cta: "Review setup"
      }
    ],
    insights: [
      { label: "Plans", value: "Rule-backed", detail: "Coverage answers come from provider-managed rules." },
      { label: "Verification", value: "Admin reviewed", detail: "Provider trust status is controlled by admins." },
      { label: "Patients", value: "Clear results", detail: "Coverage checks explain the rule outcome." }
    ],
    focus: [
      "Create plans first, then attach coverage rules.",
      "Keep support details accurate for patients reviewing coverage.",
      "Use prior authorization rules where a service needs manual approval."
    ]
  },
  admin: {
    eyebrow: "Admin workspace",
    title: "Operate the platform",
    intro: "Review users, verify doctors and providers, and inspect audit trails from the admin console.",
    primaryHref: "/admin",
    primaryCta: "Open admin console",
    secondaryHref: "/dashboard/admin",
    secondaryCta: "Review summary",
    cards: [
      {
        label: "Users",
        title: "User directory",
        description: "Review registered accounts, roles, and active status across the platform.",
        href: "/admin",
        cta: "Review users"
      },
      {
        label: "Doctors",
        title: "Doctor verification",
        description: "Approve or reject submitted doctor profiles after review.",
        href: "/admin",
        cta: "Verify doctors"
      },
      {
        label: "Providers",
        title: "Provider verification",
        description: "Approve or reject insurance organizations before they become trusted.",
        href: "/admin",
        cta: "Verify providers"
      },
      {
        label: "Audit",
        title: "Audit logs",
        description: "Inspect recent administrative actions and verification changes.",
        href: "/admin",
        cta: "View logs"
      }
    ],
    insights: [
      { label: "Control", value: "Role-based", detail: "Admin routes are protected by backend role checks." },
      { label: "Approvals", value: "Tracked", detail: "Verification changes create audit entries." },
      { label: "Scope", value: "Platform", detail: "Admins see users, doctors, providers, and logs." }
    ],
    focus: [
      "Review pending doctor profiles before they are trusted by patients.",
      "Verify insurance providers before coverage rules are relied on.",
      "Use audit logs to trace administrative changes."
    ]
  }
};

export const DashboardPage = () => {
  const { profile } = useAuth();
  const content = dashboardConfig[profile?.role ?? "patient"];
  const displayName = profile?.displayName || profile?.email || "CuraSure user";

  return (
    <>
      <section className="workspace-hero">
        <div className="hero-copy">
          <span className="eyebrow">{content.eyebrow}</span>
          <h1>{content.title}</h1>
          <p>{content.intro}</p>
          <div className="hero-actions">
            <Link className="primary-link-button" to={content.primaryHref}>{content.primaryCta}</Link>
            <Link className="secondary-link-button" to={content.secondaryHref}>{content.secondaryCta}</Link>
          </div>
        </div>
        <aside className="hero-account" aria-label="Signed in account">
          <span>Signed in as</span>
          <strong>{displayName}</strong>
          <p>{profile?.role.replace("_", " ")}</p>
        </aside>
      </section>

      <section className="insight-strip" aria-label="Workspace summary">
        {content.insights.map((insight) => (
          <div className="insight-card" key={insight.label}>
            <span>{insight.label}</span>
            <strong>{insight.value}</strong>
            <p>{insight.detail}</p>
          </div>
        ))}
      </section>

      <section className="section-heading">
        <div>
          <span className="eyebrow">Quick access</span>
          <h2>Choose what you want to do next</h2>
        </div>
      </section>

      <section className="quick-card-grid" aria-label="Role quick access">
        {content.cards.map((card) => (
          <Link className="quick-card" key={card.title} to={card.href}>
            <span>{card.label}</span>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <strong>{card.cta}</strong>
          </Link>
        ))}
      </section>

      <section className="next-panel" aria-label="Recommended next steps">
        <div>
          <span className="eyebrow">Today</span>
          <h2>Recommended focus</h2>
        </div>
        <ul>
          {content.focus.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </>
  );
};
