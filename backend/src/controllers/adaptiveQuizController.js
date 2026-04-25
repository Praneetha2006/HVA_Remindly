import Topic from "../models/Topic.js";
import Quiz from "../models/Quiz.js";
import QuestionCache from "../models/QuestionCache.js";
import QuizAttempt from "../models/QuizAttempt.js";
import User from "../models/User.js";
import RevisionSchedule from "../models/RevisionSchedule.js";
import { generateAdaptiveQuestions } from "../services/aiService.js";

/*
  🔹 Refill cache when low
*/
const refillCacheIfNeeded = async (cache, topic) => {
  if (
    cache.easy.length < 2 ||
    cache.medium.length < 2 ||
    cache.hard.length < 2
  ) {
    const newData = await generateAdaptiveQuestions(
      topic.title,
      topic.explanation
    );

    cache.easy.push(...(newData.easy || []));
    cache.medium.push(...(newData.medium || []));
    cache.hard.push(...(newData.hard || []));

    await cache.save();
  }
};

/*
  🔹 Get question from cache
*/
const getQuestionFromCache = async (cache, difficulty, topic) => {
  let question;

  if (difficulty === "easy") {
    if (cache.easy.length === 0) {
      await refillCacheIfNeeded(cache, topic);
    }
    question = cache.easy.shift();
  } else if (difficulty === "hard") {
    if (cache.hard.length === 0) {
      await refillCacheIfNeeded(cache, topic);
    }
    question = cache.hard.shift();
  } else {
    if (cache.medium.length === 0) {
      await refillCacheIfNeeded(cache, topic);
    }
    question = cache.medium.shift();
  }

  await cache.save();

  return question;
};

/*
  🔥 START QUIZ
*/
export const startAdaptiveQuiz = async (req, res) => {
  try {
    const { topicId, revisionScheduleId } = req.body;

    const topic = await Topic.findOne({
      _id: topicId,
      userId: req.user._id
    });

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    let cache = await QuestionCache.findOne({
      userId: req.user._id,
      topicId
    });

    if (!cache) {
      const data = await generateAdaptiveQuestions(
        topic.title,
        topic.explanation
      );

      cache = await QuestionCache.create({
        userId: req.user._id,
        topicId,
        easy: data.easy || [],
        medium: data.medium || [],
        hard: data.hard || []
      });
    }

    const quiz = await Quiz.create({
      userId: req.user._id,
      topicId,
      revisionScheduleId,
      currentDifficulty: "medium"
    });

    const question = await getQuestionFromCache(cache, "medium", topic);

    // 🔥 Hide correctAnswer from frontend
    const { correctAnswer, ...safeQuestion } = question._doc;

    // Background refill (no await)
    refillCacheIfNeeded(cache, topic);

    res.json({
      quizId: quiz._id,
      difficulty: "medium",
      question: safeQuestion
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to start quiz",
      error: error.message
    });
  }
};

/*
  🔥 SUBMIT ANSWER (FRONTEND DOES CHECK, BACKEND VALIDATES)
*/
export const submitAdaptiveAnswer = async (req, res) => {
  try {
    const { quizId, topicId, questionText, selectedAnswer } = req.body;

    const quiz = await Quiz.findOne({
      _id: quizId,
      userId: req.user._id,
      status: "in-progress"
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found"
      });
    }

    const cache = await QuestionCache.findOne({
      userId: req.user._id,
      topicId
    });

    if (!cache) {
      return res.status(404).json({
        message: "Cache not found"
      });
    }

    // 🔥 Find correct answer from cache (NOT frontend)
    const allQuestions = [
      ...cache.easy,
      ...cache.medium,
      ...cache.hard
    ];

    const matchedQuestion = allQuestions.find(
      (q) => q.question === questionText
    );

    if (!matchedQuestion) {
      return res.status(400).json({
        message: "Question not found"
      });
    }

    const isCorrect = selectedAnswer === matchedQuestion.correctAnswer;

    await QuizAttempt.create({
      userId: req.user._id,
      quizId,
      topicId,
      question: questionText,
      selectedAnswer,
      correctAnswer: matchedQuestion.correctAnswer,
      isCorrect,
      difficulty: quiz.currentDifficulty
    });

    if (isCorrect) {
      quiz.correctAnswers += 1;
      quiz.correctStreak += 1;
      quiz.wrongStreak = 0;
    } else {
      quiz.wrongAnswers += 1;
      quiz.wrongStreak += 1;
      quiz.correctStreak = 0;
    }

    quiz.totalAnswered += 1;

    // 🔥 Difficulty logic
    if (isCorrect && quiz.correctStreak >= 3) {
      if (quiz.currentDifficulty === "easy") quiz.currentDifficulty = "medium";
      else if (quiz.currentDifficulty === "medium") quiz.currentDifficulty = "hard";

      quiz.correctStreak = 0;
    }

    if (!isCorrect && quiz.wrongStreak >= 2) {
      if (quiz.currentDifficulty === "hard") quiz.currentDifficulty = "medium";
      else if (quiz.currentDifficulty === "medium") quiz.currentDifficulty = "easy";

      quiz.wrongStreak = 0;
    }

    quiz.score = Math.round(
      (quiz.correctAnswers / quiz.totalAnswered) * 100
    );

    await quiz.save();

    res.json({
      isCorrect,
      score: quiz.score,
      difficulty: quiz.currentDifficulty
    });
  } catch (error) {
    res.status(500).json({
      message: "Answer submission failed",
      error: error.message
    });
  }
};

/*
  🔥 NEXT QUESTION
*/
export const getNextAdaptiveQuestion = async (req, res) => {
  try {
    const { quizId, topicId } = req.body;

    const quiz = await Quiz.findById(quizId);

    const topic = await Topic.findById(topicId);

    const cache = await QuestionCache.findOne({
      userId: req.user._id,
      topicId
    });

    const question = await getQuestionFromCache(
      cache,
      quiz.currentDifficulty,
      topic
    );

    const { correctAnswer, ...safeQuestion } = question._doc;

    refillCacheIfNeeded(cache, topic);

    res.json({
      question: safeQuestion,
      difficulty: quiz.currentDifficulty
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get next question"
    });
  }
};

/*
  🔥 FINISH QUIZ
*/
export const finishAdaptiveQuiz = async (req, res) => {
  try {
    const { quizId } = req.body;

    const quiz = await Quiz.findById(quizId);

    quiz.status = "completed";

    await quiz.save();

    await Topic.findByIdAndUpdate(quiz.topicId, {
      lastRevisedAt: new Date(),
      memoryStrength: 100
    });

    const points =
      quiz.score >= 80 ? 20 : quiz.score >= 50 ? 10 : 5;

    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalQuizzes: 1,
        totalRevisions: 1,
        points
      }
    });

    if (quiz.revisionScheduleId) {
      await RevisionSchedule.findByIdAndUpdate(
        quiz.revisionScheduleId,
        {
          completedDate: new Date(),
          quizScore: quiz.score
        }
      );
    }

    res.json({
      message: "Quiz completed",
      score: quiz.score,
      points
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to finish quiz"
    });
  }
};