import mongoose from "mongoose";

/**
 * One saved run: an algorithm with the input the user entered, or a data
 * structure session with the operations they performed. `link` reopens it.
 */
const historyEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    kind: {
      type: String,
      enum: ["algorithm", "data-structure", "problem"],
      required: true,
    },
    itemId: { type: String, required: true },
    title: { type: String, required: true },
    // Algorithm: { array, target }, { graph }…; data structure: { values, operations };
    // problem: the LeetCode-style fields ({ nums, target }…)
    input: { type: mongoose.Schema.Types.Mixed, default: {} },
    summary: {
      steps: Number,
      comparisons: Number,
      swaps: Number,
      operations: Number,
      result: String,
    },
    link: { type: String, required: true },
  },
  { timestamps: true, minimize: false },
);

historyEntrySchema.index({ user: 1, createdAt: -1 });

historyEntrySchema.methods.toPublic = function toPublic() {
  return {
    id: this.id,
    kind: this.kind,
    itemId: this.itemId,
    title: this.title,
    input: this.input,
    summary: this.summary ?? {},
    link: this.link,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const HistoryEntry = mongoose.model("HistoryEntry", historyEntrySchema);
