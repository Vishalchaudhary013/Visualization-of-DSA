import { Router } from "express";
import assistantRoutes from "./assistant.routes.js";
import authRoutes from "./auth.routes.js";
import historyRoutes from "./history.routes.js";
import systemRoutes from "./system.routes.js";

const router = Router();

router.use("/assistant", assistantRoutes);
router.use("/auth", authRoutes);
router.use("/history", historyRoutes);
router.use("/", systemRoutes);

// Unknown API routes get JSON instead of the SPA's index.html
router.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default router;
