const Question = require("../models/Question");
const TestHistory = require("../models/TestHistory");
const { getWeakTopics } = require("./analyticsService");

const PHASES = ["DSA", "DBMS", "OS", "CN", "VOCAB", "OOPS", "RESUME"];

const stripPracticeSetSuffix = (value) =>
  String(value || "").replace(/\s*\(\s*practice\s*set\s*\d+\s*\)\s*$/i, "");

const normalizeQuestionText = (value) =>
  stripPracticeSetSuffix(value)
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const questionDedupKey = (question) => {
  const normalizedText = normalizeQuestionText(question?.question);
  if (normalizedText) {
    return `text:${normalizedText}`;
  }

  return `id:${String(question?._id)}`;
};

const filterOutUsedQuestionTexts = (questions, usedQuestionTextSet) => {
  if (!usedQuestionTextSet?.size) return questions;

  return questions.filter((question) => {
    const normalizedText = normalizeQuestionText(question?.question);
    if (!normalizedText) return true;
    return !usedQuestionTextSet.has(normalizedText);
  });
};

const uniqueQuestions = (questions) => {
  const seen = new Set();
  return questions.filter((question) => {
    const key = questionDedupKey(question);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const sampleUniqueQuestions = async ({ match, limit, excludedQuestionTexts = [], sampleSize }) => {
  const size = Math.max(Number(sampleSize) || limit * 12, limit);
  const sampled = await Question.aggregate([
    { $match: match },
    { $sample: { size } },
  ]);

  const excludedSet = new Set(excludedQuestionTexts);
  return uniqueQuestions(filterOutUsedQuestionTexts(sampled, excludedSet)).slice(0, limit);
};

const getUsedQuestionIds = async (userId, phase) => {
  const filter = phase === "FINAL" ? { userId } : { userId, phase };
  const used = await TestHistory.distinct("questionsUsed", filter);
  return used;
};

const getUsedQuestionContext = async (userId, phase) => {
  const usedIds = await getUsedQuestionIds(userId, phase);
  if (!usedIds.length) {
    return { usedIds: [], usedQuestionTextSet: new Set() };
  }

  const usedQuestions = await Question.find({ _id: { $in: usedIds } }).select("question").lean();
  const usedQuestionTextSet = new Set(
    usedQuestions
      .map((question) => normalizeQuestionText(question.question))
      .filter(Boolean)
  );

  return { usedIds, usedQuestionTextSet };
};

const buildQuery = ({ phase, topic, difficulty, usedIds }) => {
  const query = {
    _id: { $nin: usedIds },
  };

  if (phase && phase !== "FINAL") query.phase = phase;
  if (topic) query.topic = topic;
  if (difficulty) query.difficulty = difficulty;

  return query;
};

const buildAdaptiveTopicFilter = async (userId) => {
  const weakTopics = await getWeakTopics(userId, 3);
  return weakTopics.map((item) => item.topic);
};

const generateQuestions = async ({
  userId,
  phase,
  topic,
  difficulty,
  limit = 50,
  adaptive = false,
  retakeQuestionIds,
  excludeQuestionIds,
}) => {
  const normalizedPhase = phase || "DBMS";
  const normalizedLimit = normalizedPhase === "FINAL" ? 120 : limit;

  const { usedIds, usedQuestionTextSet } = retakeQuestionIds?.length
    ? { usedIds: [], usedQuestionTextSet: new Set() }
    : await getUsedQuestionContext(userId, normalizedPhase);
  const excludedIds = Array.isArray(excludeQuestionIds) ? excludeQuestionIds : [];
  const mergedUsedIds = Array.from(new Set([...usedIds.map(String), ...excludedIds.map(String)]));
  const isRetakeFlow = Boolean(retakeQuestionIds?.length);

  const query = buildQuery({
    phase: normalizedPhase,
    topic,
    difficulty,
    usedIds: mergedUsedIds,
  });

  if (retakeQuestionIds?.length) {
    query._id = { $in: retakeQuestionIds };
    delete query.phase;
    delete query.topic;
    delete query.difficulty;
  }

  if (normalizedPhase === "FINAL") {
    query.phase = { $in: PHASES };
  }

  if (adaptive) {
    const weakTopics = await buildAdaptiveTopicFilter(userId);
    if (weakTopics.length) {
      query.topic = { $in: weakTopics };
    }
  }

  const excludedQuestionTexts = [...usedQuestionTextSet];
  let uniqueSelected = await sampleUniqueQuestions({
    match: query,
    limit: normalizedLimit,
    excludedQuestionTexts,
    sampleSize: normalizedLimit * 12,
  });

  if (uniqueSelected.length < normalizedLimit && !isRetakeFlow) {
    // Relax topic/difficulty filters, but keep non-repetition constraints so users don't get the same questions repeatedly.
    const fallbackQuery = {
      _id: { $nin: mergedUsedIds },
      ...(normalizedPhase === "FINAL" ? { phase: { $in: PHASES } } : { phase: normalizedPhase }),
    };

    const selectedTextSet = new Set(uniqueSelected.map((item) => normalizeQuestionText(item.question)).filter(Boolean));
    const fallbackExcludedTexts = [...new Set([...excludedQuestionTexts, ...selectedTextSet])];
    const topUpSample = await sampleUniqueQuestions({
      match: fallbackQuery,
      limit: normalizedLimit,
      excludedQuestionTexts: fallbackExcludedTexts,
      sampleSize: normalizedLimit * 20,
    });

    uniqueSelected = uniqueQuestions([...uniqueSelected, ...topUpSample]).slice(0, normalizedLimit);
  }

  if (uniqueSelected.length < normalizedLimit && !isRetakeFlow) {
    // Final fallback: allow previously seen items, but still guarantee uniqueness within this test.
    const broadQuery = {
      ...(normalizedPhase === "FINAL" ? { phase: { $in: PHASES } } : { phase: normalizedPhase }),
    };

    const broadSample = await sampleUniqueQuestions({
      match: broadQuery,
      limit: normalizedLimit,
      excludedQuestionTexts: [],
      sampleSize: normalizedLimit * 30,
    });

    const selectedTextSet = new Set(uniqueSelected.map((item) => normalizeQuestionText(item.question)).filter(Boolean));
    const broadUniqueAdditions = broadSample.filter((item) => {
      const text = normalizeQuestionText(item.question);
      if (!text || selectedTextSet.has(text)) return false;
      selectedTextSet.add(text);
      return true;
    });

    uniqueSelected = uniqueQuestions([...uniqueSelected, ...broadUniqueAdditions]).slice(0, normalizedLimit);
  }

  return uniqueSelected.map((q) => ({
    _id: q._id,
    question: q.question,
    options: q.options,
    topic: q.topic,
    phase: q.phase,
    difficulty: q.difficulty,
    isInterviewFavorite: Boolean(q.isInterviewFavorite),
  }));
};

const evaluateTestSubmission = async ({ phase, questionIds, answers }) => {
  const questions = await Question.find({ _id: { $in: questionIds } }).lean();
  const answerMap = new Map(answers.map((item) => [String(item.questionId), item.selectedAnswer]));

  let correctCount = 0;
  const wrongQuestionIds = [];
  const topicStats = new Map();
  const questionReview = [];

  for (const question of questions) {
    const selected = answerMap.get(String(question._id));
    const isCorrect = selected === question.answer;

    if (isCorrect) correctCount += 1;
    else wrongQuestionIds.push(question._id);

    const existing = topicStats.get(question.topic) || {
      topic: question.topic,
      correct: 0,
      total: 0,
      accuracy: 0,
    };

    existing.total += 1;
    if (isCorrect) existing.correct += 1;
    topicStats.set(question.topic, existing);

    questionReview.push({
      questionId: question._id,
      question: question.question,
      topic: question.topic,
      selectedAnswer: selected || "",
      correctAnswer: question.answer,
      isCorrect,
    });
  }

  const topicBreakdown = Array.from(topicStats.values()).map((topic) => ({
    ...topic,
    accuracy: topic.total ? Number(((topic.correct / topic.total) * 100).toFixed(2)) : 0,
  }));

  const total = questions.length;
  const score = correctCount;

  return {
    phase,
    score,
    total,
    correctCount,
    questionIds: questions.map((q) => q._id),
    wrongQuestionIds,
    topicBreakdown,
    questionReview,
  };
};

module.exports = {
  generateQuestions,
  evaluateTestSubmission,
};
