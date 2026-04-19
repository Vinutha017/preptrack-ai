const Question = require("../models/Question");
const TestHistory = require("../models/TestHistory");
const { getWeakTopics } = require("./analyticsService");

const PHASES = ["DSA", "DBMS", "OS", "CN", "VOCAB", "OOPS"];
const INTERVIEW_PRIORITY_RATIO = 1;
const DEFAULT_DIFFICULTY_SPLIT = {
  easy: 0.4,
  medium: 0.4,
  hard: 0.2,
};

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const getUsedQuestionIds = async (userId, phase) => {
  const filter = phase === "FINAL" ? { userId } : { userId, phase };
  const used = await TestHistory.distinct("questionsUsed", filter);
  return used;
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

const prioritizeInterviewQuestions = (questions, limit) => {
  const favorites = questions
    .filter((item) => item.isInterviewFavorite)
    .sort((a, b) => (b.interviewWeight || 1) - (a.interviewWeight || 1));

  const regular = shuffle(questions.filter((item) => !item.isInterviewFavorite));
  const targetFavorites = Math.ceil(limit * INTERVIEW_PRIORITY_RATIO);

  const selectedFavorites = favorites.slice(0, targetFavorites);
  const selectedRegular = regular.slice(0, Math.max(0, limit - selectedFavorites.length));

  // If favorites exceed ratio and we still need questions, consume remaining favorites.
  const remaining = favorites.slice(selectedFavorites.length).slice(0, Math.max(0, limit - selectedFavorites.length - selectedRegular.length));

  return shuffle([...selectedFavorites, ...selectedRegular, ...remaining]).slice(0, limit);
};

const takeByDifficulty = (questions, limit) => {
  const buckets = {
    easy: questions.filter((item) => item.difficulty === "easy"),
    medium: questions.filter((item) => item.difficulty === "medium"),
    hard: questions.filter((item) => item.difficulty === "hard"),
  };

  const targetCounts = {
    easy: Math.max(1, Math.round(limit * DEFAULT_DIFFICULTY_SPLIT.easy)),
    medium: Math.max(1, Math.round(limit * DEFAULT_DIFFICULTY_SPLIT.medium)),
    hard: Math.max(1, limit - Math.max(1, Math.round(limit * DEFAULT_DIFFICULTY_SPLIT.easy)) - Math.max(1, Math.round(limit * DEFAULT_DIFFICULTY_SPLIT.medium))),
  };

  const selected = [
    ...prioritizeInterviewQuestions(buckets.easy, targetCounts.easy),
    ...prioritizeInterviewQuestions(buckets.medium, targetCounts.medium),
    ...prioritizeInterviewQuestions(buckets.hard, targetCounts.hard),
  ];

  if (selected.length >= limit) {
    return shuffle(selected).slice(0, limit);
  }

  const remainingPool = shuffle(questions.filter((item) => !selected.some((picked) => String(picked._id) === String(item._id))));
  return shuffle([...selected, ...remainingPool]).slice(0, limit);
};

const generateQuestions = async ({
  userId,
  phase,
  topic,
  difficulty,
  limit = 50,
  adaptive = false,
  retakeQuestionIds,
}) => {
  const normalizedPhase = phase || "DBMS";
  const normalizedLimit = normalizedPhase === "FINAL" ? 120 : limit;

  const usedIds = retakeQuestionIds?.length ? [] : await getUsedQuestionIds(userId, normalizedPhase);

  const query = buildQuery({
    phase: normalizedPhase,
    topic,
    difficulty,
    usedIds,
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

  let questions = await Question.find(query).limit(normalizedLimit * 3).lean();

  if (questions.length < normalizedLimit) {
    const fallbackQuery = { ...query };
    delete fallbackQuery._id;
    questions = await Question.find(fallbackQuery).limit(normalizedLimit * 3).lean();
  }

  const selected = difficulty ? prioritizeInterviewQuestions(questions, normalizedLimit) : takeByDifficulty(questions, normalizedLimit);

  return selected.map((q) => ({
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
  };
};

module.exports = {
  generateQuestions,
  evaluateTestSubmission,
};
