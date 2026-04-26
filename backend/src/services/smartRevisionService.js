import RevisionSchedule from "../models/RevisionSchedule.js";
import QuizAttempt from "../models/QuizAttempt.js";

/**
 * Smart Revision System
 * - Base intervals: Day 7, 30
 * - Adaptive multiplier based on quiz performance
 * - Low score (< 60%) → 0.7x multiplier (shorter intervals)
 * - Medium score (60-80%) → 1.0x multiplier (standard)
 * - High score (> 80%) → 1.5x multiplier (longer intervals)
 */

export const createSmartRevisionSchedule = async (userId, topicId, quizScore = null) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Base intervals in days
  const BASE_INTERVALS = [7, 30];

  // Calculate adaptive multiplier based on quiz score
  let adaptiveMultiplier = 1.0;
  if (quizScore !== null) {
    if (quizScore < 60) {
      adaptiveMultiplier = 0.7; // Low score: shorter intervals
    } else if (quizScore > 80) {
      adaptiveMultiplier = 1.5; // High score: longer intervals
    }
  }

  // Apply multiplier to intervals
  const adjustedIntervals = BASE_INTERVALS.map(days =>
    Math.ceil(days * adaptiveMultiplier)
  );

  // Create revision schedules
  const schedules = adjustedIntervals.map((days, index) => {
    const scheduledDate = new Date(today);
    scheduledDate.setDate(scheduledDate.getDate() + days);

    return {
      userId,
      topicId,
      revisionNumber: index + 1,
      scheduledDate,
      adaptiveMultiplier
    };
  });

  const created = await RevisionSchedule.insertMany(schedules);
  return {
    schedules: created,
    adaptiveMultiplier,
    baseIntervals: BASE_INTERVALS,
    adjustedIntervals
  };
};

/**
 * Get upcoming revisions for a user
 */
export const getUpcomingRevisions = async (userId, daysAhead = 7) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const revisions = await RevisionSchedule.find({
    userId,
    scheduledDate: { $gte: today, $lte: futureDate },
    completedDate: { $exists: false }
  })
    .populate("topicId", "title category memoryStrength")
    .sort({ scheduledDate: 1 });

  return revisions;
};

/**
 * Recalculate revision schedule based on latest quiz performance
 */
export const recalculateRevisionSchedule = async (userId, topicId, latestQuizScore) => {
  // Delete existing incomplete schedules for this topic
  await RevisionSchedule.deleteMany({
    userId,
    topicId,
    completedDate: { $exists: false }
  });

  // Create new schedule with updated multiplier
  return createSmartRevisionSchedule(userId, topicId, latestQuizScore);
};

/**
 * Get revision statistics for dashboard
 */
export const getRevisionStats = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const stats = {
    dueToday: await RevisionSchedule.countDocuments({
      userId,
      scheduledDate: { $lt: tomorrow },
      completedDate: { $exists: false }
    }),
    overdueCount: await RevisionSchedule.countDocuments({
      userId,
      scheduledDate: { $lt: today },
      completedDate: { $exists: false }
    }),
    completedThisWeek: await RevisionSchedule.countDocuments({
      userId,
      completedDate: {
        $gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      }
    })
  };

  return stats;
};
