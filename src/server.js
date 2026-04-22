const app = require("./app");
const connectDB = require("./config/db");
const env = require("./config/env");
const path = require("path");
const { spawnSync } = require("child_process");
const Question = require("./models/Question");

const ensureQuestionSeedData = async () => {
  const autoSeedEnabled = String(process.env.AUTO_SEED_ON_EMPTY || "true").toLowerCase() !== "false";
  if (!autoSeedEnabled) return;

  const questionCount = await Question.estimatedDocumentCount();
  if (questionCount > 0) {
    console.log(`Question bank already present (${questionCount} questions).`);
    return;
  }

  console.warn("Question bank is empty. Running one-time seed script...");
  const seedScriptPath = path.resolve(__dirname, "../scripts/seedQuestions.js");
  const seedResult = spawnSync(process.execPath, [seedScriptPath], {
    stdio: "inherit",
    env: process.env,
  });

  if (seedResult.status !== 0) {
    console.error("Auto-seed failed. Service will continue, but tests may show no questions.");
  }
};

(async () => {
  await connectDB();
  await ensureQuestionSeedData();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
})();
