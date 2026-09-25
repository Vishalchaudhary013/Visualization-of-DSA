import { Router } from "express";
import { ping, demo } from "../controllers/system.controller.js";

const router = Router();

router.get("/ping", ping);
router.get("/demo", demo);

export default router;
