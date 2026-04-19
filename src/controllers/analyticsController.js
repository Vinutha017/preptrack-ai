const { getProgressSummary, getWeakTopics, getAccuracySnapshot, getPhaseAccuracySnapshot, getRecentTrend } = require("../services/analyticsService");
const { buildRecommendations } = require("../services/recommendationService");

const overview = async (req, res, next) => {
  try {
    const [progress, accuracy, trend] = await Promise.all([
      getProgressSummary(req.user._id),
      getAccuracySnapshot(req.user._id),
      getRecentTrend(req.user._id),
    ]);
    const phaseAccuracy = await getPhaseAccuracySnapshot(req.user._id);
    const recommendations = await buildRecommendations(req.user);

    return res.json({
      progress,
      accuracy,
      trend,
      phaseAccuracy,
      readinessScore: recommendations.readinessScore,
      readinessLabel: recommendations.readinessLabel,
      nextTopics: recommendations.nextTopics,
    });
  } catch (error) {
    return next(error);
  }
};

const weakTopics = async (req, res, next) => {
  try {
    const items = await getWeakTopics(req.user._id, 7);
    return res.json({ weakTopics: items });
  } catch (error) {
    return next(error);
  }
};

const recommendations = async (req, res, next) => {
  try {
    const data = await buildRecommendations(req.user);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  overview,
  weakTopics,
  recommendations,
};
