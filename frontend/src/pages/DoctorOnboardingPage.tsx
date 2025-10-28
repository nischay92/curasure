import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyDoctorProfile, saveMyDoctorProfile } from "../services/doctors";
import type { ConsultationMode, DoctorProfileInput } from "../types/doctor";

const emptyForm: DoctorProfileInput = {
  specialty: "",
  licenseNumber: "",
  npiNumber: "",
  yearsExperience: 0,
  clinicName: "",
  bio: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  zipCode: "",
  languages: [],
  acceptedInsurance: [],
  consultationModes: ["in_person"]
};

const toCommaString = (values: string[]) => values.join(", ");

const fromCommaString = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const DoctorOnboardingPage = () => {
  const [form, setForm] = useState<DoctorProfileInput>(emptyForm);
  const [languagesText, setLanguagesText] = useState("");
  const [insuranceText, setInsuranceText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const doctor = await fetchMyDoctorProfile();

        if (doctor) {
          setForm({
            specialty: doctor.specialty,
            licenseNumber: doctor.licenseNumber,
            npiNumber: doctor.npiNumber ?? "",
            yearsExperience: doctor.yearsExperience,
            clinicName: doctor.clinicName,
            bio: doctor.bio,
            phone: doctor.phone,
            addressLine1: doctor.addressLine1,
            city: doctor.city,
            state: doctor.state,
            zipCode: doctor.zipCode,
            languages: doctor.languages,
            acceptedInsurance: doctor.acceptedInsurance,
            consultationModes: doctor.consultationModes
          });
          setLanguagesText(toCommaString(doctor.languages));
          setInsuranceText(toCommaString(doctor.acceptedInsurance));
          setSavedStatus(`Verification status: ${doctor.verificationStatus}`);
        }
      } catch {
        setError("Unable to load your doctor profile.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const updateField = <Key extends keyof DoctorProfileInput>(
    key: Key,
    value: DoctorProfileInput[Key]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  };

  const toggleConsultationMode = (mode: ConsultationMode) => {
    setForm((current) => {
      const hasMode = current.consultationModes.includes(mode);
      const nextModes = hasMode
        ? current.consultationModes.filter((item) => item !== mode)
        : [...current.consultationModes, mode];

      return {
        ...current,
        consultationModes: nextModes.length > 0 ? nextModes : [mode]
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSavedStatus(null);
    setIsSaving(true);

    try {
      const saved = await saveMyDoctorProfile({
        ...form,
        state: form.state.toUpperCase(),
        languages: fromCommaString(languagesText),
        acceptedInsurance: fromCommaString(insuranceText)
      });
      setSavedStatus(`Verification status: ${saved.verificationStatus}`);
      navigate("/dashboard/doctor", { replace: true });
    } catch {
      setError("Unable to save your profile. Check required fields and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="loading-screen">Loading doctor profile...</div>;
  }

  return (
    <>
      <h1>Doctor onboarding</h1>
      <p>Complete your professional profile so CuraSure admins can verify your account.</p>
      {error && <div className="alert">{error}</div>}
      {savedStatus && <div className="notice">{savedStatus}</div>}
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="specialty">Specialty</label>
          <input
            id="specialty"
            required
            value={form.specialty}
            onChange={(event) => updateField("specialty", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="licenseNumber">License number</label>
          <input
            id="licenseNumber"
            required
            value={form.licenseNumber}
            onChange={(event) => updateField("licenseNumber", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="npiNumber">NPI number</label>
          <input
            id="npiNumber"
            value={form.npiNumber}
            onChange={(event) => updateField("npiNumber", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="yearsExperience">Years experience</label>
          <input
            id="yearsExperience"
            min={0}
            required
            type="number"
            value={form.yearsExperience}
            onChange={(event) => updateField("yearsExperience", Number(event.target.value))}
          />
        </div>
        <div className="field form-span">
          <label htmlFor="clinicName">Clinic name</label>
          <input
            id="clinicName"
            required
            value={form.clinicName}
            onChange={(event) => updateField("clinicName", event.target.value)}
          />
        </div>
        <div className="field form-span">
          <label htmlFor="bio">Professional bio</label>
          <textarea
            id="bio"
            required
            rows={5}
            value={form.bio}
            onChange={(event) => updateField("bio", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            required
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="addressLine1">Clinic address</label>
          <input
            id="addressLine1"
            required
            value={form.addressLine1}
            onChange={(event) => updateField("addressLine1", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="city">City</label>
          <input
            id="city"
            required
            value={form.city}
            onChange={(event) => updateField("city", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="state">State</label>
          <input
            id="state"
            maxLength={2}
            required
            value={form.state}
            onChange={(event) => updateField("state", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="zipCode">ZIP code</label>
          <input
            id="zipCode"
            required
            value={form.zipCode}
            onChange={(event) => updateField("zipCode", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="languages">Languages</label>
          <input
            id="languages"
            placeholder="English, Spanish"
            value={languagesText}
            onChange={(event) => setLanguagesText(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="acceptedInsurance">Accepted insurance</label>
          <input
            id="acceptedInsurance"
            placeholder="Aetna, Cigna, Blue Cross"
            value={insuranceText}
            onChange={(event) => setInsuranceText(event.target.value)}
          />
        </div>
        <fieldset className="mode-group form-span">
          <legend>Consultation modes</legend>
          <label>
            <input
              checked={form.consultationModes.includes("in_person")}
              type="checkbox"
              onChange={() => toggleConsultationMode("in_person")}
            />
            In person
          </label>
          <label>
            <input
              checked={form.consultationModes.includes("telehealth")}
              type="checkbox"
              onChange={() => toggleConsultationMode("telehealth")}
            />
            Telehealth
          </label>
        </fieldset>
        <div className="form-actions form-span">
          <button className="primary-button" disabled={isSaving} type="submit">
            {isSaving ? "Saving profile..." : "Save doctor profile"}
          </button>
        </div>
      </form>
    </>
  );
};
