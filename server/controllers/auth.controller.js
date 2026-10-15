import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { HistoryEntry } from "../models/HistoryEntry.js";
import { clearSessionCookie, setSessionCookie } from "../utils/session.js";

const HASH_ROUNDS = 12;
const INVALID_LOGIN = "Email or password is incorrect.";

// POST /api/auth/register { name, email, password } -> { user }
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.exists({ email })) {
    return res.status(409).json({
      error: "An account with this email already exists.",
      fields: { email: "Already registered" },
    });
  }
  const passwordHash = await bcrypt.hash(password, HASH_ROUNDS);
  const user = await User.create({ name, email, passwordHash });
  setSessionCookie(res, user.id);
  res.status(201).json({ user: user.toPublic() });
};

// POST /api/auth/login { email, password } -> { user }
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+passwordHash");
  // Same message whether the email or the password is wrong
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: INVALID_LOGIN });
  }
  setSessionCookie(res, user.id);
  res.json({ user: user.toPublic() });
};

// POST /api/auth/logout
export const logout = (_req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
};

// GET /api/auth/me -> { user }
export const getMe = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    clearSessionCookie(res);
    return res.status(401).json({ error: "Please log in to continue." });
  }
  res.json({ user: user.toPublic() });
};

// PATCH /api/auth/me { name } -> { user }
export const updateMe = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.userId,
    { name: req.body.name },
    { returnDocument: "after", runValidators: true },
  );
  if (!user) return res.status(404).json({ error: "Account not found." });
  res.json({ user: user.toPublic() });
};

// PUT /api/auth/password { currentPassword, newPassword }
export const changePassword = async (req, res) => {
  const user = await User.findById(req.userId).select("+passwordHash");
  if (!user) return res.status(404).json({ error: "Account not found." });
  if (!(await bcrypt.compare(req.body.currentPassword, user.passwordHash))) {
    return res.status(400).json({
      error: "Current password is incorrect.",
      fields: { currentPassword: "Incorrect password" },
    });
  }
  user.passwordHash = await bcrypt.hash(req.body.newPassword, HASH_ROUNDS);
  await user.save();
  res.status(204).end();
};

// DELETE /api/auth/me { password } - deletes the account and all its history
export const deleteMe = async (req, res) => {
  const user = await User.findById(req.userId).select("+passwordHash");
  if (!user) return res.status(404).json({ error: "Account not found." });
  if (!(await bcrypt.compare(req.body.password, user.passwordHash))) {
    return res.status(400).json({
      error: "Password is incorrect.",
      fields: { password: "Incorrect password" },
    });
  }
  await HistoryEntry.deleteMany({ user: user._id });
  await user.deleteOne();
  clearSessionCookie(res);
  res.status(204).end();
};
