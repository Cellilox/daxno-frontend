import { Metadata } from "next";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import {
  Users,
  CreditCard,
  Flame,
  DollarSign,
  TrendingUp,
  FileText,
} from "lucide-react";
import {
  getAdminMetrics,
  getAdminUsersOverview,
  type AdminUserOverview,
  type AdminMetrics,
} from "@/actions/admin-actions";

export const metadata: Metadata = {
  title: "Cellilox | Admin",
  description:
    "Administrative dashboard for users, plans, and AI consumption in Daxno.",
};

const SEGMENT_LABEL: Record<string, string> = {
  free: "Free",
  standard_paid: "Paid (Standard)",
  byok: "BYOK",
  managed: "Managed",
};

const SEGMENT_BADGE: Record<string, string> = {
  free: "bg-gray-100 text-gray-700 ring-gray-200",
  standard_paid: "bg-blue-50 text-blue-700 ring-blue-200",
  byok: "bg-purple-50 text-purple-700 ring-purple-200",
  managed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

function fmtMoney(n: number | null | undefined): string {
  const v = typeof n === "number" ? n : 0;
  return v >= 1
    ? `$${v.toFixed(2)}`
    : v > 0
      ? `$${v.toFixed(4)}`
      : "$0.00";
}

function fmtNumber(n: number | null | undefined): string {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtDate(s: string | null | undefined): string {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString();
  } catch {
    return "—";
  }
}

function KpiCard({
  label,
  value,
  hint,
  Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  Icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "warn" | "good";
}) {
  const ring =
    tone === "warn"
      ? "ring-red-100 bg-red-50/40"
      : tone === "good"
        ? "ring-emerald-100 bg-emerald-50/40"
        : "ring-gray-100 bg-white";
  const iconColor =
    tone === "warn"
      ? "text-red-500"
      : tone === "good"
        ? "text-emerald-600"
        : "text-gray-400";
  return (
    <div
      className={`rounded-xl ring-1 p-4 shadow-sm ${ring}`}
      data-testid={`kpi-${label}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </div>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  );
}

function SegmentBadge({ segment }: { segment: string }) {
  const cls = SEGMENT_BADGE[segment] ?? SEGMENT_BADGE.free;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ring-1 ${cls}`}
    >
      {SEGMENT_LABEL[segment] ?? segment}
    </span>
  );
}

export default async function Admin() {
  const user = await currentUser();
  if (
    user &&
    user.emailAddresses?.[0]?.emailAddress !== "ntirandth@gmail.com"
  ) {
    return (
      <div className="flex justify-center items-center h-screen font-sans text-gray-500">
        Unauthorized
      </div>
    );
  }

  let clerkUsers: any[] = [];
  let overview: AdminUserOverview[] = [];
  let metrics: AdminMetrics | null = null;

  if (user) {
    const [clerkRes, ov, mt] = await Promise.all([
      (await clerkClient()).users.getUserList(),
      getAdminUsersOverview(),
      getAdminMetrics(),
    ]);
    clerkUsers = clerkRes.data;
    overview = ov;
    metrics = mt;
  }

  // Index overview by user_id for O(1) merge.
  const overviewByUser = new Map<string, AdminUserOverview>(
    overview.map((r) => [r.user_id, r]),
  );

  // Display rows: prefer Clerk's user list (authoritative for who exists),
  // backfill with anything in our DB that Clerk doesn't know about (rare).
  const clerkIds = new Set(clerkUsers.map((u) => u.id));
  const orphanRows = overview.filter((r) => !clerkIds.has(r.user_id));

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin</h1>
        <p className="text-sm text-gray-500 mt-1">
          Users, plans, and AI consumption. Numbers cover the rolling 30-day
          window unless noted.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          label="Total users"
          value={String(clerkUsers.length)}
          hint={`${metrics?.total_db_users ?? 0} with a tenant row`}
          Icon={Users}
        />
        <KpiCard
          label="Paying users"
          value={String(metrics?.paying_users ?? 0)}
          hint={`${metrics?.byok_users ?? 0} BYOK · ${metrics?.managed_users ?? 0} Managed · ${metrics?.standard_paid_users ?? 0} Std Paid`}
          Icon={CreditCard}
          tone="good"
        />
        <KpiCard
          label="Free users"
          value={String(metrics?.free_users ?? 0)}
          hint={`Free tier (gemini-2.5-flash-lite)`}
          Icon={Flame}
        />
        <KpiCard
          label="Spend on free users (30d)"
          value={fmtMoney(metrics?.free_spend_30d)}
          hint={`Last 7d: ${fmtMoney(metrics?.free_spend_7d)} — free users earn $0, so this is net loss`}
          Icon={Flame}
          tone="warn"
        />
        <KpiCard
          label="Total AI spend (30d)"
          value={fmtMoney(metrics?.spend_30d)}
          hint={`Last 7d: ${fmtMoney(metrics?.spend_7d)}`}
          Icon={DollarSign}
          tone="warn"
        />
        <KpiCard
          label="Est. MRR"
          value={fmtMoney(metrics?.estimated_mrr)}
          hint={`Sum of active subscription fees (Std Paid + BYOK); excludes one-time top-ups`}
          Icon={TrendingUp}
          tone="good"
        />
      </div>

      {/* Secondary row: revenue, segments, pages, top spenders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl ring-1 ring-emerald-100 bg-emerald-50/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Revenue by category
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SegmentBadge segment="standard_paid" />
                <span className="text-gray-500 text-xs">MRR</span>
              </div>
              <span className="font-semibold text-gray-900">
                {fmtMoney(metrics?.revenue_breakdown?.mrr_standard_paid)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SegmentBadge segment="byok" />
                <span className="text-gray-500 text-xs">MRR</span>
              </div>
              <span className="font-semibold text-gray-900">
                {fmtMoney(metrics?.revenue_breakdown?.mrr_byok)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SegmentBadge segment="managed" />
                <span className="text-gray-500 text-xs">30d top-ups</span>
              </div>
              <span className="font-semibold text-gray-900">
                {fmtMoney(metrics?.revenue_breakdown?.managed_topups_30d)}
              </span>
            </div>
            <div className="text-xs text-gray-500 pt-2 border-t border-emerald-100/60">
              {metrics?.revenue_breakdown?.managed_topups_count_30d ?? 0}{" "}
              managed top-up
              {(metrics?.revenue_breakdown?.managed_topups_count_30d ?? 0) === 1
                ? ""
                : "s"}{" "}
              in last 30d · MRR excludes one-time payments.
            </div>
          </div>
        </div>

        <div className="rounded-xl ring-1 ring-gray-100 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Spend by segment (30d)
            </div>
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-2">
            {(metrics?.by_segment ?? []).map((b) => (
              <div
                key={b.segment}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <SegmentBadge segment={b.segment} />
                  <span className="text-gray-500">{b.users} users</span>
                </div>
                <div className="font-medium text-gray-900">
                  {fmtMoney(b.cost_30d)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl ring-1 ring-gray-100 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Pages processed (30d)
            </div>
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {fmtNumber(metrics?.pages_30d)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Across all tiers and projects
          </div>
        </div>

        <div className="rounded-xl ring-1 ring-gray-100 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Top spenders (30d)
            </div>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-1">
            {(metrics?.top_users_by_spend_30d ?? []).slice(0, 5).map((u) => (
              <div
                key={u.user_id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-600 font-mono text-xs truncate max-w-[60%]">
                  {u.user_id}
                </span>
                <span className="font-medium text-gray-900">
                  {fmtMoney(u.cost_30d)}
                </span>
              </div>
            ))}
            {(!metrics || metrics.top_users_by_spend_30d.length === 0) && (
              <div className="text-sm text-gray-400">No usage yet</div>
            )}
          </div>
        </div>
      </div>

      {/* User table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="min-w-[1200px] w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-left">
              <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">User</th>
              <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Email</th>
              <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Last Sign-In</th>
              <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Segment</th>
              <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Plan</th>
              <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Pages</th>
              <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">AI spend 30d</th>
              <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Tokens 30d</th>
              <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Top model</th>
              <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Last activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {clerkUsers.map((u: any) => {
              const row = overviewByUser.get(u.id);
              return (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 align-top">
                    <div className="font-medium text-gray-900">
                      {u.firstName} {u.lastName}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {u.id}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 align-top">
                    {u.emailAddresses?.[0]?.emailAddress || "—"}
                  </td>
                  <td className="p-4 text-sm text-gray-500 align-top">
                    {u.lastSignInAt
                      ? new Date(u.lastSignInAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="p-4 align-top">
                    {row ? (
                      <SegmentBadge segment={row.segment} />
                    ) : (
                      <span className="text-xs text-gray-400">no tenant</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-700 align-top">
                    <div className="text-sm">
                      {row?.plan_name ?? (row?.segment === "free" ? "Free" : "—")}
                    </div>
                    {row?.plan_end_date && (
                      <div className="text-xs text-gray-400">
                        renews {fmtDate(row.plan_end_date)}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-sm font-semibold text-blue-600 align-top">
                    {row?.total_pages ?? 0}
                  </td>
                  <td className="p-4 text-sm align-top">
                    <div className="font-semibold text-gray-900">
                      {fmtMoney(row?.total_cost_30d)}
                    </div>
                    {!!row?.total_cost_30d && (
                      <div className="text-xs text-gray-400">
                        AI {fmtMoney(row?.ai_cost_30d)} · OCR{" "}
                        {fmtMoney(row?.ocr_cost_30d)}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-700 align-top">
                    {fmtNumber(row?.tokens_30d)}
                    {!!row?.requests_30d && (
                      <div className="text-xs text-gray-400">
                        {row.requests_30d} req
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-xs text-gray-500 align-top font-mono">
                    {row?.top_model_30d ?? "—"}
                  </td>
                  <td className="p-4 text-sm text-gray-500 align-top">
                    {fmtDate(row?.last_activity_at)}
                  </td>
                </tr>
              );
            })}

            {orphanRows.length > 0 && (
              <>
                <tr className="bg-amber-50/40">
                  <td
                    colSpan={10}
                    className="p-3 text-xs text-amber-800 font-medium"
                  >
                    {orphanRows.length} orphan tenant row
                    {orphanRows.length === 1 ? "" : "s"} (in DB but no matching
                    Clerk user — likely deleted accounts). These STILL count
                    toward the KPI numbers above; delete the rows to drop them.
                  </td>
                </tr>
                {orphanRows.map((r) => (
                  <tr
                    key={`orphan-${r.user_id}`}
                    className="bg-amber-50/20 text-amber-900"
                  >
                    <td className="p-4 align-top">
                      <div className="text-xs text-amber-700 font-semibold">
                        Orphan tenant
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {r.user_id}
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 align-top">—</td>
                    <td className="p-4 text-gray-400 align-top">—</td>
                    <td className="p-4 align-top">
                      <SegmentBadge segment={r.segment} />
                    </td>
                    <td className="p-4 text-gray-700 align-top text-sm">
                      {r.plan_name ?? (r.segment === "free" ? "Free" : "—")}
                    </td>
                    <td className="p-4 text-sm font-semibold text-blue-600 align-top">
                      {r.total_pages}
                    </td>
                    <td className="p-4 text-sm align-top">
                      <div className="font-semibold text-gray-900">
                        {fmtMoney(r.total_cost_30d)}
                      </div>
                      {!!r.total_cost_30d && (
                        <div className="text-xs text-gray-400">
                          AI {fmtMoney(r.ai_cost_30d)} · OCR{" "}
                          {fmtMoney(r.ocr_cost_30d)}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-700 align-top">
                      {fmtNumber(r.tokens_30d)}
                    </td>
                    <td className="p-4 text-xs text-gray-500 align-top font-mono">
                      {r.top_model_30d ?? "—"}
                    </td>
                    <td className="p-4 text-sm text-gray-500 align-top">
                      {fmtDate(r.last_activity_at)}
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
