import { useEffect, useState } from "react";
import { createAvailabilitySlot, fetchAppointments } from "../services/appointments";
import type { Appointment, VisitMode } from "../types/appointment";
import { useAuth } from "../context/AuthContext";

const formatDateTime = (value: string) => {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
};

export const AppointmentsPage = () => {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [slotTime, setSlotTime] = useState("");
  const [slotVisitMode, setSlotVisitMode] = useState<VisitMode>("in_person");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingSlot, setIsCreatingSlot] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const results = await fetchAppointments();
        setAppointments(results);
      } catch {
        setError("Unable to load appointments.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadAppointments();
  }, []);

  const handleCreateSlot = async () => {
    setError(null);
    setSuccess(null);
    setIsCreatingSlot(true);

    try {
      await createAvailabilitySlot({
        startsAt: slotTime,
        visitMode: slotVisitMode
      });
      setSuccess("Hourly slot opened for patients.");
      setSlotTime("");
    } catch {
      setError("Unable to open that slot. Use a future time exactly on the hour.");
    } finally {
      setIsCreatingSlot(false);
    }
  };

  return (
    <>
      <h1>{profile?.role === "doctor" ? "Doctor appointments" : "My appointments"}</h1>
      <p>
        {profile?.role === "doctor"
          ? "Review patient appointment requests and upcoming visits."
          : "Track appointment requests and upcoming visits with your care team."}
      </p>
      {error && <div className="alert">{error}</div>}
      {success && <div className="notice">{success}</div>}
      {profile?.role === "doctor" && (
        <section className="slot-opener" aria-label="Open appointment slot">
          <div className="field">
            <label htmlFor="slotTime">Open hourly slot</label>
            <input
              id="slotTime"
              type="datetime-local"
              value={slotTime}
              onChange={(event) => setSlotTime(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="slotVisitMode">Visit mode</label>
            <select
              id="slotVisitMode"
              value={slotVisitMode}
              onChange={(event) => setSlotVisitMode(event.target.value as VisitMode)}
            >
              <option value="in_person">In person</option>
              <option value="telehealth">Telehealth</option>
            </select>
          </div>
          <button
            className="primary-button"
            disabled={isCreatingSlot || !slotTime}
            type="button"
            onClick={handleCreateSlot}
          >
            {isCreatingSlot ? "Opening slot..." : "Open slot"}
          </button>
        </section>
      )}
      {isLoading && <div className="notice">Loading appointments...</div>}
      {!isLoading && appointments.length === 0 && (
        <div className="notice">No appointments are scheduled yet.</div>
      )}
      <section className="appointment-list" aria-label="Appointments">
        {appointments.map((appointment) => (
          <article className="appointment-card" key={appointment.id}>
            <div>
              <h2>
                {profile?.role === "doctor"
                  ? appointment.patientEmail ?? "Patient"
                  : appointment.doctorName ?? "Doctor"}
              </h2>
              <p>{appointment.specialty}</p>
            </div>
            <span className={`status-pill status-${appointment.status}`}>{appointment.status}</span>
            <dl>
              <div>
                <dt>When</dt>
                <dd>{formatDateTime(appointment.scheduledAt)}</dd>
              </div>
              <div>
                <dt>Mode</dt>
                <dd>{appointment.visitMode.replace("_", " ")}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{appointment.durationMinutes} minutes</dd>
              </div>
              <div className="appointment-reason">
                <dt>Reason</dt>
                <dd>{appointment.reason}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </>
  );
};
