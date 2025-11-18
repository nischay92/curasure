import { api } from "./api";
import type { PatientDocument } from "../types/document";

export const fetchDocuments = async () => {
  const response = await api.get("/documents");
  return response.data.documents as PatientDocument[];
};

export const uploadDocument = async (file: File, type: PatientDocument["type"]) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const response = await api.post("/documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data.document as PatientDocument;
};

export const getDocumentDownloadUrl = async (documentId: string) => {
  const response = await api.get(`/documents/${documentId}/download-url`);
  return response.data.url as string;
};
