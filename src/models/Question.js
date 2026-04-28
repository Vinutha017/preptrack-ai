const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length === 4,
        message: "Question must have exactly 4 options",
      },
    },
    answer: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    phase: {
      type: String,
      required: true,
      enum: ["DSA", "DBMS", "OS", "CN", "VOCAB", "OOPS", "RESUME"],
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
      index: true,
    },
    isInterviewFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    interviewWeight: {
      type: Number,
      min: 1,
      max: 10,
      default: 1,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
