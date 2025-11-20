import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { AvailabilitySlot } from "./models/AvailabilitySlot.js";
import { CoverageRule } from "./models/CoverageRule.js";
import { Doctor } from "./models/Doctor.js";
import { InsurancePlan } from "./models/InsurancePlan.js";
import { InsuranceProvider } from "./models/InsuranceProvider.js";
import { User } from "./models/User.js";
import type { UserRole } from "./models/User.js";

type SeedUser = {
  firebaseUid: string;
  email: string;
  role: UserRole;
};

type SeedDoctor = {
  user: SeedUser;
  specialty: string;
  licenseNumber: string;
  npiNumber: string;
  yearsExperience: number;
  clinicName: string;
  bio: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  languages: string[];
  acceptedInsurance: string[];
  consultationModes: Array<"in_person" | "telehealth">;
};

type SeedProvider = {
  user: SeedUser;
  companyName: string;
  payerId: string;
  supportPhone: string;
  supportEmail: string;
  website: string;
  plans: Array<{
    name: string;
    planType: "hmo" | "ppo" | "epo" | "pos" | "other";
    memberServicesPhone: string;
    rules: Array<{
      specialty: string;
      service: string;
      coverageStatus: "covered" | "not_covered" | "prior_authorization";
      copayAmount?: number;
      coinsurancePercent?: number;
      notes: string;
    }>;
  }>;
};

const demoUsers: SeedUser[] = [
  { firebaseUid: "demo-patient", email: "patient@curasure.demo", role: "patient" }
];

const demoDoctors: SeedDoctor[] = [
  {
    user: { firebaseUid: "demo-doctor-primary", email: "primary@curasure.demo", role: "doctor" },
    specialty: "Primary care",
    licenseNumber: "DEMO-PC-1001",
    npiNumber: "1000000001",
    yearsExperience: 8,
    clinicName: "CuraSure Family Clinic",
    bio: "Board-certified primary care doctor for annual visits, common illnesses, and preventive care.",
    phone: "555-0100",
    addressLine1: "100 Health Way",
    city: "Bloomington",
    state: "IN",
    zipCode: "47404",
    latitude: 39.1653,
    longitude: -86.5264,
    languages: ["English", "Spanish"],
    acceptedInsurance: ["CuraSure Plus PPO", "HealthBridge Silver HMO", "MetroCare Flex POS"],
    consultationModes: ["in_person", "telehealth"]
  },
  {
    user: { firebaseUid: "demo-doctor-cardio", email: "cardiology@curasure.demo", role: "doctor" },
    specialty: "Cardiology",
    licenseNumber: "DEMO-CA-1002",
    npiNumber: "1000000002",
    yearsExperience: 14,
    clinicName: "Monroe Heart Associates",
    bio: "Cardiology practice focused on chest pain evaluation, hypertension, and follow-up care.",
    phone: "555-0101",
    addressLine1: "220 Wellness Ave",
    city: "Bloomington",
    state: "IN",
    zipCode: "47401",
    latitude: 39.1616,
    longitude: -86.5019,
    languages: ["English"],
    acceptedInsurance: ["CuraSure Plus PPO", "MetroCare Flex POS"],
    consultationModes: ["in_person", "telehealth"]
  },
  {
    user: { firebaseUid: "demo-doctor-derm", email: "dermatology@curasure.demo", role: "doctor" },
    specialty: "Dermatology",
    licenseNumber: "DEMO-DE-1003",
    npiNumber: "1000000003",
    yearsExperience: 10,
    clinicName: "ClearSkin Dermatology",
    bio: "Dermatology clinic for acne, rashes, skin checks, and procedure referrals.",
    phone: "555-0102",
    addressLine1: "48 College Mall Rd",
    city: "Bloomington",
    state: "IN",
    zipCode: "47401",
    latitude: 39.1649,
    longitude: -86.4947,
    languages: ["English", "Hindi"],
    acceptedInsurance: ["HealthBridge Silver HMO", "MetroCare Flex POS"],
    consultationModes: ["in_person"]
  },
  {
    user: { firebaseUid: "demo-doctor-peds", email: "pediatrics@curasure.demo", role: "doctor" },
    specialty: "Pediatrics",
    licenseNumber: "DEMO-PE-1004",
    npiNumber: "1000000004",
    yearsExperience: 12,
    clinicName: "Bloom Kids Pediatrics",
    bio: "Pediatric clinic for well-child visits, school forms, vaccines, and common childhood illnesses.",
    phone: "555-0103",
    addressLine1: "760 Pediatric Dr",
    city: "Bloomington",
    state: "IN",
    zipCode: "47403",
    latitude: 39.1484,
    longitude: -86.5585,
    languages: ["English", "Spanish"],
    acceptedInsurance: ["CuraSure Plus PPO", "HealthBridge Silver HMO"],
    consultationModes: ["in_person", "telehealth"]
  }
];

const demoProviders: SeedProvider[] = [
  {
    user: { firebaseUid: "demo-provider-curasure", email: "provider-curasure@curasure.demo", role: "insurance_provider" },
    companyName: "CuraSure Insurance",
    payerId: "CSI-DEMO",
    supportPhone: "555-0200",
    supportEmail: "support@curasure.demo",
    website: "https://example.com/curasure-insurance",
    plans: [
      {
        name: "CuraSure Plus PPO",
        planType: "ppo",
        memberServicesPhone: "555-0201",
        rules: [
          { specialty: "primary care", service: "office visit", coverageStatus: "covered", copayAmount: 25, notes: "Covered for in-network primary care visits." },
          { specialty: "cardiology", service: "specialist visit", coverageStatus: "covered", copayAmount: 50, notes: "Covered for in-network cardiology visits." },
          { specialty: "pediatrics", service: "well child visit", coverageStatus: "covered", copayAmount: 0, notes: "Preventive pediatric visits are covered." },
          { specialty: "dermatology", service: "procedure", coverageStatus: "prior_authorization", coinsurancePercent: 20, notes: "Procedures require prior authorization." }
        ]
      }
    ]
  },
  {
    user: { firebaseUid: "demo-provider-healthbridge", email: "provider-healthbridge@curasure.demo", role: "insurance_provider" },
    companyName: "HealthBridge",
    payerId: "HB-DEMO",
    supportPhone: "555-0300",
    supportEmail: "support@healthbridge.demo",
    website: "https://example.com/healthbridge",
    plans: [
      {
        name: "HealthBridge Silver HMO",
        planType: "hmo",
        memberServicesPhone: "555-0301",
        rules: [
          { specialty: "primary care", service: "office visit", coverageStatus: "covered", copayAmount: 20, notes: "Primary care is covered with the assigned clinic." },
          { specialty: "dermatology", service: "specialist visit", coverageStatus: "prior_authorization", copayAmount: 45, notes: "Referral required before specialist visit." },
          { specialty: "pediatrics", service: "vaccine", coverageStatus: "covered", copayAmount: 0, notes: "Routine vaccines are covered." },
          { specialty: "cardiology", service: "stress test", coverageStatus: "prior_authorization", coinsurancePercent: 15, notes: "Prior authorization required for diagnostic testing." }
        ]
      }
    ]
  },
  {
    user: { firebaseUid: "demo-provider-metrocare", email: "provider-metrocare@curasure.demo", role: "insurance_provider" },
    companyName: "MetroCare Assurance",
    payerId: "MCA-DEMO",
    supportPhone: "555-0400",
    supportEmail: "support@metrocare.demo",
    website: "https://example.com/metrocare",
    plans: [
      {
        name: "MetroCare Flex POS",
        planType: "pos",
        memberServicesPhone: "555-0401",
        rules: [
          { specialty: "primary care", service: "telehealth visit", coverageStatus: "covered", copayAmount: 15, notes: "Telehealth primary care is covered." },
          { specialty: "cardiology", service: "specialist visit", coverageStatus: "covered", copayAmount: 55, notes: "Cardiology visits are covered after referral." },
          { specialty: "dermatology", service: "skin check", coverageStatus: "covered", copayAmount: 40, notes: "Annual skin checks are covered." },
          { specialty: "pediatrics", service: "urgent visit", coverageStatus: "covered", copayAmount: 30, notes: "Urgent pediatric visits are covered." }
        ]
      }
    ]
  }
];

const upsertUser = async ({ firebaseUid, email, role }: SeedUser) => {
  return User.findOneAndUpdate(
    { firebaseUid },
    { $set: { firebaseUid, email, role, isActive: true } },
    { upsert: true, returnDocument: "after" }
  );
};

const buildSlotDate = (dayOffset: number, hour: number) => {
  const base = new Date();
  base.setDate(base.getDate() + dayOffset);
  base.setHours(hour, 0, 0, 0);
  return base;
};

await connectDatabase();

for (const user of demoUsers) {
  await upsertUser(user);
}

const seededDoctors = [];

for (const doctorSeed of demoDoctors) {
  const user = await upsertUser(doctorSeed.user);
  const doctor = await Doctor.findOneAndUpdate(
    { userId: user._id },
    {
      $set: {
        specialty: doctorSeed.specialty,
        licenseNumber: doctorSeed.licenseNumber,
        npiNumber: doctorSeed.npiNumber,
        yearsExperience: doctorSeed.yearsExperience,
        clinicName: doctorSeed.clinicName,
        bio: doctorSeed.bio,
        phone: doctorSeed.phone,
        addressLine1: doctorSeed.addressLine1,
        city: doctorSeed.city,
        state: doctorSeed.state,
        zipCode: doctorSeed.zipCode,
        latitude: doctorSeed.latitude,
        longitude: doctorSeed.longitude,
        languages: doctorSeed.languages,
        acceptedInsurance: doctorSeed.acceptedInsurance,
        consultationModes: doctorSeed.consultationModes,
        verificationStatus: "verified"
      }
    },
    { upsert: true, returnDocument: "after" }
  );

  seededDoctors.push(doctor);

  for (const dayOffset of [1, 2, 3]) {
    for (const hour of [9, 10, 14, 15]) {
      const startsAt = buildSlotDate(dayOffset, hour);
      const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);
      await AvailabilitySlot.findOneAndUpdate(
        { doctorId: doctor._id, startsAt },
        {
          $setOnInsert: {
            doctorId: doctor._id,
            doctorUserId: user._id,
            startsAt,
            endsAt,
            visitMode: doctorSeed.consultationModes.includes("telehealth") && hour >= 14 ? "telehealth" : "in_person",
            status: "open"
          }
        },
        { upsert: true }
      );
    }
  }
}

for (const providerSeed of demoProviders) {
  const user = await upsertUser(providerSeed.user);
  const provider = await InsuranceProvider.findOneAndUpdate(
    { userId: user._id },
    {
      $set: {
        companyName: providerSeed.companyName,
        payerId: providerSeed.payerId,
        supportPhone: providerSeed.supportPhone,
        supportEmail: providerSeed.supportEmail,
        website: providerSeed.website,
        verificationStatus: "verified"
      }
    },
    { upsert: true, returnDocument: "after" }
  );

  for (const planSeed of providerSeed.plans) {
    const plan = await InsurancePlan.findOneAndUpdate(
      { providerId: provider._id, name: planSeed.name },
      {
        $set: {
          providerId: provider._id,
          name: planSeed.name,
          planType: planSeed.planType,
          memberServicesPhone: planSeed.memberServicesPhone,
          isActive: true
        }
      },
      { upsert: true, returnDocument: "after" }
    );

    for (const ruleSeed of planSeed.rules) {
      await CoverageRule.findOneAndUpdate(
        {
          planId: plan._id,
          specialty: ruleSeed.specialty.toLowerCase(),
          service: ruleSeed.service.toLowerCase()
        },
        {
          $set: {
            providerId: provider._id,
            planId: plan._id,
            specialty: ruleSeed.specialty,
            service: ruleSeed.service,
            coverageStatus: ruleSeed.coverageStatus,
            copayAmount: ruleSeed.copayAmount,
            coinsurancePercent: ruleSeed.coinsurancePercent,
            notes: ruleSeed.notes
          }
        },
        { upsert: true }
      );
    }
  }
}

console.log(
  `Seeded ${seededDoctors.length} verified doctors, ${demoProviders.length} verified insurance providers, ` +
    `${demoProviders.reduce((total, provider) => total + provider.plans.length, 0)} plans, and open appointment slots.`
);

await disconnectDatabase();
