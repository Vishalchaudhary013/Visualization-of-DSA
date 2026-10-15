import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  changePassword,
  deleteMe,
  getMe,
  login,
  logout,
  register,
  updateMe,
} from "../controllers/auth.controller.js";
import { requireAuth, requireDb } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import {
  changePasswordSchema,
  deleteAccountSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "../validation/schemas.js";

const router = Router();

// Slows down password guessing: 20 attempts per 15 minutes per IP
const credentialsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many attempts. Please wait a few minutes and try again.",
  },
});

router.post("/logout", logout);

router.use(requireDb);
router.post(
  "/register",
  credentialsLimiter,
  validateBody(registerSchema),
  register,
);
router.post("/login", credentialsLimiter, validateBody(loginSchema), login);
router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, validateBody(updateProfileSchema), updateMe);
router.delete(
  "/me",
  requireAuth,
  credentialsLimiter,
  validateBody(deleteAccountSchema),
  deleteMe,
);
router.put(
  "/password",
  requireAuth,
  credentialsLimiter,
  validateBody(changePasswordSchema),
  changePassword,
);

export default router;
