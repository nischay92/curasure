import { FormEvent, useEffect, useState } from "react";
import { searchDoctors } from "../services/doctors";
import { checkCoverage, fetchInsurancePlans } from "../services/insurance";
import type { DoctorProfile } from "../types/doctor";
import type { CoverageResult, InsurancePlan } from "../types/insurance";

export const CoverageCheckerPage = () => {
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [form, setForm] = useState({ planId: "", doctorId: "", specialty: "", service: "" });
  const [result, setResult] = useState<CoverageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchInsurancePlans(), searchDoctors({})])
      .then(([nextPlans, nextDoctors]) => {
        setPlans(nextPlans);
        setDoctors(nextDoctors);
      })
      .catch(() => setError("Unable to load coverage checker options."));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    try {
      const nextResult = await checkCoverage(form);
      setResult(nextResult);
    } catch {
      setError("Unable to check coverage. Confirm plan, specialty, and service.");
    }
  };

  return (
    <>
      <h1>Coverage checker</h1>
      <p>Check whether a plan has a rule for a doctor, specialty, and service.</p>
      {error && <div className="alert">{error}</div>}
      <form className="coverage-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="planId">Insurance plan</label>
          <select id="planId" required value={form.planId} onChange={(event) => setForm({ ...form, planId: event.target.value })}>
            <option value="">Select plan</option>
            {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="doctorId">Doctor</label>
          <select id="doctorId" value={form.doctorId} onChange={(event) => {
            const doctor = doctors.find((item) => item.id === event.target.value);
            setForm({ ...form, doctorId: event.target.value, specialty: doctor?.specialty ?? form.specialty });
          }}>
            <option value="">No doctor selected</option>
            {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.clinicName} · {doctor.specialty}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="specialty">Specialty</label>
          <input id="specialty" required value={form.specialty} onChange={(event) => setForm({ ...form, specialty: event.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="service">Service</label>
          <input id="service" required placeholder="consultation, x-ray, general" value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })} />
        </div>
        <button className="primary-button" type="submit">Check coverage</button>
      </form>
      {result && (
        <section className={`coverage-result result-${result.status}`}>
          <h2>{result.status.replace("_", " ")}</h2>
          <p>{result.explanation}</p>
        </section>
      )}
    </>
  );
};
