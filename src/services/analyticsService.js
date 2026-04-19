const Progress = require("../models/Progress");
const TestHistory = require("../models/TestHistory");

const CORE_PHASES = ["DSA", "DBMS", "OS", "CN", "VOCAB", "OOPS"];

const normalizeDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isToday = (dateValue) => {
  if (!dateValue) return false;
  const today = normalizeDate(new Date());
  const candidate = normalizeDate(new Date(dateValue));
  return today.getTime() === candidate.getTime();
};

const calculateProgressPercent = (completed, total) => {
  if (!total) return 0;
  return Number(((completed / total) * 100).toFixed(2));
};

const getProgressSummary = async (userId) => {
  const progressDocs = await Progress.find({ userId }).lean();

  const phaseWise = progressDocs.map((doc) => ({
    phase: doc.phase,
    completed: doc.completedItems.length,
    total: doc.totalItems,
    percent: calculateProgressPercent(doc.completedItems.length, doc.totalItems),
    isComplete: doc.completedItems.length >= doc.totalItems,
    updatedAt: doc.updatedAt,
  }));

  const phaseMap = new Map(phaseWise.map((item) => [item.phase, item]));
  const missingCorePhases = CORE_PHASES.filter((phase) => {
    const item = phaseMap.get(phase);
    return !item || !item.isComplete;
  });

  const dailyChecklistUpdated = phaseWise.some((item) => isToday(item.updatedAt));

  const totalCompleted = phaseWise.reduce((sum, item) => sum + item.completed, 0);
  const totalItems = phaseWise.reduce((sum, item) => sum + item.total, 0);

  return {
    phaseWise,
    overallPercent: calculateProgressPercent(totalCompleted, totalItems),
    totalCompleted,
    totalItems,
    allCoreCompleted: missingCorePhases.length === 0,
    missingCorePhases,
    dailyChecklistUpdated,
  };
};

const getWeakTopics = async (userId, limit = 5) => {
  const historyDocs = await TestHistory.find({ userId }).select("topicBreakdown").lean();

  const topicMap = new Map();
  for (const history of historyDocs) {
    for (const item of history.topicBreakdown) {
      const existing = topicMap.get(item.topic) || { topic: item.topic, correct: 0, total: 0 };
      existing.correct += item.correct;
      existing.total += item.total;
      topicMap.set(item.topic, existing);
    }
  }

  const topicStats = Array.from(topicMap.values()).map((item) => {
    const accuracy = item.total ? Number(((item.correct / item.total) * 100).toFixed(2)) : 0;
    const weaknessScore = Number((((100 - accuracy) / 100) * Math.log(item.total + 1)).toFixed(4));
    return { ...item, accuracy, weaknessScore };
  });

  topicStats.sort((a, b) => b.weaknessScore - a.weaknessScore);
  return topicStats.slice(0, limit);
};

const getAccuracySnapshot = async (userId) => {
  const tests = await TestHistory.find({ userId }).lean();
  if (!tests.length) return { overallAccuracy: 0, totalTests: 0 };

  const totalCorrect = tests.reduce((sum, item) => sum + item.correctCount, 0);
  const totalQuestions = tests.reduce((sum, item) => sum + item.total, 0);

  return {
    overallAccuracy: totalQuestions ? Number(((totalCorrect / totalQuestions) * 100).toFixed(2)) : 0,
    totalTests: tests.length,
  };
};

const getPhaseAccuracySnapshot = async (userId) => {
  const tests = await TestHistory.find({ userId }).select("phase score total").lean();

  const phaseMap = new Map();
  for (const test of tests) {
    const existing = phaseMap.get(test.phase) || { phase: test.phase, score: 0, total: 0, attempts: 0 };
    existing.score += test.score;
    existing.total += test.total;
    existing.attempts += 1;
    phaseMap.set(test.phase, existing);
  }

  return Array.from(phaseMap.values())
    .map((item) => ({
      phase: item.phase,
      accuracy: item.total ? Number(((item.score / item.total) * 100).toFixed(2)) : 0,
      attempts: item.attempts,
    }))
    .sort((a, b) => a.phase.localeCompare(b.phase));
};

const getRecentTrend = async (userId, count = 8) => {
  const recent = await TestHistory.find({ userId })
    .sort({ createdAt: -1 })
    .limit(count)
    .select("phase score total createdAt")
    .lean();

  return recent
    .reverse()
    .map((test) => ({
      phase: test.phase,
      accuracy: Number(((test.score / test.total) * 100).toFixed(2)),
      date: test.createdAt,
    }));
};

module.exports = {
  calculateProgressPercent,
  getProgressSummary,
  getWeakTopics,
  getAccuracySnapshot,
  getPhaseAccuracySnapshot,
  getRecentTrend,
  isToday,
};
