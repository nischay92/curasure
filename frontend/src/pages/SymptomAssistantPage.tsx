import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { requestSymptomGuidance } from "../services/ai";
import type { AiSymptomResponse } from "../types/ai";

export const SymptomAssistantPage = () => {
  const [form, setForm] = useState({ symptoms: "", city: "", state: "", insurance: "" });
  const [result, setResult] = useState<AiSymptomResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const guidance = await requestSymptomGuidance(form);
      setResult(guidance);
    } catch {
      setError("Unable to generate guidance. Add more symptom detail and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h1>AI symptom assistant</h1>
      <p>Describe symptoms to get routing guidance and matching doctors.</p>
      <div className="alert">
        This is not a medical diagnosis. If symptoms are severe, worsening, or life-threatening,
        seek emergency care immediately.
      </div>
      {error && <div className="alert">{error}</div>}
      <form className="symptom-form" onSubmit={handleSubmit}>
        <div className="field form-span">
          <label htmlFor="symptoms">Symptoms</label>
          <textarea
            id="symptoms"
            required
            rows={6}
            value={form.symptoms}
            onChange={(event) => setForm({ ...form, symptoms: event.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="city">City</label>
          <input id="city" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="state">State</label>
          <input id="state" maxLength={2} value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="insurance">Insurance</label>
          <input id="insurance" value={form.insurance} onChange={(event) => setForm({ ...form, insurance: event.target.value })} />
        </div>
        <button className="primary-button" disabled={isLoading} type="submit">
          {isLoading ? "Generating guidance..." : "Get guidance"}
        </button>
      </form>
      {result && (
        <section className="ai-result">
          <div>
            <h2>{result.session.recommendedSpecialty}</h2>
            <span className={`status-pill urgency-${result.session.urgency}`}>
              {result.session.urgency}
            </span>
            <span className="source-pill">{result.session.source}</span>
          </div>
          <p>{result.session.guidance}</p>
          <div className="doctor-results">
            {result.doctors.map((doctor) => (
              <article className="doctor-result-card" key={doctor.id}>
                <h2>{doctor.clinicName}</h2>
                <p>{doctor.specialty} · {doctor.city}, {doctor.state}</p>
                <Link className="secondary-link-button" to="/doctors">View in doctor search</Link>
              </article>
            ))}
            {result.doctors.length === 0 && <div className="notice">No matching doctors found yet.</div>}
          </div>
        </section>
      )}
    </>
  );
};
