const StudyItem = require("../models/StudyItem");

const listStudyItems = async (req, res, next) => {
  try {
    const { questionIds, phase } = req.query;
    const filter = { userId: req.user._id };

    if (phase) filter.phase = phase;
    if (questionIds) {
      const ids = String(questionIds)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (ids.length) filter.questionId = { $in: ids };
    }

    const items = await StudyItem.find(filter).sort({ updatedAt: -1 }).lean();
    return res.json({ items });
  } catch (error) {
    return next(error);
  }
};

const saveStudyItem = async (req, res, next) => {
  try {
    const { questionId, phase, topic, bookmarked, note } = req.body;

    if (!questionId || !phase || !topic) {
      return res.status(400).json({ message: "questionId, phase, and topic are required" });
    }

    const updated = await StudyItem.findOneAndUpdate(
      { userId: req.user._id, questionId },
      {
        $set: {
          phase,
          topic,
          bookmarked: Boolean(bookmarked),
          note: note || "",
        },
        $setOnInsert: {
          userId: req.user._id,
          questionId,
        },
      },
      { new: true, upsert: true }
    );

    return res.json({ item: updated });
  } catch (error) {
    return next(error);
  }
};

const deleteStudyItem = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    await StudyItem.deleteOne({ userId: req.user._id, questionId });
    return res.json({ message: "Study item deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listStudyItems,
  saveStudyItem,
  deleteStudyItem,
};