import type { DecodedIdToken } from "firebase-admin/auth";
import type { UserDocument } from "../models/User.js";

declare global {
  namespace Express {
    interface Request {
      auth?: DecodedIdToken;
      user?: UserDocument;
    }
  }
}

export {};
