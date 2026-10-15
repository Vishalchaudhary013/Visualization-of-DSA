import crypto from "crypto";
import jwt from "jsonwebtoken";

export const SESSION_COOKIE = "dsa_session";
const SESSION_DAYS = 7;

let devSecret;

function getSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production");
  }
  // Development only: sessions reset whenever the server restarts
  devSecret ??= crypto.randomBytes(32).toString("hex");
  return devSecret;
}

export function createSessionToken(userId) {
  return jwt.sign({ sub: String(userId) }, getSecret(), {
    algorithm: "HS256",
    expiresIn: `${SESSION_DAYS}d`,
  });
}

/** Returns the user id stored in a token, or null when it is invalid/expired. */
export function readSessionToken(token) {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, getSecret(), { algorithms: ["HS256"] });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
});

export function setSessionCookie(res, userId) {
  res.cookie(SESSION_COOKIE, createSessionToken(userId), {
    ...cookieOptions(),
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, cookieOptions());
}
