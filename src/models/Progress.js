const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
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
      enum: ["DSA", "DBMS", "OS", "CN", "VOCAB", "OOPS", "RESUME"],
    },
    completedItems: {
      type: [String],
      default: [],
    },
    customItems: {
      type: [
        {
          itemId: {
            type: String,
            required: true,
            trim: true,
          },
          label: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      default: [],
    },
    totalItems: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, phase: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);
