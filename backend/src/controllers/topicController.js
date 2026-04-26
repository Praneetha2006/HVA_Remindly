import Topic from "../models/Topic.js";
import User from "../models/User.js";
import RevisionSchedule from "../models/RevisionSchedule.js";
import { createRevisionSchedule } from "../services/revisionService.js";
import { calculateTopicStatus } from "../utils/calculateStatus.js";

export const addTopic = async (req, res) => {
  try {
    const { title, explanation, nextRevisionDate } = req.body;

    if (!title || !explanation) {
      return res.status(400).json({
        success: false,
        message: "Title and explanation required"
      });
    }

    // Validate word count (frontend sends 10-100 words)
    const wordCount = explanation.trim().split(/\s+/).length;
    if (wordCount < 10) {
      return res.status(400).json({
        success: false,
        message: "Explanation must have at least 10 words"
      });
    }

    if (wordCount > 100) {
      return res.status(400).json({
        success: false,
        message: "Explanation must not exceed 100 words"
      });
    }

    // Parse nextRevisionDate as local date (YYYY-MM-DD format)
    let nextRevisionAt = null;
    if (nextRevisionDate) {
      const [year, month, day] = nextRevisionDate.split('-');
      nextRevisionAt = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      // If no revision date provided, automatically set to today for immediate review
      nextRevisionAt = new Date();
      nextRevisionAt.setHours(0, 0, 0, 0); // Set to start of today
    }

    const topic = await Topic.create({
      userId: req.user._id,
      title,
      explanation,
      nextRevisionAt
    });

    // Create revision schedule with intervals [7, 30] (week, month)
    await createRevisionSchedule(req.user._id, topic._id, [7, 30]);

    // Calculate status dynamically
    const topicObj = topic.toObject();
    topicObj.status = calculateTopicStatus(topicObj);

    res.status(201).json({
      success: true,
      message: "Topic created successfully",
      topic: topicObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create topic",
      error: error.message
    });
  }
};

export const getTopics = async (req, res) => {
  try {
    const topics = await Topic.find({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    // Calculate status dynamically based on isCompleted and nextRevisionAt
    const topicsWithStatus = topics.map(topic => {
      const topicObj = topic.toObject();
      topicObj.status = calculateTopicStatus(topicObj);
      return topicObj;
    });

    res.json({
      success: true,
      topics: topicsWithStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch topics"
    });
  }
};

export const getTopicById = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await Topic.findById(id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found"
      });
    }

    // Check if user owns this topic
    if (topic.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this topic"
      });
    }

    // Calculate status dynamically
    const topicObj = topic.toObject();
    topicObj.status = calculateTopicStatus(topicObj);

    res.json({
      success: true,
      message: "Topic fetched successfully",
      topic: topicObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch topic",
      error: error.message
    });
  }
};

export const updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, explanation, category, nextRevisionDate } = req.body;

    const topic = await Topic.findById(id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found"
      });
    }

    // Check if user owns this topic
    if (topic.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this topic"
      });
    }

    if (title) topic.title = title;
    if (explanation) topic.explanation = explanation;
    if (category) topic.category = category;
    
    // Handle nextRevisionDate if provided
    if (nextRevisionDate) {
      const [year, month, day] = nextRevisionDate.split('-');
      topic.nextRevisionAt = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    await topic.save();

    // Calculate status dynamically
    const topicObj = topic.toObject();
    topicObj.status = calculateTopicStatus(topicObj);

    res.json({
      success: true,
      message: "Topic updated successfully",
      topic: topicObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update topic",
      error: error.message
    });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await Topic.findById(id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found"
      });
    }

    // Check if user owns this topic
    if (topic.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this topic"
      });
    }

    await Topic.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Topic deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete topic",
      error: error.message
    });
  }
};

export const markTopicRevised = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await Topic.findById(id);

    if (!topic) {
      return res.status(404).json({
        message: "Topic not found"
      });
    }

    // Check if user owns this topic
    if (topic.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to mark this topic"
      });
    }

    // Mark the current revision as completed
    const currentRevision = await RevisionSchedule.findOne({
      topicId: id,
      completedDate: null
    }).sort({ scheduledDate: 1 });

    if (currentRevision) {
      currentRevision.completedDate = new Date();
      await currentRevision.save();
    }

    // Find the next scheduled revision
    const nextRevision = await RevisionSchedule.findOne({
      topicId: id,
      completedDate: null
    }).sort({ scheduledDate: 1 });

    // Update topic
    topic.lastRevisedAt = new Date();
    
    if (nextRevision) {
      // Set nextRevisionAt to the next scheduled revision
      topic.nextRevisionAt = nextRevision.scheduledDate;
      topic.isCompleted = false;
    } else {
      // No more revisions, mark as completed
      topic.isCompleted = true;
    }

    await topic.save();

    // Update user points and streak
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        $inc: { points: 10, streak: 1 },
        streakLastUpdatedAt: new Date()
      },
      { new: true }
    );

    // Calculate status dynamically
    const topicObj = topic.toObject();
    topicObj.status = calculateTopicStatus(topicObj);

    res.status(200).json({
      success: true,
      message: "✅ Topic marked as revised",
      topic: topicObj,
      userStreak: updatedUser.streak
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark topic as revised",
      error: error.message
    });
  }
};

export const checkAndUpdateStreak = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const topics = await Topic.find({ userId: req.user._id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user completed any revision TODAY
    const completedTodayTopics = topics.filter(topic => {
      if (!topic.lastRevisedAt) return false;
      
      const lastRevised = new Date(topic.lastRevisedAt);
      lastRevised.setHours(0, 0, 0, 0);
      
      return lastRevised.getTime() === today.getTime();
    });

    // Check for pending (overdue or due today) topics
    const pendingTopics = topics.filter(topic => {
      if (topic.isCompleted || !topic.nextRevisionAt) return false;

      const dateString = typeof topic.nextRevisionAt === 'string'
        ? topic.nextRevisionAt.split('T')[0]
        : new Date(topic.nextRevisionAt).toISOString().split('T')[0];

      const [year, month, day] = dateString.split('-');
      const revisionDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      revisionDate.setHours(0, 0, 0, 0);

      return revisionDate <= today;
    });

    // Logic: 
    // If user completed revisions today -> keep streak
    // If user has no pending topics -> keep streak
    // If user has pending topics but didn't complete any today AND didn't complete any yesterday -> reset streak
    if (completedTodayTopics.length === 0 && pendingTopics.length > 0) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const completedYesterdayTopics = topics.filter(topic => {
        if (!topic.lastRevisedAt) return false;
        
        const lastRevised = new Date(topic.lastRevisedAt);
        lastRevised.setHours(0, 0, 0, 0);
        
        return lastRevised.getTime() === yesterday.getTime();
      });

      // Reset streak only if they didn't complete anything yesterday either
      if (completedYesterdayTopics.length === 0) {
        user.streak = 0;
        await user.save();
      }
    }

    res.json({
      success: true,
      streak: user.streak,
      completedToday: completedTodayTopics.length,
      hasPendingTopics: pendingTopics.length > 0,
      pendingCount: pendingTopics.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to check streak",
      error: error.message
    });
  }
};