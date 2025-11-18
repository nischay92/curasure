export interface PatientDocument {
  id: string;
  ownerUserId: string;
  type: "medical_document" | "insurance_card";
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}
