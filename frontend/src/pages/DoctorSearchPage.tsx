import { FormEvent, useEffect, useMemo, useState } from "react";
import { divIcon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { bookAppointment, fetchDoctorSlots } from "../services/appointments";
import { getApiErrorMessage } from "../services/api";
import { createConversation } from "../services/chat";
import { searchDoctors, type DoctorSearchFilters } from "../services/doctors";
import type { AvailabilitySlot } from "../types/appointment";
import type { DoctorProfile } from "../types/doctor";
import "leaflet/dist/leaflet.css";

const markerIcon = divIcon({
  className: "doctor-map-marker",
  html: "<span></span>",
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const defaultCenter: [number, number] = [39.8283, -98.5795];

const hasCoordinates = (doctor: DoctorProfile) => {
  return typeof doctor.latitude === "number" && typeof doctor.longitude === "number";
};

const MapViewUpdater = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, map, zoom]);

  return null;
};

export const DoctorSearchPage = () => {
  const [filters, setFilters] = useState<DoctorSearchFilters>({
    specialty: "",
    city: "",
    state: "",
    insurance: "",
    consultationMode: ""
  });
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [bookingDoctorId, setBookingDoctorId] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [appointmentReason, setAppointmentReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const mappedDoctors = useMemo(() => doctors.filter(hasCoordinates), [doctors]);
  const mapCenter = useMemo<[number, number]>(() => {
    const firstDoctor = mappedDoctors[0];
    return firstDoctor ? [firstDoctor.latitude as number, firstDoctor.longitude as number] : defaultCenter;
  }, [mappedDoctors]);
  const navigate = useNavigate();

  const loadDoctors = async (nextFilters = filters) => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await searchDoctors(nextFilters);
      setDoctors(results);
    } catch {
      setError("Unable to load doctors. Try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDoctors();
  }, []);

  const updateFilter = (key: keyof DoctorSearchFilters, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: value
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadDoctors(filters);
  };

  const startBooking = async (doctor: DoctorProfile) => {
    setBookingDoctorId(doctor.id);
    setAppointmentReason("");
    setSelectedSlotId("");
    setAvailableSlots([]);
    setSuccess(null);
    setError(null);
    setIsLoadingSlots(true);

    try {
      const slots = await fetchDoctorSlots(doctor.id);
      setAvailableSlots(slots);
      setSelectedSlotId(slots[0]?.id ?? "");
    } catch {
      setError("Unable to load this doctor's open slots.");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleBookAppointment = async (doctor: DoctorProfile) => {
    setError(null);
    setSuccess(null);
    setIsBooking(true);

    try {
      await bookAppointment({
        availabilitySlotId: selectedSlotId,
        reason: appointmentReason,
      });
      setSuccess(`Appointment request sent to ${doctor.clinicName}.`);
      setBookingDoctorId(null);
      setSelectedSlotId("");
      setAppointmentReason("");
      setAvailableSlots([]);
    } catch {
      setError("Unable to book that appointment. Check the time and try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleMessageDoctor = async (doctor: DoctorProfile) => {
    setError(null);
    setIsStartingChat(true);

    try {
      await createConversation({ doctorId: doctor.id });
      navigate("/chat");
    } catch (nextError) {
      setError(getApiErrorMessage(nextError, "Unable to start a conversation with this doctor."));
    } finally {
      setIsStartingChat(false);
    }
  };

  const formatSlot = (slot: AvailabilitySlot) => {
    return `${new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(slot.startsAt))} - ${slot.visitMode.replace("_", " ")}`;
  };

  return (
    <>
      <h1>Find doctors</h1>
      <p>Search CuraSure doctors by specialty, location, insurance, and visit mode.</p>
      {error && <div className="alert">{error}</div>}
      {success && <div className="notice">{success}</div>}
      <form className="search-bar" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="specialty">Specialty</label>
          <input
            id="specialty"
            value={filters.specialty}
            onChange={(event) => updateFilter("specialty", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="city">City</label>
          <input id="city" value={filters.city} onChange={(event) => updateFilter("city", event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="state">State</label>
          <input
            id="state"
            maxLength={2}
            value={filters.state}
            onChange={(event) => updateFilter("state", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="insurance">Insurance</label>
          <input
            id="insurance"
            value={filters.insurance}
            onChange={(event) => updateFilter("insurance", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="consultationMode">Availability</label>
          <select
            id="consultationMode"
            value={filters.consultationMode}
            onChange={(event) => updateFilter("consultationMode", event.target.value)}
          >
            <option value="">Any</option>
            <option value="in_person">In person</option>
            <option value="telehealth">Telehealth</option>
          </select>
        </div>
        <button className="primary-button" type="submit">
          Search
        </button>
      </form>
      <section className="search-layout">
        <div className="doctor-results" aria-live="polite">
          {isLoading && <div className="notice">Loading doctors...</div>}
          {!isLoading && doctors.length === 0 && (
            <div className="notice">No doctors match those filters yet.</div>
          )}
          {doctors.map((doctor) => (
            <article className="doctor-result-card" key={doctor.id}>
              <div>
                <h2>{doctor.displayName || doctor.clinicName}</h2>
                <p>
                  {doctor.specialty} at {doctor.clinicName}
                </p>
              </div>
              <span className={`status-pill status-${doctor.verificationStatus}`}>
                {doctor.verificationStatus}
              </span>
              <dl>
                <div>
                  <dt>Location</dt>
                  <dd>
                    {doctor.city}, {doctor.state} {doctor.zipCode}
                  </dd>
                </div>
                <div>
                  <dt>Insurance</dt>
                  <dd>{doctor.acceptedInsurance.length ? doctor.acceptedInsurance.join(", ") : "Not listed"}</dd>
                </div>
                <div>
                  <dt>Availability</dt>
                  <dd>{doctor.consultationModes.map((mode) => mode.replace("_", " ")).join(", ")}</dd>
                </div>
              </dl>
              {bookingDoctorId === doctor.id ? (
                <div className="booking-panel">
                  <div className="field">
                    <label htmlFor={`slot-${doctor.id}`}>Open hourly slot</label>
                    <select
                      disabled={isLoadingSlots || availableSlots.length === 0}
                      id={`slot-${doctor.id}`}
                      value={selectedSlotId}
                      onChange={(event) => setSelectedSlotId(event.target.value)}
                    >
                      {availableSlots.length === 0 && (
                        <option value="">{isLoadingSlots ? "Loading slots..." : "No open slots"}</option>
                      )}
                      {availableSlots.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {formatSlot(slot)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field booking-reason">
                    <label htmlFor={`reason-${doctor.id}`}>Reason</label>
                    <textarea
                      id={`reason-${doctor.id}`}
                      required
                      rows={3}
                      value={appointmentReason}
                      onChange={(event) => setAppointmentReason(event.target.value)}
                    />
                  </div>
                  <div className="booking-actions">
                    <button
                      className="primary-button"
                      disabled={isBooking || !selectedSlotId || !appointmentReason}
                      type="button"
                      onClick={() => handleBookAppointment(doctor)}
                    >
                      {isBooking ? "Booking..." : "Book appointment"}
                    </button>
                    <button className="secondary-button" type="button" onClick={() => setBookingDoctorId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="doctor-actions">
                  <button className="secondary-button" type="button" onClick={() => startBooking(doctor)}>
                    Book appointment
                  </button>
                  <button
                    className="secondary-button"
                    disabled={isStartingChat}
                    type="button"
                    onClick={() => handleMessageDoctor(doctor)}
                  >
                    Message doctor
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
        <div className="map-panel">
          <MapContainer center={mapCenter} zoom={mappedDoctors.length ? 11 : 4} scrollWheelZoom className="doctor-map">
            <MapViewUpdater center={mapCenter} zoom={mappedDoctors.length ? 11 : 4} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mappedDoctors.map((doctor) => (
              <Marker
                icon={markerIcon}
                key={doctor.id}
                position={[doctor.latitude as number, doctor.longitude as number]}
              >
                <Popup>
                  <strong>{doctor.displayName || doctor.clinicName}</strong>
                  <br />
                  {doctor.specialty}
                  <br />
                  {doctor.city}, {doctor.state}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <p className="map-note">
            Map markers appear when a doctor profile includes latitude and longitude.
          </p>
        </div>
      </section>
    </>
  );
};
