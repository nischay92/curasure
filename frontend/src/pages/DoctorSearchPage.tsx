import { FormEvent, useEffect, useMemo, useState } from "react";
import { divIcon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { searchDoctors, type DoctorSearchFilters } from "../services/doctors";
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mappedDoctors = useMemo(() => doctors.filter(hasCoordinates), [doctors]);
  const mapCenter = useMemo<[number, number]>(() => {
    const firstDoctor = mappedDoctors[0];
    return firstDoctor ? [firstDoctor.latitude as number, firstDoctor.longitude as number] : defaultCenter;
  }, [mappedDoctors]);

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

  return (
    <>
      <h1>Find doctors</h1>
      <p>Search CuraSure doctors by specialty, location, insurance, and visit mode.</p>
      {error && <div className="alert">{error}</div>}
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
