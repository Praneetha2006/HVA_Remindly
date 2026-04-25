import express from "express";
import {
  addTopic,
  getTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
  markTopicRevised
} from "../controllers/topicController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addTopic);
router.get("/", protect, getTopics);
router.get("/:id", protect, getTopicById);
router.put("/:id", protect, updateTopic);
router.delete("/:id", protect, deleteTopic);
router.post("/:id/mark-revised", protect, markTopicRevised);

export default router;