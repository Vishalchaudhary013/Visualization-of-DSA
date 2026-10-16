import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { createEntry, updateEntry } from "../api";

const UPDATE_DELAY = 1200;

/**
 * Saves the current run to the signed-in user's history.
 *
 * - `key` identifies one run (e.g. the visualizer URL). A key is saved at most
 *   once; with `live: true` later changes to `entry` update that same record
 *   (debounced), which suits data structure sessions that grow over time.
 * - Nothing is saved until `ready` is true (e.g. the user pressed Play).
 *
 * Returns "signed-out" | "idle" | "saving" | "saved" | "error".
 */
export function useHistorySync({ key, entry, ready, live = false }) {
  const { status: authStatus } = useAuth();
  const [status, setStatus] = useState("idle");
  const savedIds = useRef(new Map()); // key -> history entry id
  const pending = useRef(new Set()); // keys being created right now
  const signedIn = authStatus === "signed-in";
  const serialized = entry ? JSON.stringify(entry) : null;

  // Show "saved" when returning to a run that was already saved
  useEffect(() => {
    setStatus(savedIds.current.has(key) ? "saved" : "idle");
  }, [key]);

  useEffect(() => {
    if (!signedIn || !ready || !serialized) return undefined;
    const payload = JSON.parse(serialized);
    const existingId = savedIds.current.get(key);

    if (existingId) {
      if (!live) return undefined;
      const timer = setTimeout(() => {
        setStatus("saving");
        const { input, summary, link } = payload;
        updateEntry(existingId, { input, summary, link })
          .then(() => setStatus("saved"))
          .catch(() => setStatus("error"));
      }, UPDATE_DELAY);
      return () => clearTimeout(timer);
    }

    if (pending.current.has(key)) return undefined;
    pending.current.add(key);
    setStatus("saving");
    createEntry(payload)
      .then((created) => {
        savedIds.current.set(key, created.id);
        setStatus("saved");
      })
      .catch(() => setStatus("error"))
      .finally(() => pending.current.delete(key));
    return undefined;
  }, [signedIn, ready, key, serialized, live]);

  if (authStatus === "signed-out") return "signed-out";
  if (!signedIn) return "idle";
  return status;
}
