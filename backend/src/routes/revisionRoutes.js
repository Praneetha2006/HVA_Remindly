import express from "express";
import {
  getRevisions,
  markRevisionComplete
} from "../controllers/revisionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getRevisions);
router.put("/:revisionId/complete", protect, markRevisionComplete);

export default router;