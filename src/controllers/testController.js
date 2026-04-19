const TestHistory = require("../models/TestHistory");
const { generateQuestions, evaluateTestSubmission } = require("../services/testEngineService");
const { getProgressSummary, isToday } = require("../services/analyticsService");

const generateTest = async (req, res, next) => {
  try {
    const { phase, topic, difficulty, limit, adaptive, retakeQuestionIds } = req.body;
    const selectedPhase = phase || "DBMS";

    const progressSummary = await getProgressSummary(req.user._id);

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

    if (!isToday(req.user.lastChecklistUpdateAt)) {
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
    });

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
