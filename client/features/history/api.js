import { api } from "@/features/common/lib/api";

export const fetchHistory = ({ page = 1, limit = 10, kind } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (kind) params.set("kind", kind);
  return api(`/history?${params}`);
};

export const fetchStats = () => api("/history/stats");

export const createEntry = (entry) =>
  api("/history", { method: "POST", body: entry }).then((data) => data.entry);

export const updateEntry = (id, changes) =>
  api(`/history/${id}`, { method: "PATCH", body: changes }).then(
    (data) => data.entry,
  );

export const deleteEntry = (id) => api(`/history/${id}`, { method: "DELETE" });

export const clearHistory = () => api("/history", { method: "DELETE" });
