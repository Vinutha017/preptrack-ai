const Progress = require("../models/Progress");
const { calculateProgressPercent, getProgressSummary } = require("../services/analyticsService");

const DEFAULT_PHASE_TOTALS = {
  DSA: 14,
  DBMS: 37,
  OS: 37,
  CN: 42,
  VOCAB: 16,
  OOPS: 22,
  RESUME: 15,
};

const stampChecklistUpdate = async (user) => {
  user.lastChecklistUpdateAt = new Date();
  await user.save();
};

const getTotalItemsForPhase = (phase, customItems = []) => {
  const baseTotal = DEFAULT_PHASE_TOTALS[phase] || 0;
  return baseTotal + customItems.length;
};

const ensureDefaultProgress = async (userId) => {
  const phaseEntries = Object.entries(DEFAULT_PHASE_TOTALS);
  for (const [phase, baseTotal] of phaseEntries) {
    const existing = await Progress.findOne({ userId, phase }).lean();
    const customItems = existing?.customItems || [];
    const totalItems = getTotalItemsForPhase(phase, customItems);

    // Legacy records used a 6-item phase model. Reset their completed list once to avoid stale counts.
    if (existing?.totalItems === 6) {
      await Progress.findOneAndUpdate(
        { userId, phase },
        {
          $set: { totalItems, completedItems: [], customItems },
        },
        { new: true }
      );
      continue;
    }

    await Progress.findOneAndUpdate(
      { userId, phase },
      {
        $set: { totalItems },
        $setOnInsert: { userId, phase, completedItems: [], customItems: [] },
      },
      { upsert: true, new: true }
    );
  }
};

const getProgress = async (req, res, next) => {
  try {
    await ensureDefaultProgress(req.user._id);
    const [summary, details] = await Promise.all([
      getProgressSummary(req.user._id, { lastChecklistUpdateAt: req.user.lastChecklistUpdateAt }),
      Progress.find({ userId: req.user._id }).sort({ phase: 1 }).lean(),
    ]);

    return res.json({
      ...summary,
      phaseDetails: details.map((item) => ({
        phase: item.phase,
        completedItems: item.completedItems,
        customItems: item.customItems || [],
        totalItems: item.totalItems,
        updatedAt: item.updatedAt,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

const toggleProgressItem = async (req, res, next) => {
  try {
    const { phase } = req.params;
    const { itemId, completed } = req.body;

    if (!itemId) return res.status(400).json({ message: "itemId is required" });

    const update = completed
      ? { $addToSet: { completedItems: itemId } }
      : { $pull: { completedItems: itemId } };

    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id, phase },
      {
        ...update,
        $setOnInsert: {
          userId: req.user._id,
          phase,
          totalItems: DEFAULT_PHASE_TOTALS[phase],
        },
      },
      { new: true, upsert: true }
    );

    if (!progress) {
      return res.status(404).json({ message: "Progress phase not found" });
    }

    const expectedTotal = getTotalItemsForPhase(phase, progress.customItems || []);
    if (progress.totalItems !== expectedTotal) {
      progress.totalItems = expectedTotal;
      await progress.save();
    }

    const phasePercent = calculateProgressPercent(progress.completedItems.length, progress.totalItems);
    const overall = await getProgressSummary(req.user._id, { lastChecklistUpdateAt: req.user.lastChecklistUpdateAt });

    await stampChecklistUpdate(req.user);

    return res.json({
      phase,
      completedItems: progress.completedItems,
      totalItems: progress.totalItems,
      phasePercent,
      overallPercent: overall.overallPercent,
    });
  } catch (error) {
    return next(error);
  }
};

const addCustomChecklistItem = async (req, res, next) => {
  try {
    const { phase } = req.params;
    const label = String(req.body.label || "").trim();

    if (!label) {
      return res.status(400).json({ message: "label is required" });
    }

    await ensureDefaultProgress(req.user._id);
    const progress = await Progress.findOne({ userId: req.user._id, phase });

    if (!progress) {
      return res.status(404).json({ message: "Progress phase not found" });
    }

    const alreadyExists = (progress.customItems || []).some((item) => item.label.toLowerCase() === label.toLowerCase());
    if (alreadyExists) {
      return res.status(409).json({ message: "This custom checklist topic already exists in the phase" });
    }

    const itemId = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    progress.customItems.push({ itemId, label });
    progress.totalItems = getTotalItemsForPhase(phase, progress.customItems);
    await progress.save();

    const overall = await getProgressSummary(req.user._id, { lastChecklistUpdateAt: req.user.lastChecklistUpdateAt });
    const phasePercent = calculateProgressPercent(progress.completedItems.length, progress.totalItems);

    await stampChecklistUpdate(req.user);

    return res.status(201).json({
      phase,
      item: { itemId, label },
      customItems: progress.customItems,
      totalItems: progress.totalItems,
      phasePercent,
      overallPercent: overall.overallPercent,
    });
  } catch (error) {
    return next(error);
  }
};

const removeCustomChecklistItem = async (req, res, next) => {
  try {
    const { phase, itemId } = req.params;

    await ensureDefaultProgress(req.user._id);
    const progress = await Progress.findOne({ userId: req.user._id, phase });

    if (!progress) {
      return res.status(404).json({ message: "Progress phase not found" });
    }

    const beforeCount = progress.customItems.length;
    progress.customItems = progress.customItems.filter((item) => item.itemId !== itemId);

    if (progress.customItems.length === beforeCount) {
      return res.status(404).json({ message: "Custom checklist topic not found" });
    }

    progress.completedItems = progress.completedItems.filter((id) => id !== itemId);
    progress.totalItems = getTotalItemsForPhase(phase, progress.customItems);
    await progress.save();

    const overall = await getProgressSummary(req.user._id, { lastChecklistUpdateAt: req.user.lastChecklistUpdateAt });
    const phasePercent = calculateProgressPercent(progress.completedItems.length, progress.totalItems);

    await stampChecklistUpdate(req.user);

    return res.json({
      phase,
      removedItemId: itemId,
      customItems: progress.customItems,
      completedItems: progress.completedItems,
      totalItems: progress.totalItems,
      phasePercent,
      overallPercent: overall.overallPercent,
    });
  } catch (error) {
    return next(error);
  }
};

const getOverallProgress = async (req, res, next) => {
  try {
    const summary = await getProgressSummary(req.user._id, { lastChecklistUpdateAt: req.user.lastChecklistUpdateAt });
    return res.json({
      overallPercent: summary.overallPercent,
      phaseWise: summary.phaseWise,
    });
  } catch (error) {
    return next(error);
  }
};

const markDailyChecklistUpdate = async (req, res, next) => {
  try {
    await stampChecklistUpdate(req.user);

    return res.json({
      message: "Checklist updated for today",
      lastChecklistUpdateAt: req.user.lastChecklistUpdateAt,
    });
  } catch (error) {
    return next(error);
  }
};

const resetProgress = async (req, res, next) => {
  try {
    await ensureDefaultProgress(req.user._id);

    await Progress.updateMany(
      { userId: req.user._id },
      {
        $set: { completedItems: [] },
      }
    );

    const summary = await getProgressSummary(req.user._id);
    return res.json({
      message: "Progress reset successfully",
      ...summary,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProgress,
  toggleProgressItem,
  addCustomChecklistItem,
  removeCustomChecklistItem,
  getOverallProgress,
  markDailyChecklistUpdate,
  resetProgress,
};
