import mongoose from "mongoose";

const oralDefenseSchema = new mongoose.Schema(
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

    revisionScheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RevisionSchedule"
    },

    userExplanation: {
      type: String,
      required: true
    },

    inputType: {
      type: String,
      enum: ["text", "voice"],
      default: "text"
    },

    aiScore: {
      type: Number,
      default: 0
    },

    missingConcepts: {
      type: [String],
      default: []
    },

    feedback: {
      type: String
    },

    passed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const OralDefense = mongoose.model("OralDefense", oralDefenseSchema);

export default OralDefense;