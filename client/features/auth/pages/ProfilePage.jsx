import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuLogOut as LogOut } from "react-icons/lu";
import { Button } from "@/features/common/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/features/common/components/ui/tabs";
import { ALGORITHMS } from "@shared/algorithms";
import { DATA_STRUCTURES } from "@shared/dataStructures";
import { fetchStats } from "@/features/history/api";
import { HistoryList } from "@/features/history/components/HistoryList";
import { useAuth } from "../context/AuthContext";
import { AccountSettings } from "../components/AccountSettings";

const TOTAL_ITEMS =
  Object.keys(ALGORITHMS).length + Object.keys(DATA_STRUCTURES).length;
const memberSince = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
});
const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

function timeAgo(date) {
  const minutes = Math.round((new Date(date) - Date.now()) / 60000);
  if (Math.abs(minutes) < 60) return relative.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(hours, "hour");
  return relative.format(Math.round(hours / 24), "day");
}

const itemLink = (item) =>
  item.kind === "algorithm"
    ? `/visualizer?algo=${item.itemId}`
    : `/data-structures/${item.itemId}`;

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);

  const loadStats = useCallback(() => {
    fetchStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);
  useEffect(loadStats, [loadStats]);

  const maxCount = Math.max(
    1,
    ...(stats?.byItem.map((item) => item.count) ?? []),
  );

  return (
    <div className="container mx-auto space-y-8 px-4 py-8 sm:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-primary to-blue-600 text-2xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {user.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {user.email} · member since{" "}
              {memberSince.format(new Date(user.createdAt))}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={logout}
          className="self-start sm:self-auto"
        >
          <LogOut /> Log out
        </Button>
      </header>

      <section
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        aria-label="Your stats"
      >
        <StatCard
          label="Saved runs"
          value={stats?.total ?? "–"}
          hint={
            stats?.lastActiveAt && `Last active ${timeAgo(stats.lastActiveAt)}`
          }
        />
        <StatCard
          label="Algorithm runs"
          value={stats?.byKind.algorithm ?? "–"}
        />
        <StatCard
          label="Data structure sessions"
          value={stats?.byKind["data-structure"] ?? "–"}
        />
        <StatCard
          label="Topics explored"
          value={stats ? `${stats.byItem.length}/${TOTAL_ITEMS}` : "–"}
          hint="Algorithms and data structures you have tried"
        />
      </section>

      <Tabs defaultValue="history">
        <TabsList className="grid! w-full max-w-md grid-cols-3">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="pt-4">
          <HistoryList onChange={loadStats} />
        </TabsContent>

        <TabsContent value="topics" className="pt-4">
          {stats?.byItem.length ? (
            <ul className="space-y-2">
              {stats.byItem.map((item) => (
                <li key={`${item.kind}-${item.itemId}`}>
                  <Link
                    to={itemLink(item)}
                    className="block rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/50"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-muted-foreground">
                        {item.count} {item.count === 1 ? "run" : "runs"} ·{" "}
                        {timeAgo(item.lastUsedAt)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${item.kind === "algorithm" ? "bg-primary" : "bg-emerald-500"}`}
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              Topics you use will show up here with how often you ran them.
            </p>
          )}
        </TabsContent>

        <TabsContent value="settings" className="pt-4">
          <div className="max-w-md rounded-xl border border-border bg-card p-5">
            <AccountSettings />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
