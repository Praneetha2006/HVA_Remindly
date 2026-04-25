import mongoose from "mongoose";

const revisionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true
    },

    revisionNumber: {
      type: Number
    },

    scheduledDate: {
      type: Date,
      required: true
    },

    completedDate: {
      type: Date
    },

    quizScore: {
      type: Number
    },

    oralDefensePassed: {
      type: Boolean,
      default: false
    },

    adaptiveMultiplier: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 3.0
    }
  },
  {
    timestamps: true
  }
);

const RevisionSchedule = mongoose.model(
  "RevisionSchedule",
  revisionSchema
);

export default RevisionSchedule;