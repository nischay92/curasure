import { FormEvent, useEffect, useState } from "react";
import {
  createCoverageRule,
  createProviderPlan,
  fetchCoverageRules,
  fetchProviderPlans,
  fetchProviderProfile,
  saveProviderProfile
} from "../services/insurance";
import type { CoverageRule, InsurancePlan, InsuranceProviderProfile } from "../types/insurance";

const emptyProfile = {
  companyName: "",
  payerId: "",
  supportPhone: "",
  supportEmail: "",
  website: ""
};

export const InsuranceProviderDashboardPage = () => {
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [profile, setProfile] = useState<InsuranceProviderProfile | null>(null);
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [rules, setRules] = useState<CoverageRule[]>([]);
  const [planForm, setPlanForm] = useState({ name: "", planType: "ppo" as InsurancePlan["planType"], memberServicesPhone: "" });
  const [ruleForm, setRuleForm] = useState({
    planId: "",
    specialty: "",
    service: "",
    coverageStatus: "covered" as CoverageRule["coverageStatus"],
    copayAmount: "",
    coinsurancePercent: "",
    notes: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadProviderData = async () => {
    const [nextProfile, nextPlans, nextRules] = await Promise.all([
      fetchProviderProfile(),
      fetchProviderPlans().catch(() => []),
      fetchCoverageRules().catch(() => [])
    ]);
    setProfile(nextProfile);
    setPlans(nextPlans);
    setRules(nextRules);

    if (nextProfile) {
      setProfileForm({
        companyName: nextProfile.companyName,
        payerId: nextProfile.payerId ?? "",
        supportPhone: nextProfile.supportPhone,
        supportEmail: nextProfile.supportEmail,
        website: nextProfile.website ?? ""
      });
    }
  };

  useEffect(() => {
    loadProviderData().catch(() => setError("Unable to load insurance portal data."));
  }, []);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const saved = await saveProviderProfile(profileForm);
      setProfile(saved);
      setSuccess("Provider profile saved for verification.");
    } catch {
      setError("Unable to save provider profile.");
    }
  };

  const handlePlanSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const plan = await createProviderPlan(planForm);
      setPlans((current) => [...current, plan]);
      setPlanForm({ name: "", planType: "ppo", memberServicesPhone: "" });
      setRuleForm((current) => ({ ...current, planId: current.planId || plan.id }));
      setSuccess("Plan created.");
    } catch {
      setError("Unable to create plan. Save provider profile first.");
    }
  };

  const handleRuleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const rule = await createCoverageRule({
        ...ruleForm,
        copayAmount: ruleForm.copayAmount ? Number(ruleForm.copayAmount) : undefined,
        coinsurancePercent: ruleForm.coinsurancePercent ? Number(ruleForm.coinsurancePercent) : undefined
      });
      setRules((current) => [...current.filter((item) => item.id !== rule.id), rule]);
      setRuleForm({
        planId: ruleForm.planId,
        specialty: "",
        service: "",
        coverageStatus: "covered",
        copayAmount: "",
        coinsurancePercent: "",
        notes: ""
      });
      setSuccess("Coverage rule saved.");
    } catch {
      setError("Unable to save coverage rule.");
    }
  };

  return (
    <>
      <h1>Insurance provider portal</h1>
      <p>Manage provider profile, plans, and coverage rules for patient benefit checks.</p>
      {error && <div className="alert">{error}</div>}
      {success && <div className="notice">{success}</div>}
      {profile && <div className="notice">Verification status: {profile.verificationStatus}</div>}
      <section className="portal-grid">
        <form className="portal-panel" onSubmit={handleProfileSubmit}>
          <h2>Provider profile</h2>
          <div className="field">
            <label htmlFor="companyName">Company name</label>
            <input id="companyName" required value={profileForm.companyName} onChange={(event) => setProfileForm({ ...profileForm, companyName: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="payerId">Payer ID</label>
            <input id="payerId" value={profileForm.payerId} onChange={(event) => setProfileForm({ ...profileForm, payerId: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="supportPhone">Support phone</label>
            <input id="supportPhone" required value={profileForm.supportPhone} onChange={(event) => setProfileForm({ ...profileForm, supportPhone: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="supportEmail">Support email</label>
            <input id="supportEmail" required type="email" value={profileForm.supportEmail} onChange={(event) => setProfileForm({ ...profileForm, supportEmail: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="website">Website</label>
            <input id="website" value={profileForm.website} onChange={(event) => setProfileForm({ ...profileForm, website: event.target.value })} />
          </div>
          <button className="primary-button" type="submit">Save profile</button>
        </form>
        <form className="portal-panel" onSubmit={handlePlanSubmit}>
          <h2>Plans</h2>
          <div className="field">
            <label htmlFor="planName">Plan name</label>
            <input id="planName" required value={planForm.name} onChange={(event) => setPlanForm({ ...planForm, name: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="planType">Plan type</label>
            <select id="planType" value={planForm.planType} onChange={(event) => setPlanForm({ ...planForm, planType: event.target.value as InsurancePlan["planType"] })}>
              <option value="hmo">HMO</option>
              <option value="ppo">PPO</option>
              <option value="epo">EPO</option>
              <option value="pos">POS</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="memberServicesPhone">Member services phone</label>
            <input id="memberServicesPhone" value={planForm.memberServicesPhone} onChange={(event) => setPlanForm({ ...planForm, memberServicesPhone: event.target.value })} />
          </div>
          <button className="primary-button" type="submit">Create plan</button>
          <div className="compact-list">
            {plans.map((plan) => <span key={plan.id}>{plan.name} · {plan.planType.toUpperCase()}</span>)}
          </div>
        </form>
      </section>
      <form className="portal-panel" onSubmit={handleRuleSubmit}>
        <h2>Coverage rules</h2>
        <div className="rule-grid">
          <div className="field">
            <label htmlFor="rulePlan">Plan</label>
            <select id="rulePlan" required value={ruleForm.planId} onChange={(event) => setRuleForm({ ...ruleForm, planId: event.target.value })}>
              <option value="">Select plan</option>
              {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="specialty">Specialty</label>
            <input id="specialty" required value={ruleForm.specialty} onChange={(event) => setRuleForm({ ...ruleForm, specialty: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="service">Service</label>
            <input id="service" required value={ruleForm.service} onChange={(event) => setRuleForm({ ...ruleForm, service: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="coverageStatus">Status</label>
            <select id="coverageStatus" value={ruleForm.coverageStatus} onChange={(event) => setRuleForm({ ...ruleForm, coverageStatus: event.target.value as CoverageRule["coverageStatus"] })}>
              <option value="covered">Covered</option>
              <option value="prior_authorization">Prior authorization</option>
              <option value="not_covered">Not covered</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="copayAmount">Copay</label>
            <input id="copayAmount" min={0} type="number" value={ruleForm.copayAmount} onChange={(event) => setRuleForm({ ...ruleForm, copayAmount: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="coinsurancePercent">Coinsurance %</label>
            <input id="coinsurancePercent" max={100} min={0} type="number" value={ruleForm.coinsurancePercent} onChange={(event) => setRuleForm({ ...ruleForm, coinsurancePercent: event.target.value })} />
          </div>
          <div className="field form-span">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" value={ruleForm.notes} onChange={(event) => setRuleForm({ ...ruleForm, notes: event.target.value })} />
          </div>
        </div>
        <button className="primary-button" type="submit">Save coverage rule</button>
        <div className="compact-list">
          {rules.map((rule) => <span key={rule.id}>{rule.specialty} · {rule.service} · {rule.coverageStatus.replace("_", " ")}</span>)}
        </div>
      </form>
    </>
  );
};
