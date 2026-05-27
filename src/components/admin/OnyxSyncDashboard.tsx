"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Activity,
  FileWarning,
  FolderX,
  Hourglass,
  RefreshCw,
  ChevronLeft,
  Trash2,
  RotateCw,
} from "lucide-react";
import {
  getOnyxSyncHealth,
  getCleanupFailures,
  retryCleanupFailure,
  type OnyxSyncHealth,
  type CleanupFailureRow,
} from "@/actions/admin-actions";


function tone(value: number, warnAt: number, badAt: number): {
  ring: string;
  text: string;
  iconColor: string;
} {
  if (value >= badAt) {
    return {
      ring: "ring-red-200 bg-red-50/40",
      text: "text-red-600",
      iconColor: "text-red-500",
    };
  }
  if (value >= warnAt) {
    return {
      ring: "ring-amber-200 bg-amber-50/40",
      text: "text-amber-700",
      iconColor: "text-amber-500",
    };
  }
  return {
    ring: "ring-emerald-200 bg-emerald-50/40",
    text: "text-emerald-700",
    iconColor: "text-emerald-500",
  };
}

const STATE_BADGE: Record<string, string> = {
  PENDING: "bg-blue-50 text-blue-700 ring-blue-200",
  CREATING: "bg-amber-50 text-amber-700 ring-amber-200",
  FAILED: "bg-red-50 text-red-700 ring-red-200",
  READY: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};


interface OnyxSyncDashboardProps {
  initial: OnyxSyncHealth | null;
}

export default function OnyxSyncDashboard({ initial }: OnyxSyncDashboardProps) {
  const [data, setData] = useState<OnyxSyncHealth | null>(initial);
  const [loadedAt, setLoadedAt] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // E.3 — pending cleanup failures list. Loaded alongside the health
  // metrics on every refresh so the table stays in sync with the KPI
  // counter and the per-row retries can be observed near-immediately.
  const [cleanupRows, setCleanupRows] = useState<CleanupFailureRow[]>([]);
  const [retryingIds, setRetryingIds] = useState<Set<number>>(new Set());

  async function refresh() {
    setRefreshing(true);
    setError(null);
    try {
      const [fresh, cleanup] = await Promise.all([
        getOnyxSyncHealth(),
        getCleanupFailures(50, 0),
      ]);
      if (fresh) {
        setData(fresh);
        setLoadedAt(new Date());
      } else {
        setError("Backend returned no data — check admin auth or backend logs.");
      }
      setCleanupRows(cleanup?.items ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load health data");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleRetry(id: number) {
    setRetryingIds((prev) => new Set(prev).add(id));
    try {
      const result = await retryCleanupFailure(id);
      if (!result.ok) {
        setError(result.error);
      } else {
        // Optimistically drop the row from view; the next refresh
        // confirms via the live list. If the retry itself fails the
        // task_failure handler will re-add the row on its next tick.
        setCleanupRows((rows) => rows.filter((r) => r.id !== id));
      }
    } finally {
      setRetryingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  // Auto-refresh every 30 s — short enough to feel live, long enough
  // not to hammer the backend's stuck-record COUNT query.
  useEffect(() => {
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, []);

  // First-mount fetch of the cleanup-failures list (the initial health
  // payload comes from the server component but the list does not).
  useEffect(() => {
    getCleanupFailures(50, 0).then((c) => setCleanupRows(c?.items ?? []));
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Link
          href="/admin"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Admin
        </Link>
        <div className="bg-white rounded-xl ring-1 ring-red-200 p-6 text-red-600">
          {error ?? "No health data available."}
        </div>
      </div>
    );
  }

  const failures24h = data.failures_last_24h ?? 0;
  const stuckRecords = data.stuck_records_count ?? 0;
  const stuckProjects = data.stuck_projects_count ?? 0;
  const awaitingAnalysis = data.awaiting_analysis_count ?? 0;
  const pendingCleanup = data.pending_cleanup_count ?? 0;

  const failuresTone = tone(failures24h, 5, 50);
  const recordsTone = tone(stuckRecords, 1, 20);
  const projectsTone = tone(stuckProjects, 1, 5);
  // Awaiting-analysis is informational, not a failure. A small backlog
  // is normal during column setup; a large one signals a stalled flow.
  const awaitingTone = tone(awaitingAnalysis, 5, 50);
  // Pending cleanup is always actionable — every row is a delete that
  // didn't fully complete on the Onyx side. Even one row is worth
  // noticing, so the warn threshold is 1.
  const cleanupTone = tone(pendingCleanup, 1, 20);

  // 7-day data: sort by date ASC for the sparkline
  const dayEntries = Object.entries(data.failures_by_day_last_7d ?? {}).sort();
  const sparkMax = Math.max(1, ...dayEntries.map(([, v]) => v));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/admin"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Admin
        </Link>

        <header className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Onyx Sync Health
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Live view of sync failures, stuck records, and stuck projects.
              Sweeper re-dispatches stale rows every 15 min.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500" data-testid="updated-at">
              Updated {loadedAt.toLocaleTimeString()}
            </span>
            <button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              data-testid="refresh-button"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <KpiCard
            label="Failures · last 24h"
            value={failures24h.toString()}
            sub="Celery task_failure signals from onyx-sync tasks"
            Icon={AlertTriangle}
            tone={failuresTone}
            testid="card-failures-24h"
          />
          <KpiCard
            label="Stuck records"
            value={stuckRecords.toString()}
            sub="synced_to_onyx_at NULL · created > 10 min ago"
            Icon={FileWarning}
            tone={recordsTone}
            testid="card-stuck-records"
          />
          <KpiCard
            label="Stuck projects"
            value={stuckProjects.toString()}
            sub="sync_state in PENDING / CREATING / FAILED > 5 min"
            Icon={FolderX}
            tone={projectsTone}
            testid="card-stuck-projects"
          />
          <KpiCard
            label="Awaiting analysis"
            value={awaitingAnalysis.toString()}
            sub="uploaded but no columns yet · image rows defer Onyx upload"
            Icon={Hourglass}
            tone={awaitingTone}
            testid="card-awaiting-analysis"
          />
          <KpiCard
            label="Pending Onyx cleanup"
            value={pendingCleanup.toString()}
            sub="delete tasks past Celery retries · sweeper retries on backoff"
            Icon={Trash2}
            tone={cleanupTone}
            testid="card-pending-cleanup"
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 7-day failures */}
          <div className="lg:col-span-2 bg-white rounded-xl ring-1 ring-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-700">
                Failures · last 7 days
              </h2>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>

            {/* Sparkline */}
            <div
              className="flex items-end gap-1.5 h-20 mb-4"
              data-testid="sparkline"
            >
              {dayEntries.length === 0 && (
                <div className="text-xs text-gray-400 italic">
                  No data yet — the metric counter starts at the first failure.
                </div>
              )}
              {dayEntries.map(([day, count]) => {
                const heightPct = Math.max(4, (count / sparkMax) * 100);
                return (
                  <div
                    key={day}
                    className="flex-1 bg-blue-500/80 hover:bg-blue-600 rounded-t-sm"
                    style={{ height: `${heightPct}%` }}
                    title={`${day}: ${count}`}
                  />
                );
              })}
            </div>

            <table className="w-full text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="text-left font-medium py-1">Date</th>
                  <th className="text-right font-medium py-1">Failures</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dayEntries.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-gray-400 italic py-2">
                      No failure data
                    </td>
                  </tr>
                ) : (
                  [...dayEntries].reverse().map(([day, count]) => (
                    <tr key={day}>
                      <td className="py-1.5 text-gray-700">{day}</td>
                      <td className="py-1.5 text-right text-gray-900 font-medium">
                        {count}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Stuck projects breakdown */}
          <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5 shadow-sm">
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              Stuck projects by state
            </h2>

            <table className="w-full text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="text-left font-medium py-1">State</th>
                  <th className="text-right font-medium py-1">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.entries(data.stuck_projects_by_state ?? {}).length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-gray-400 italic py-2">
                      All projects healthy
                    </td>
                  </tr>
                ) : (
                  Object.entries(data.stuck_projects_by_state).map(([state, count]) => (
                    <tr key={state}>
                      <td className="py-1.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ring-1 ${
                            STATE_BADGE[state] ?? STATE_BADGE.PENDING
                          }`}
                        >
                          {state}
                        </span>
                      </td>
                      <td className="py-1.5 text-right text-gray-900 font-medium">
                        {count}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <p className="text-xs text-gray-400 mt-4">
              The reconciliation sweeper re-dispatches stuck projects with{" "}
              <code className="px-1 bg-gray-100 rounded">sync_attempts &lt; 20</code>
              {" "}every 15 minutes.
            </p>
          </div>
        </section>

        {/* E.3 — Pending Onyx cleanup failures (per-row table) */}
        <section className="mt-6">
          <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-700">
                Pending Onyx cleanup
              </h2>
              <span className="text-xs text-gray-400">
                {cleanupRows.length} shown
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              These are delete tasks that exhausted Celery&apos;s autoretry
              budget. The sweeper retries them on a{" "}
              <code className="px-1 bg-gray-100 rounded">15m → 1h → 4h → 24h</code>
              {" "}backoff. Use{" "}
              <strong>Retry now</strong> when you&apos;ve confirmed the underlying
              Onyx outage is resolved and want immediate cleanup.
            </p>

            <table className="w-full text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="text-left font-medium py-1.5">Filename</th>
                  <th className="text-left font-medium py-1.5">Project</th>
                  <th className="text-left font-medium py-1.5">Last error</th>
                  <th className="text-right font-medium py-1.5">Attempts</th>
                  <th className="text-right font-medium py-1.5">Next retry</th>
                  <th className="text-right font-medium py-1.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cleanupRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-gray-400 italic py-3">
                      No pending cleanup rows — every delete made it through.
                    </td>
                  </tr>
                ) : (
                  cleanupRows.map((row) => {
                    const isRetrying = retryingIds.has(row.id);
                    const nextRetry = row.next_retry_at
                      ? new Date(row.next_retry_at).toLocaleString()
                      : "—";
                    return (
                      <tr key={row.id} data-testid={`cleanup-row-${row.id}`}>
                        <td
                          className="py-2 text-gray-800 max-w-[260px] truncate"
                          title={row.filename}
                        >
                          {row.filename}
                        </td>
                        <td
                          className="py-2 text-gray-500 font-mono text-xs max-w-[140px] truncate"
                          title={row.project_id}
                        >
                          {row.project_id}
                        </td>
                        <td
                          className="py-2 text-red-700 max-w-[360px] truncate"
                          title={row.error ?? ""}
                        >
                          {row.error ?? "—"}
                        </td>
                        <td className="py-2 text-right text-gray-700">
                          {row.attempts}
                        </td>
                        <td className="py-2 text-right text-gray-500 text-xs">
                          {nextRetry}
                        </td>
                        <td className="py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRetry(row.id)}
                            disabled={isRetrying}
                            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                            data-testid={`retry-button-${row.id}`}
                          >
                            <RotateCw
                              className={`w-3.5 h-3.5 ${
                                isRetrying ? "animate-spin" : ""
                              }`}
                            />
                            {isRetrying ? "Retrying…" : "Retry now"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}


interface KpiCardProps {
  label: string;
  value: string;
  sub: string;
  Icon: React.ComponentType<{ className?: string }>;
  tone: { ring: string; text: string; iconColor: string };
  testid?: string;
}

function KpiCard({ label, value, sub, Icon, tone, testid }: KpiCardProps) {
  return (
    <div
      className={`rounded-xl ring-1 p-4 shadow-sm ${tone.ring}`}
      data-testid={testid}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </div>
        <Icon className={`w-4 h-4 ${tone.iconColor}`} />
      </div>
      <div className={`text-3xl font-bold ${tone.text}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  );
}
