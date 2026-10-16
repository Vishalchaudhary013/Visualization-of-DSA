import mongoose from "mongoose";
import { isDbConnected } from "../config/db.js";
import { SESSION_COOKIE, readSessionToken } from "../utils/session.js";

/** Accounts need the database; answer clearly instead of hanging. */
export const requireDb = (_req, res, next) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      error: "Accounts are not available right now. Please try again later.",
    });
  }
  next();
};

/** Requires a valid session cookie and sets req.userId. */
export const requireAuth = (req, res, next) => {
  const userId = readSessionToken(req.cookies?.[SESSION_COOKIE]);
  if (!userId || !mongoose.isValidObjectId(userId)) {
    return res.status(401).json({ error: "Please log in to continue." });
  }
  req.userId = userId;
  next();
};
