const mongoose = require("mongoose");

const studyItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true,
    },
    phase: {
      type: String,
      required: true,
      enum: ["DSA", "DBMS", "OS", "CN", "VOCAB", "OOPS", "FINAL"],
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    bookmarked: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

studyItemSchema.index({ userId: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model("StudyItem", studyItemSchema);