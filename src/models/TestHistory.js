const mongoose = require("mongoose");

const topicBreakdownSchema = new mongoose.Schema(
  {
    topic: String,
    correct: Number,
    total: Number,
    accuracy: Number,
  },
  { _id: false }
);

const testHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    phase: {
      type: String,
      required: true,
      enum: ["DSA", "DBMS", "OS", "CN", "VOCAB", "OOPS", "RESUME", "FINAL"],
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 1,
    },
    correctCount: {
      type: Number,
      required: true,
      min: 0,
    },
    questionsUsed: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Question",
      default: [],
    },
    topicBreakdown: {
      type: [topicBreakdownSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestHistory", testHistorySchema);
