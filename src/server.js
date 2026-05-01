const app = require("./app");
const connectDB = require("./config/db");
const env = require("./config/env");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const Question = require("./models/Question");

const frontendDistCandidates = [
  path.resolve(process.cwd(), "frontend/dist"),
  path.resolve(process.cwd(), "dist"),
  path.resolve(__dirname, "../frontend/dist"),
  path.resolve(__dirname, "../dist"),
  path.resolve(__dirname, "../../frontend/dist"),
  path.resolve(__dirname, "../../dist"),
];

const frontendDistExists = () => frontendDistCandidates.some((candidate) => fs.existsSync(candidate));

const ensureFrontendBuild = () => {
  if (frontendDistExists()) {
    return;
  }

  console.warn("Frontend dist not found at startup. Building frontend assets now...");
  const buildResult = spawnSync("npm", ["--prefix", "frontend", "run", "build"], {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });

  if (buildResult.status !== 0) {
    console.error("Frontend build failed during startup. Service will continue without serving the UI.");
  }
};

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
  ensureFrontendBuild();
  await connectDB();
  // Auto-seed disabled; use /api/admin/seed-once endpoint instead to avoid conflicts.
  // await ensureQuestionSeedData();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
})();
