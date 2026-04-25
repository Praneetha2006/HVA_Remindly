import express from "express";
import {
  generateQuiz,
  evaluateExplanation,
  generateAdaptiveQuiz
} from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate-quiz", protect, generateQuiz);
router.post("/evaluate-explanation", protect, evaluateExplanation);
router.post("/generate-adaptive-quiz", protect, generateAdaptiveQuiz);

export default router;
