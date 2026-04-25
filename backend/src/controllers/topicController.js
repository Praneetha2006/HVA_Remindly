import Topic from "../models/Topic.js";
import User from "../models/User.js";
import { createRevisionSchedule } from "../services/revisionService.js";

export const addTopic = async (req, res) => {
  try {
    const { title, explanation, nextRevisionDate } = req.body;

    if (!title || !explanation) {
      return res.status(400).json({
        success: false,
        message: "Title and explanation required"
      });
    }

    if (explanation.length < 50) {
      return res.status(400).json({
        success: false,
        message: "Explanation must be at least 50 words"
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

    // Create revision schedule with intervals [0, 1, 7, 30] (today, tomorrow, week, month)
    await createRevisionSchedule(req.user._id, topic._id, [0, 1, 7, 30]);

    res.status(201).json({
      success: true,
      message: "Topic created successfully",
      topic
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

    res.json({
      success: true,
      topics
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

    res.json({
      success: true,
      message: "Topic fetched successfully",
      topic
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

    res.json({
      success: true,
      message: "Topic updated successfully",
      topic
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

    topic.lastRevised = new Date();
    topic.status = "revised";

    await topic.save();

    // Update user points
    await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { points: 10 } }
    );

    res.json({
      message: "Topic marked as revised",
      topic
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark topic as revised",
      error: error.message
    });
  }
};