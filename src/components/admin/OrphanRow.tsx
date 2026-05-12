"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import {
  deleteAdminTenant,
  type AdminUserOverview,
} from "@/actions/admin-actions";

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
  return v >= 1 ? `$${v.toFixed(2)}` : v > 0 ? `$${v.toFixed(4)}` : "$0.00";
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

export default function OrphanRow({ row }: { row: AdminUserOverview }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onDelete = () => {
    setError(null);
    const segLabel = SEGMENT_LABEL[row.segment] ?? row.segment;
    const ok = window.confirm(
      `Delete orphan tenant row?\n\n` +
        `user_id: ${row.user_id}\n` +
        `segment: ${segLabel}\n` +
        `30d spend: ${fmtMoney(row.total_cost_30d)}\n\n` +
        `This removes only the tenant record. Associated usage logs, transactions and documents are kept so historical totals are not rewritten.`,
    );
    if (!ok) return;
    startTransition(async () => {
      const res = await deleteAdminTenant(row.user_id);
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  const segCls = SEGMENT_BADGE[row.segment] ?? SEGMENT_BADGE.free;
  const segLabel = SEGMENT_LABEL[row.segment] ?? row.segment;

  return (
    <tr className="bg-amber-50/20 text-amber-900">
      <td className="p-4 align-top">
        <div className="text-xs text-amber-700 font-semibold">Orphan tenant</div>
        <div className="text-xs text-gray-500 font-mono break-all">{row.user_id}</div>
        <button
          type="button"
          onClick={onDelete}
          disabled={isPending}
          className="mt-2 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md ring-1 ring-red-200 bg-white text-red-700 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          data-testid={`delete-orphan-${row.user_id}`}
        >
          {isPending ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Deleting…
            </>
          ) : (
            <>
              <Trash2 className="w-3 h-3" />
              Delete
            </>
          )}
        </button>
        {error && (
          <div className="mt-1 text-xs text-red-700 max-w-[14rem]">{error}</div>
        )}
      </td>
      <td className="p-4 text-gray-400 align-top">—</td>
      <td className="p-4 text-gray-400 align-top">—</td>
      <td className="p-4 align-top">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ring-1 ${segCls}`}
        >
          {segLabel}
        </span>
      </td>
      <td className="p-4 text-gray-700 align-top text-sm">
        {row.plan_name ?? (row.segment === "free" ? "Free" : "—")}
      </td>
      <td className="p-4 text-sm font-semibold text-blue-600 align-top">
        {row.total_pages}
      </td>
      <td className="p-4 text-sm align-top">
        <div className="font-semibold text-gray-900">
          {fmtMoney(row.total_cost_30d)}
        </div>
        {!!row.total_cost_30d && (
          <div className="text-xs text-gray-400">
            AI {fmtMoney(row.ai_cost_30d)} · OCR {fmtMoney(row.ocr_cost_30d)}
          </div>
        )}
      </td>
      <td className="p-4 text-sm text-gray-700 align-top">
        {fmtNumber(row.tokens_30d)}
      </td>
      <td className="p-4 text-xs text-gray-500 align-top font-mono">
        {row.top_model_30d ?? "—"}
      </td>
      <td className="p-4 text-sm text-gray-500 align-top">
        {fmtDate(row.last_activity_at)}
      </td>
    </tr>
  );
}
