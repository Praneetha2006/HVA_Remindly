import { generateAdaptiveQuestions, evaluateVoiceUnderstanding } from "../services/aiService.js";
import Topic from "../models/Topic.js";

export const generateQuiz = async (req, res) => {
  try {
    const { topic, explanation } = req.body;

    if (!topic || !explanation) {
      return res.status(400).json({
        success: false,
        message: "Topic and explanation are required"
      });
    }

    const questionPool = await generateAdaptiveQuestions(topic, explanation);

    // Create adaptive pool: flatten all questions for adaptive selection
    const adaptiveQuestions = [
      ...(questionPool.easy || []),
      ...(questionPool.medium || []),
      ...(questionPool.hard || []),
      ...(questionPool.other || [])
    ];

    res.json({
      success: true,
      message: "Quiz generated successfully",
      questions: adaptiveQuestions,
      questionPool: {
        easy: questionPool.easy || [],
        medium: questionPool.medium || [],
        hard: questionPool.hard || [],
        other: questionPool.other || []
      }
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate quiz",
      error: error.message
    });
  }
};

export const evaluateExplanation = async (req, res) => {
  try {
    const { topic, originalExplanation, recordingDuration } = req.body;

    if (!topic || !originalExplanation) {
      return res.status(400).json({
        success: false,
        message: "Topic and explanation are required"
      });
    }

    // Use AI to evaluate the voice recording
    const evaluation = await evaluateVoiceUnderstanding(
      topic,
      originalExplanation,
      recordingDuration || 30 // Default 30 seconds if not provided
    );

    res.json({
      success: true,
      message: "Explanation evaluated",
      score: evaluation.score,
      feedback: evaluation.feedback,
      isUnlocked: evaluation.isUnlocked,
      missingConcepts: evaluation.missingConcepts,
      encouragement: evaluation.encouragement
    });
  } catch (error) {
    console.error("Error evaluating explanation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to evaluate explanation",
      error: error.message
    });
  }
};

export const generateAdaptiveQuiz = async (req, res) => {
  try {
    const { topic, explanation } = req.body;

    if (!topic || !explanation) {
      return res.status(400).json({
        message: "Topic and explanation are required"
      });
    }

    const questions = await generateAdaptiveQuestions(topic, explanation);

    res.json({
      message: "Adaptive quiz generated",
      questions
    });
  } catch (error) {
    console.error("Error generating adaptive quiz:", error);
    res.status(500).json({
      message: "Failed to generate adaptive quiz",
      error: error.message
    });
  }
};
