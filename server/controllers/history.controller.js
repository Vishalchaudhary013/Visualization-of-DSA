import mongoose from "mongoose";
import { HistoryEntry } from "../models/HistoryEntry.js";
import { ITEM_ID } from "../validation/schemas.js";

const MAX_PAGE_SIZE = 50;

const ownEntry = (req) => {
  if (!mongoose.isValidObjectId(req.params.id)) return null;
  return { _id: req.params.id, user: req.userId };
};

// GET /api/history?page=1&limit=20&kind=algorithm&itemId=quick-sort
//   -> { entries, page, totalPages, total }
export const listHistory = async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 20),
  );
  const filter = { user: req.userId };
  if (["algorithm", "data-structure", "problem"].includes(req.query.kind)) {
    filter.kind = req.query.kind;
  }
  if (typeof req.query.itemId === "string" && ITEM_ID.test(req.query.itemId)) {
    filter.itemId = req.query.itemId;
  }

  const [entries, total] = await Promise.all([
    HistoryEntry.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    HistoryEntry.countDocuments(filter),
  ]);
  res.json({
    entries: entries.map((entry) => entry.toPublic()),
    page,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
};

// GET /api/history/stats -> { total, byKind, byItem, lastActiveAt }
export const getStats = async (req, res) => {
  const user = new mongoose.Types.ObjectId(req.userId);
  const byItem = await HistoryEntry.aggregate([
    { $match: { user } },
    {
      $group: {
        _id: { kind: "$kind", itemId: "$itemId" },
        title: { $last: "$title" },
        count: { $sum: 1 },
        lastUsedAt: { $max: "$createdAt" },
      },
    },
    { $sort: { count: -1, lastUsedAt: -1 } },
  ]);

  const byKind = { algorithm: 0, "data-structure": 0, problem: 0 };
  for (const item of byItem) byKind[item._id.kind] += item.count;

  res.json({
    total: Object.values(byKind).reduce((sum, count) => sum + count, 0),
    byKind,
    byItem: byItem.map((item) => ({
      kind: item._id.kind,
      itemId: item._id.itemId,
      title: item.title,
      count: item.count,
      lastUsedAt: item.lastUsedAt,
    })),
    lastActiveAt: byItem.reduce(
      (latest, item) =>
        !latest || item.lastUsedAt > latest ? item.lastUsedAt : latest,
      null,
    ),
  });
};

// POST /api/history { kind, itemId, title, input, summary, link } -> { entry }
export const createHistory = async (req, res) => {
  const entry = await HistoryEntry.create({ ...req.body, user: req.userId });
  res.status(201).json({ entry: entry.toPublic() });
};

// PATCH /api/history/:id { input?, summary?, link? } -> { entry }
export const updateHistory = async (req, res) => {
  const filter = ownEntry(req);
  const entry = filter
    ? await HistoryEntry.findOneAndUpdate(filter, req.body, {
        returnDocument: "after",
      })
    : null;
  if (!entry)
    return res.status(404).json({ error: "History entry not found." });
  res.json({ entry: entry.toPublic() });
};

// DELETE /api/history/:id
export const deleteHistory = async (req, res) => {
  const filter = ownEntry(req);
  const result = filter
    ? await HistoryEntry.deleteOne(filter)
    : { deletedCount: 0 };
  if (!result.deletedCount) {
    return res.status(404).json({ error: "History entry not found." });
  }
  res.status(204).end();
};

// DELETE /api/history - clears all of the user's history
export const clearHistory = async (req, res) => {
  const { deletedCount } = await HistoryEntry.deleteMany({ user: req.userId });
  res.json({ deleted: deletedCount });
};
