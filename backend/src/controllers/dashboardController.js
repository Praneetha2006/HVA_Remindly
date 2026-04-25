import RevisionSchedule from "../models/RevisionSchedule.js";
import Topic from "../models/Topic.js";
import { calculateRevisionStatus } from "../utils/calculateStatus.js";

export const getDashboard = async (req, res) => {
  try {
    const revisions = await RevisionSchedule.find({
      userId: req.user._id
    }).populate("topicId", "title explanation memoryStrength");

    const topics = await Topic.find({
      userId: req.user._id
    });

    const revisionsWithStatus = revisions.map((revision) => {
      const status = calculateRevisionStatus(revision);

      return {
        _id: revision._id,
        topic: revision.topicId,
        revisionNumber: revision.revisionNumber,
        scheduledDate: revision.scheduledDate,
        completedDate: revision.completedDate,
        quizScore: revision.quizScore,
        oralDefensePassed: revision.oralDefensePassed,
        status
      };
    });

    const todayTasks = revisionsWithStatus.filter(
      (item) => item.status === "pending"
    );

    const overdueTasks = revisionsWithStatus.filter(
      (item) => item.status === "overdue"
    );

    const completedTasks = revisionsWithStatus.filter(
      (item) => item.status === "completed"
    );

    const upcomingTasks = revisionsWithStatus.filter(
      (item) => item.status === "upcoming"
    );

    res.status(200).json({
      totalTopics: topics.length,
      totalRevisions: revisions.length,
      todayCount: todayTasks.length,
      overdueCount: overdueTasks.length,
      completedCount: completedTasks.length,
      pendingCount: todayTasks.length,
      upcomingCount: upcomingTasks.length,

      progress: {
        completed: completedTasks.length,
        pending: todayTasks.length,
        overdue: overdueTasks.length,
        upcoming: upcomingTasks.length
      },

      todayTasks,
      overdueTasks,
      upcomingTasks,
      completedTasks
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load dashboard",
      error: error.message
    });
  }
};