import crypto from "node:crypto";
import { Router } from "express";
import multer from "multer";
import { firebaseStorageBucket } from "../config/firebaseAdmin.js";
import { Document } from "../models/Document.js";
import { requireAuth } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import { requireRole } from "../middleware/roles.js";

export const documentRoutes = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

const allowedTypes = ["medical_document", "insurance_card"] as const;

const serializeDocument = (document: any) => ({
  id: document._id,
  ownerUserId: document.ownerUserId,
  type: document.type,
  originalName: document.originalName,
  mimeType: document.mimeType,
  sizeBytes: document.sizeBytes,
  createdAt: document.createdAt
});

documentRoutes.use(requireAuth, requireRole("patient"));

documentRoutes.get("/", async (req, res, next) => {
  try {
    const documents = await Document.find({ ownerUserId: req.user?._id }).sort({ createdAt: -1 });

    res.status(200).json({
      documents: documents.map(serializeDocument)
    });
  } catch (error) {
    next(error);
  }
});

documentRoutes.post("/", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("File is required", 400);
    }

    const type = String(req.body?.type ?? "");

    if (!allowedTypes.includes(type as (typeof allowedTypes)[number])) {
      throw new AppError("Document type must be medical_document or insurance_card", 400);
    }

    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `documents/${req.user?._id}/${crypto.randomUUID()}-${safeName}`;
    const file = firebaseStorageBucket().file(storagePath);

    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
        metadata: {
          ownerUserId: String(req.user?._id),
          documentType: type
        }
      },
      resumable: false
    });

    const document = await Document.create({
      ownerUserId: req.user?._id,
      type,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      storagePath
    });

    res.status(201).json({
      document: serializeDocument(document)
    });
  } catch (error) {
    next(error);
  }
});

documentRoutes.get("/:documentId/download-url", async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.documentId,
      ownerUserId: req.user?._id
    });

    if (!document) {
      throw new AppError("Document not found", 404);
    }

    const [url] = await firebaseStorageBucket().file(document.storagePath).getSignedUrl({
      action: "read",
      expires: Date.now() + 10 * 60 * 1000
    });

    res.status(200).json({ url });
  } catch (error) {
    next(error);
  }
});
