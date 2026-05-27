"use server";

import { buildApiUrl, fetchAuthed } from "@/lib/api-client";

export type AdminUserOverview = {
  user_id: string;
  email: string | null;
  subscription_type: "standard" | "byok" | "managed" | string;
  segment: "free" | "standard_paid" | "byok" | "managed" | string;
  plan_name: string | null;
  plan_status: string | null;
  plan_end_date: string | null;
  total_pages: number;
  projects_count: number;
  ai_cost_30d: number;
  ocr_cost_30d: number;
  total_cost_30d: number;
  tokens_30d: number;
  requests_30d: number;
  top_model_30d: string | null;
  last_activity_at: string | null;
};

export type AdminTierBucket = {
  segment: string;
  users: number;
  cost_30d: number;
};

export type AdminTopUser = {
  user_id: string;
  cost_30d: number;
  tokens_30d: number;
};

export type AdminRevenueBreakdown = {
  mrr_standard_paid: number;
  mrr_byok: number;
  managed_topups_30d: number;
  managed_topups_count_30d: number;
};

export type AdminMetrics = {
  total_db_users: number;
  paying_users: number;
  free_users: number;
  standard_paid_users: number;
  byok_users: number;
  managed_users: number;
  spend_7d: number;
  spend_30d: number;
  free_spend_7d: number;
  free_spend_30d: number;
  standard_paid_spend_30d: number;
  pages_30d: number;
  estimated_mrr: number;
  revenue_breakdown: AdminRevenueBreakdown;
  by_segment: AdminTierBucket[];
  top_users_by_spend_30d: AdminTopUser[];
};

export async function getAdminUsersOverview(): Promise<AdminUserOverview[]> {
  try {
    const res = await fetchAuthed(buildApiUrl("/admin/users-overview"));
    if (!res.ok) {
      console.error(
        `[admin-actions] users-overview failed: ${res.status} ${res.statusText}`
      );
      return [];
    }
    return (await res.json()) as AdminUserOverview[];
  } catch (err) {
    console.error("[admin-actions] users-overview error:", err);
    return [];
  }
}

export async function getAdminMetrics(): Promise<AdminMetrics | null> {
  try {
    const res = await fetchAuthed(buildApiUrl("/admin/metrics"));
    if (!res.ok) {
      console.error(
        `[admin-actions] metrics failed: ${res.status} ${res.statusText}`
      );
      return null;
    }
    return (await res.json()) as AdminMetrics;
  } catch (err) {
    console.error("[admin-actions] metrics error:", err);
    return null;
  }
}

// Onyx sync health — backend route GET /admin/onyx-sync/health.
// Shape kept narrow to the dashboard's needs.
export type OnyxSyncHealth = {
  failures_last_24h: number;
  failures_by_day_last_7d: Record<string, number>;
  stuck_records_count: number;
  stuck_projects_count: number;
  stuck_projects_by_state: Record<string, number>;
  // Records uploaded but stranded in `__status__ == "awaiting_analysis"`
  // for more than the sweeper's grace window. Image rows in this state
  // defer their Onyx file upload until backfill runs; a non-zero value
  // here usually means a column-add or backfill never completed.
  awaiting_analysis_count?: number;
};

export async function getOnyxSyncHealth(): Promise<OnyxSyncHealth | null> {
  try {
    const res = await fetchAuthed(buildApiUrl("/admin/onyx-sync/health"));
    if (!res.ok) {
      console.error(
        `[admin-actions] onyx-sync/health failed: ${res.status} ${res.statusText}`
      );
      return null;
    }
    return (await res.json()) as OnyxSyncHealth;
  } catch (err) {
    console.error("[admin-actions] onyx-sync/health error:", err);
    return null;
  }
}


export type DeleteAdminTenantResult =
  | { ok: true; user_id: string }
  | { ok: false; error: string };

export async function deleteAdminTenant(
  userId: string
): Promise<DeleteAdminTenantResult> {
  if (!userId) return { ok: false, error: "userId is required" };
  try {
    const res = await fetchAuthed(
      buildApiUrl(`/admin/tenant/${encodeURIComponent(userId)}`),
      { method: "DELETE" }
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Delete failed (${res.status}): ${body || res.statusText}`,
      };
    }
    return { ok: true, user_id: userId };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Network error" };
  }
}
