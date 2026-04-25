import express from "express";
import {
  submitQuizResult,
  getQuizResults
} from "../controllers/quizResultsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, submitQuizResult);
router.get("/:topicId", protect, getQuizResults);

export default router;
