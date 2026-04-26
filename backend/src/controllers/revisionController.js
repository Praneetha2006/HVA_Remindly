import RevisionSchedule from "../models/RevisionSchedule.js";
import Topic from "../models/Topic.js";
import User from "../models/User.js";
import { calculateRevisionStatus } from "../utils/calculateStatus.js";

/* =========================
   GET REVISIONS
========================= */
export const getRevisions = async (req, res) => {
  try {
    const { filter } = req.query;

    const revisions = await RevisionSchedule.find({
      userId: req.user._id,
    })
      .populate("topicId", "title explanation memoryStrength")
      .sort({ scheduledDate: 1 });

    const data = revisions.map((revision) => {
      const status = calculateRevisionStatus(revision);

      return {
        _id: revision._id,
        topic: revision.topicId,
        revisionNumber: revision.revisionNumber,
        scheduledDate: revision.scheduledDate,
        completedDate: revision.completedDate,
        quizScore: revision.quizScore,
        oralDefensePassed: revision.oralDefensePassed,
        status,
      };
    });

    if (!filter || filter === "all") {
      return res.status(200).json(data);
    }

    const filteredData = data.filter((item) => item.status === filter);

    res.status(200).json(filteredData);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch revisions",
      error: error.message,
    });
  }
};

/* =========================
   MARK REVISION COMPLETE
========================= */
export const markRevisionComplete = async (req, res) => {
  try {
    const { revisionId } = req.params;
    const { quizScore } = req.body;

    // 🔍 Find revision
    const revision = await RevisionSchedule.findOne({
      _id: revisionId,
      userId: req.user._id,
    });

    if (!revision) {
      return res.status(404).json({
        message: "Revision not found",
      });
    }

    // 🚫 Prevent duplicate
    if (revision.completedDate) {
      return res.status(400).json({
        message: "Revision already completed",
      });
    }

    // ✅ Mark complete
    revision.completedDate = new Date();

    if (quizScore !== undefined) {
      revision.quizScore = quizScore;
    }

    await revision.save();

    // 🔥 IMPORTANT: Update topic (Dashboard fix)
    await Topic.findByIdAndUpdate(revision.topicId, {
      lastRevisedAt: new Date(),
      memoryStrength: 100,
      status: "completed", // ✅ REQUIRED
    });

    /* =========================
       STREAK LOGIC
    ========================= */

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRevisions = await RevisionSchedule.find({
      userId: req.user._id,
      scheduledDate: { $gte: todayStart, $lt: tomorrow },
    });

    const user = await User.findById(req.user._id);

    let updateQuery = {
      $inc: {
        totalRevisions: 1,
        points: 10,
      },
    };

    if (todayRevisions.length > 0) {
      const completedCount = todayRevisions.filter(
        (r) => r.completedDate
      ).length;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const last = user.lastStreakDate
        ? new Date(user.lastStreakDate)
        : null;

      const isSameDay =
        last &&
        last.getFullYear() === today.getFullYear() &&
        last.getMonth() === today.getMonth() &&
        last.getDate() === today.getDate();

      if (completedCount > 0) {
        if (!isSameDay) {
          updateQuery.$inc.streak = 1;
          updateQuery.$set = { lastStreakDate: new Date() };
        }

        if (completedCount === todayRevisions.length) {
          updateQuery.$inc.points += 20;
        }
      } else {
        updateQuery.$set = { streak: 0 };
      }
    }

    // ✅ FIRST: update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateQuery,
      { new: true }
    );

    // ✅ THEN: fetch updated revision
    const updatedRevision = await RevisionSchedule.findById(
      revision._id
    ).populate("topicId", "title explanation memoryStrength");

    const status = calculateRevisionStatus(updatedRevision);

    /* =========================
       RESPONSE
    ========================= */
    res.status(200).json({
      message: "Revision marked as completed",
      revision: {
        _id: updatedRevision._id,
        topic: updatedRevision.topicId,
        revisionNumber: updatedRevision.revisionNumber,
        scheduledDate: updatedRevision.scheduledDate,
        completedDate: updatedRevision.completedDate,
        quizScore: updatedRevision.quizScore,
        oralDefensePassed: updatedRevision.oralDefensePassed,
        status,
      },
      streak: updatedUser.streak,
      points: updatedUser.points,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to complete revision",
      error: error.message,
    });
  }
};