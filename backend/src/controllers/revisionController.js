import RevisionSchedule from "../models/RevisionSchedule.js";
import Topic from "../models/Topic.js";
import User from "../models/User.js";
import { calculateRevisionStatus } from "../utils/calculateStatus.js";

export const getRevisions = async (req, res) => {
  try {
    const { filter } = req.query;

    const revisions = await RevisionSchedule.find({
      userId: req.user._id
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
        status
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
      error: error.message
    });
  }
};

export const markRevisionComplete = async (req, res) => {
  try {
    const { revisionId } = req.params;
    const { quizScore } = req.body;

    const revision = await RevisionSchedule.findOne({
      _id: revisionId,
      userId: req.user._id
    });

    if (!revision) {
      return res.status(404).json({
        message: "Revision not found"
      });
    }

    revision.completedDate = new Date();

    if (quizScore !== undefined) {
      revision.quizScore = quizScore;
    }

    await revision.save();

    await Topic.findByIdAndUpdate(revision.topicId, {
      lastRevisedAt: new Date(),
      memoryStrength: 100
    });

    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalRevisions: 1,
        points: 10
      }
    });

    res.status(200).json({
      message: "Revision marked as completed",
      revision
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to complete revision",
      error: error.message
    });
  }
};