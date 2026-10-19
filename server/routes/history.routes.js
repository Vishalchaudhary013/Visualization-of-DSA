import { Router } from "express";
import {
  clearHistory,
  createHistory,
  deleteHistory,
  getStats,
  listHistory,
  updateHistory,
} from "../controllers/history.controller.js";
import { requireAuth, requireDb } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import {
  createHistorySchema,
  updateHistorySchema,
} from "../validation/schemas.js";

const router = Router();

router.use(requireDb, requireAuth);
router.get("/", listHistory);
router.get("/stats", getStats);
router.post("/", validateBody(createHistorySchema), createHistory);
router.patch("/:id", validateBody(updateHistorySchema), updateHistory);
router.delete("/:id", deleteHistory);
router.delete("/", clearHistory);

export default router;
