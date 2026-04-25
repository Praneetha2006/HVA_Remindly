import express from "express";
import {
  startAdaptiveQuiz,
  submitAdaptiveAnswer,
  getNextAdaptiveQuestion,
  finishAdaptiveQuiz
} from "../controllers/adaptiveQuizController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start", protect, startAdaptiveQuiz);
router.post("/answer", protect, submitAdaptiveAnswer);
router.post("/next", protect, getNextAdaptiveQuestion);
router.post("/finish", protect, finishAdaptiveQuiz);

export default router;