const TestHistory = require("../models/TestHistory");
const { generateQuestions, evaluateTestSubmission } = require("../services/testEngineService");
const { getProgressSummary } = require("../services/analyticsService");

const stripPracticeSetSuffix = (value) =>
  String(value || "").replace(/\s*\(\s*practice\s*set\s*\d+\s*\)\s*$/i, "");

const normalizeQuestionText = (value) =>
  stripPracticeSetSuffix(value)
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const generateTest = async (req, res, next) => {
  try {
    const { phase, topic, difficulty, limit, adaptive, retakeQuestionIds, excludeQuestionIds } = req.body;
    const selectedPhase = phase || "DBMS";

    const progressSummary = await getProgressSummary(req.user._id, { lastChecklistUpdateAt: req.user.lastChecklistUpdateAt });

    if (selectedPhase === "FINAL") {
      if (!progressSummary.allCoreCompleted) {
        return res.status(403).json({
          message: "Complete all checklist phases (DSA, DBMS, OS, CN, VOCAB, OOPS) before generating final tests.",
          missingCorePhases: progressSummary.missingCorePhases,
        });
      }
    } else {
      const selectedPhaseProgress = progressSummary.phaseWise.find((item) => item.phase === selectedPhase);
      if (!selectedPhaseProgress || !selectedPhaseProgress.isComplete) {
        return res.status(403).json({
          message: `Complete all checklist items for ${selectedPhase} before generating its test.`,
          requiredPhase: selectedPhase,
        });
      }
    }

    if (!progressSummary.dailyChecklistUpdated) {
      return res.status(403).json({
        message: "Update your checklist for today before generating tests.",
      });
    }

    const questions = await generateQuestions({
      userId: req.user._id,
      phase: selectedPhase,
      topic,
      difficulty,
      limit,
      adaptive,
      retakeQuestionIds,
      excludeQuestionIds,
    });

    const uniqueQuestionCount = new Set(questions.map((item) => normalizeQuestionText(item.question)).filter(Boolean)).size;
    if (uniqueQuestionCount !== questions.length) {
      return res.status(409).json({
        message: `Generated set contains duplicate question text for ${selectedPhase}. Please try again.`,
        phase: selectedPhase,
        available: uniqueQuestionCount,
        requested: Number(limit) || questions.length,
      });
    }

    const requestedLimit = Number(limit);
    const requiresExactCount = !retakeQuestionIds?.length && Number.isFinite(requestedLimit) && requestedLimit > 0;
    if (requiresExactCount && questions.length < requestedLimit) {
      return res.status(409).json({
        message: `Only ${questions.length} unique questions are available for ${selectedPhase}. Add more unique questions to this phase to generate ${requestedLimit}.`,
        phase: selectedPhase,
        available: questions.length,
        requested: requestedLimit,
      });
    }

    if (!questions.length) {
      return res.status(404).json({
        message:
          "No questions available for this phase yet. Please seed questions for this database and try again.",
        phase: selectedPhase,
      });
    }

    return res.json({
      count: questions.length,
      questions,
    });
  } catch (error) {
    return next(error);
  }
};

const submitTest = async (req, res, next) => {
  try {
    const { phase, questionIds, answers } = req.body;

    if (!Array.isArray(questionIds) || !Array.isArray(answers)) {
      return res.status(400).json({ message: "questionIds and answers arrays are required" });
    }

    const result = await evaluateTestSubmission({
      phase,
      questionIds,
      answers,
    });

    const history = await TestHistory.create({
      userId: req.user._id,
      phase: phase || "DBMS",
      score: result.score,
      total: result.total,
      correctCount: result.correctCount,
      questionsUsed: result.questionIds,
      topicBreakdown: result.topicBreakdown,
    });

    const improvementAreas = [...result.topicBreakdown]
      .filter((item) => item.total > 0)
      .sort((a, b) => a.accuracy - b.accuracy)
      .map((item) => ({
        topic: item.topic,
        accuracy: item.accuracy,
        correct: item.correct,
        total: item.total,
      }));

    const weakAreas = improvementAreas.filter((item) => item.accuracy < 60).slice(0, 5);

    return res.status(201).json({
      score: result.score,
      total: result.total,
      accuracy: result.total ? Number(((result.score / result.total) * 100).toFixed(2)) : 0,
      topicBreakdown: result.topicBreakdown,
      questionReview: result.questionReview,
      improvementAreas,
      weakAreas,
      wrongQuestionIds: result.wrongQuestionIds,
      weakTopics: weakAreas.map((item) => item.topic),
      historyId: history._id,
    });
  } catch (error) {
    return next(error);
  }
};

const getTestHistory = async (req, res, next) => {
  try {
    const history = await TestHistory.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.json({ history });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  generateTest,
  submitTest,
  getTestHistory,
};
