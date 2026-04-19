const { getAccuracySnapshot, getProgressSummary, getWeakTopics } = require("./analyticsService");

const calculateReadinessScore = ({ progressPercent, accuracyPercent, streak, dailyChecklistUpdated }) => {
  const streakBonus = Math.min(streak * 3, 15);
  const checklistBonus = dailyChecklistUpdated ? 5 : 0;
  const score = Math.round(progressPercent * 0.45 + accuracyPercent * 0.4 + streakBonus + checklistBonus);
  return Math.max(0, Math.min(100, score));
};

const scoreLabel = (score) => {
  if (score >= 80) return "Interview ready";
  if (score >= 65) return "Nearly ready";
  if (score >= 45) return "Building momentum";
  return "Needs revision";
};

const buildRecommendations = async (user) => {
  const [weakTopics, progress, accuracy] = await Promise.all([
    getWeakTopics(user._id, 5),
    getProgressSummary(user._id),
    getAccuracySnapshot(user._id),
  ]);

  const readinessScore = calculateReadinessScore({
    progressPercent: progress.overallPercent,
    accuracyPercent: accuracy.overallAccuracy,
    streak: user.streak || 0,
    dailyChecklistUpdated: progress.dailyChecklistUpdated,
  });

  const suggestions = [];
  const nextTopics = weakTopics.slice(0, 3).map((topic, index) => ({
    rank: index + 1,
    topic: topic.topic,
    accuracy: topic.accuracy,
    advice: topic.total >= 3 ? `Revise ${topic.topic} with 5 quick MCQs.` : `Start with basics of ${topic.topic}.`,
  }));

  if (!weakTopics.length) {
    suggestions.push("No weak topics identified yet. Attempt a subject test to unlock smart suggestions.");
  }

  weakTopics.forEach((topic) => {
    suggestions.push(`You are weak in ${topic.topic} (${topic.accuracy}% accuracy) - revise this topic.`);
  });

  if (user.streak < 3) {
    suggestions.push("Build momentum: complete at least one checklist item daily to improve your streak.");
  }

  suggestions.push("Adaptive mode tip: attempt your next test with adaptive=true to focus on weak topics.");

  return {
    readinessScore,
    readinessLabel: scoreLabel(readinessScore),
    weakTopics,
    nextTopics,
    suggestions,
  };
};

module.exports = {
  buildRecommendations,
};
