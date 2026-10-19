import { Router } from "express";
import {
  getRobots,
  getSitemap,
  getSitemapPart,
} from "../controllers/seo.controller.js";

const router = Router();

router.get("/robots.txt", getRobots);
router.get("/sitemap.xml", getSitemap);
router.get("/sitemap-:part.xml", getSitemapPart);

export default router;
