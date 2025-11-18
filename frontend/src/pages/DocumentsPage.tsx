import { FormEvent, useEffect, useState } from "react";
import { fetchDocuments, getDocumentDownloadUrl, uploadDocument } from "../services/documents";
import type { PatientDocument } from "../types/document";

const formatBytes = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const DocumentsPage = () => {
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [type, setType] = useState<PatientDocument["type"]>("medical_document");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadDocuments = async () => {
    const results = await fetchDocuments();
    setDocuments(results);
  };

  useEffect(() => {
    loadDocuments()
      .catch(() => setError("Unable to load documents."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setError("Choose a file to upload.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsUploading(true);

    try {
      const document = await uploadDocument(file, type);
      setDocuments((current) => [document, ...current]);
      setFile(null);
      setSuccess("Document uploaded securely.");
    } catch {
      setError("Unable to upload document. Confirm Firebase Storage setup and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      const url = await getDocumentDownloadUrl(documentId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Unable to create a secure download link.");
    }
  };

  return (
    <>
      <h1>Documents</h1>
      <p>Upload medical documents and insurance cards for secure storage.</p>
      {error && <div className="alert">{error}</div>}
      {success && <div className="notice">{success}</div>}
      <form className="document-upload" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="documentType">Document type</label>
          <select id="documentType" value={type} onChange={(event) => setType(event.target.value as PatientDocument["type"])}>
            <option value="medical_document">Medical document</option>
            <option value="insurance_card">Insurance card</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="file">File</label>
          <input id="file" type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        </div>
        <button className="primary-button" disabled={isUploading} type="submit">
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {isLoading && <div className="notice">Loading documents...</div>}
      {!isLoading && documents.length === 0 && <div className="notice">No documents uploaded yet.</div>}
      <section className="document-list" aria-label="Documents">
        {documents.map((document) => (
          <article className="document-card" key={document.id}>
            <div>
              <h2>{document.originalName}</h2>
              <p>{document.type.replace("_", " ")} · {formatBytes(document.sizeBytes)}</p>
            </div>
            <button className="secondary-button" type="button" onClick={() => handleDownload(document.id)}>
              Secure link
            </button>
          </article>
        ))}
      </section>
    </>
  );
};
