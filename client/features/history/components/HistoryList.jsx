import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  LuExternalLink as Open,
  LuTrash2 as Trash,
  LuLoaderCircle as Loader,
  LuHistory as HistoryIcon,
} from "react-icons/lu";
import { Button, buttonVariants } from "@/features/common/components/ui/button";
import { clearHistory, deleteEntry, fetchHistory } from "../api";

const FILTERS = [
  ["", "All"],
  ["algorithm", "Algorithms"],
  ["data-structure", "Data structures"],
];
const PAGE_SIZE = 10;

const dateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

/** Short, human description of what the user entered. */
export function describeInput(entry) {
  const { input = {} } = entry;
  if (input.graph) {
    const { vertices, edges = [], start, directed } = input.graph;
    return `${vertices} vertices, ${edges.length} ${directed ? "directed " : ""}edges, start ${start}`;
  }
  const list = (values) =>
    values.length > 12
      ? `[${values.slice(0, 12).join(", ")}, …] (${values.length})`
      : `[${values.join(", ")}]`;
  if (entry.kind === "data-structure") {
    const ops = input.operations?.length ?? 0;
    return `${ops} ${ops === 1 ? "operation" : "operations"} · ${input.mode ? `${input.mode}-heap ` : ""}${list(input.values ?? [])}`;
  }
  const parts = [list(input.array ?? [])];
  if (input.target !== undefined) parts.push(`target ${input.target}`);
  return parts.join(" · ");
}

export function HistoryList({ onChange }) {
  const [kind, setKind] = useState("");
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const load = useCallback(
    async (nextPage, append) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchHistory({
          page: nextPage,
          limit: PAGE_SIZE,
          kind: kind || undefined,
        });
        setEntries((current) =>
          append ? [...current, ...data.entries] : data.entries,
        );
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    },
    [kind],
  );

  useEffect(() => {
    load(1, false);
  }, [load]);

  const remove = async (entry) => {
    try {
      await deleteEntry(entry.id);
      setEntries((current) => current.filter((item) => item.id !== entry.id));
      setTotal((count) => count - 1);
      onChange?.();
    } catch (removeError) {
      toast.error(removeError.message);
    }
  };

  const clearAll = async () => {
    try {
      const { deleted } = await clearHistory();
      toast.success(
        `Deleted ${deleted} ${deleted === 1 ? "entry" : "entries"}`,
      );
      setConfirmClear(false);
      setEntries([]);
      setTotal(0);
      setTotalPages(1);
      onChange?.();
    } catch (clearError) {
      toast.error(clearError.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Filter history"
        >
          {FILTERS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setKind(value)}
              aria-pressed={kind === value}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                kind === value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {total > 0 &&
          (confirmClear ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Delete all history?</span>
              <Button size="sm" variant="destructive" onClick={clearAll}>
                Yes, delete all
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmClear(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConfirmClear(true)}
            >
              <Trash /> Clear history
            </Button>
          ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && entries.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
          <HistoryIcon className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-medium">No history yet</p>
            <p className="text-sm text-muted-foreground">
              Runs are saved when you press Play in the visualizer or use a data
              structure.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/visualizer" className={buttonVariants({ size: "sm" })}>
              Open the visualizer
            </Link>
            <Link
              to="/data-structures"
              className={buttonVariants({ size: "sm", variant: "outline" })}
            >
              Data structures
            </Link>
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{entry.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      entry.kind === "algorithm"
                        ? "bg-primary/10 text-primary"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {entry.kind === "algorithm"
                      ? "Algorithm"
                      : "Data structure"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {dateFormat.format(new Date(entry.createdAt))}
                  </span>
                </div>
                <p
                  className="truncate font-mono text-xs text-muted-foreground"
                  title={describeInput(entry)}
                >
                  {describeInput(entry)}
                </p>
                {entry.summary?.result && (
                  <p className="line-clamp-1 text-sm text-muted-foreground">
                    {entry.summary.result}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  to={entry.link}
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                >
                  <Open /> Open again
                </Link>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => remove(entry)}
                  aria-label={`Delete ${entry.title} from history`}
                  title="Delete"
                >
                  <Trash />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{total > 0 && `Showing ${entries.length} of ${total}`}</span>
        {loading ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          page < totalPages && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => load(page + 1, true)}
            >
              Load more
            </Button>
          )
        )}
      </div>
    </div>
  );
}
