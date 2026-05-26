import { FormEvent, useState } from "react";
import { fetchTelehealthLink } from "../services/telehealth";

export const TelehealthPage = () => {
  const [appointmentId, setAppointmentId] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setUrl("");
    try {
      const result = await fetchTelehealthLink(appointmentId);
      setUrl(result.url);
    } catch {
      setError("Unable to open telehealth room for this appointment.");
    }
  };

  return (
    <>
      <h1>Telehealth</h1>
      <p>Enter a telehealth appointment ID to open the secure Jitsi room.</p>
      {error && <div className="alert">{error}</div>}
      <form className="coverage-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="appointmentId">Appointment ID</label>
          <input id="appointmentId" required value={appointmentId} onChange={(event) => setAppointmentId(event.target.value)} />
        </div>
        <button className="primary-button" type="submit">Open room</button>
      </form>
      {url && (
        <section className="telehealth-frame">
          <a className="primary-link-button" href={url} rel="noreferrer" target="_blank">Open in new tab</a>
          <iframe allow="camera; microphone; fullscreen; display-capture" src={url} title="CuraSure telehealth room" />
        </section>
      )}
    </>
  );
};
