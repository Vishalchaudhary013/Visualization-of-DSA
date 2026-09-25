import { Router } from "express";
import assistantRoutes from "./assistant.routes.js";
import systemRoutes from "./system.routes.js";

const router = Router();

router.use("/assistant", assistantRoutes);
router.use("/", systemRoutes);

export default router;
