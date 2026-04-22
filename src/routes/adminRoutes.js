const express = require("express");
const { spawnSync } = require("child_process");
const path = require("path");
const Question = require("../models/Question");

const router = express.Router();

router.get("/seed-once", async (req, res, next) => {
  try {
    const questionCount = await Question.estimatedDocumentCount();
    
    if (questionCount > 0) {
      return res.json({
        message: `Question bank already populated with ${questionCount} questions. Skipping seed.`,
        count: questionCount,
      });
    }

    console.warn("Question bank is empty. Running seed script...");
    const seedScriptPath = path.resolve(__dirname, "../../scripts/seedQuestions.js");
    const seedResult = spawnSync(process.execPath, [seedScriptPath], {
      stdio: "pipe",
      env: process.env,
    });

    if (seedResult.status === 0) {
      const newCount = await Question.estimatedDocumentCount();
      return res.json({
        message: `Seed completed successfully. Inserted ${newCount} questions.`,
        count: newCount,
      });
    } else {
      const error = seedResult.stderr ? seedResult.stderr.toString() : "Unknown error";
      return res.status(500).json({
        message: "Seed failed.",
        error,
      });
    }
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
