"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deletePosting,
  updatePosting,
  type JobPostingListItem,
} from "@/actions/careers-actions";

function status(p: JobPostingListItem): "Draft" | "Open" | "Closed" {
  if (!p.published) return "Draft";
  return p.is_accepting ? "Open" : "Closed";
}

export default function PostingAdminList({
  postings,
}: {
  postings: JobPostingListItem[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onDelete(p: JobPostingListItem) {
    if (
      !confirm(
        `Delete "${p.title}" and all its applications? This cannot be undone.`,
      )
    )
      return;
    setBusyId(p.id);
    setError(null);
    try {
      await deletePosting(p.id);
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete");
    } finally {
      setBusyId(null);
    }
  }

  async function onToggleOpen(p: JobPostingListItem) {
    setBusyId(p.id);
    setError(null);
    try {
      await updatePosting(p.id, { accepting_applications: !p.accepting_applications });
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to update");
    } finally {
      setBusyId(null);
    }
  }

  if (postings.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-gray-400">
        No job postings yet. Create your first one.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Applications</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {postings.map((p) => {
              const s = status(p);
              const total = p.application_count ?? 0;
              const fresh = p.new_application_count ?? 0;
              return (
                <tr key={p.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.title}</div>
                    <div className="font-mono text-xs text-gray-400">/{p.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip status={s} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/applications/${p.id}`}
                      className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
                    >
                      <span className="font-semibold">{total}</span>
                      <span className="text-gray-400">total</span>
                      {fresh > 0 && (
                        <span className="inline-flex rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                          {fresh} new
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/applications/${p.id}`}
                        className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Review
                      </Link>
                      {p.published && (
                        <button
                          onClick={() => onToggleOpen(p)}
                          disabled={busyId === p.id}
                          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                        >
                          {p.accepting_applications ? "Close" : "Reopen"}
                        </button>
                      )}
                      <Link
                        href={`/admin/applications/${p.id}/edit`}
                        className="rounded-md px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => onDelete(p)}
                        disabled={busyId === p.id}
                        className="rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {busyId === p.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: "Draft" | "Open" | "Closed" }) {
  const styles = {
    Open: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Closed: "bg-amber-50 text-amber-700 ring-amber-200",
    Draft: "bg-gray-100 text-gray-600 ring-gray-200",
  }[status];
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${styles}`}
    >
      {status}
    </span>
  );
}
