"use client";

import { useMemo, useState } from "react";
import {
  deleteApplication,
  getResumeUrl,
  updateApplication,
  type ApplicationStatus,
  type JobApplication,
} from "@/actions/careers-actions";

const STATUSES: { key: ApplicationStatus; label: string }[] = [
  { key: "new", label: "New" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "rejected", label: "Rejected" },
];

type Filter = "all" | ApplicationStatus;

export default function ApplicationReview({
  initial,
}: {
  initial: JobApplication[];
}) {
  const [apps, setApps] = useState<JobApplication[]>(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = { all: apps.length, new: 0, shortlisted: 0, rejected: 0 } as Record<Filter, number>;
    for (const a of apps) c[a.status] += 1;
    return c;
  }, [apps]);

  const visible = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  async function onStatus(app: JobApplication, status: ApplicationStatus) {
    setError(null);
    const prev = apps;
    setApps((xs) => xs.map((a) => (a.id === app.id ? { ...a, status } : a)));
    try {
      await updateApplication(app.id, { status });
    } catch (e: any) {
      setApps(prev);
      setError(e?.message ?? "Failed to update status");
    }
  }

  async function onNotes(app: JobApplication, admin_notes: string) {
    if (admin_notes === (app.admin_notes ?? "")) return;
    setError(null);
    try {
      await updateApplication(app.id, { admin_notes });
      setApps((xs) => xs.map((a) => (a.id === app.id ? { ...a, admin_notes } : a)));
    } catch (e: any) {
      setError(e?.message ?? "Failed to save notes");
    }
  }

  async function onResume(app: JobApplication) {
    setError(null);
    try {
      const { url } = await getResumeUrl(app.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      setError(e?.message ?? "Could not open resume");
    }
  }

  async function onDelete(app: JobApplication) {
    if (!confirm(`Delete the application from ${app.full_name}? This also deletes their resume.`))
      return;
    setError(null);
    const prev = apps;
    setApps((xs) => xs.filter((a) => a.id !== app.id));
    try {
      await deleteApplication(app.id);
    } catch (e: any) {
      setApps(prev);
      setError(e?.message ?? "Failed to delete");
    }
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        <Tab active={filter === "all"} onClick={() => setFilter("all")} label="All" count={counts.all} />
        {STATUSES.map((s) => (
          <Tab
            key={s.key}
            active={filter === s.key}
            onClick={() => setFilter(s.key)}
            label={s.label}
            count={counts[s.key]}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-gray-400">
          No applications {filter === "all" ? "yet" : `in “${filter}”`}.
        </p>
      ) : (
        <div className="space-y-4">
          {visible.map((app) => (
            <Card
              key={app.id}
              app={app}
              onStatus={onStatus}
              onNotes={onNotes}
              onResume={onResume}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function educationLine(app: JobApplication): string {
  const parts = [app.field_of_study, app.university, app.graduation_year?.toString()].filter(
    Boolean,
  );
  const level = app.education_level ? `${app.education_level}` : "";
  return [level, parts.join(" · ")].filter(Boolean).join(" — ");
}

function Card({
  app,
  onStatus,
  onNotes,
  onResume,
  onDelete,
}: {
  app: JobApplication;
  onStatus: (a: JobApplication, s: ApplicationStatus) => void;
  onNotes: (a: JobApplication, n: string) => void;
  onResume: (a: JobApplication) => void;
  onDelete: (a: JobApplication) => void;
}) {
  const edu = educationLine(app);
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">{app.full_name}</h3>
            <StatusBadge status={app.status} />
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-gray-500">
            <a href={`mailto:${app.email}`} className="hover:text-blue-600">
              {app.email}
            </a>
            <span className="text-gray-300">·</span>
            <time className="text-gray-400">
              {new Date(app.created_at).toLocaleDateString()}
            </time>
          </div>
          {edu && <p className="mt-1 text-sm text-gray-600">🎓 {edu}</p>}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => onResume(app)}
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600"
          >
            Resume
          </button>
          {app.linkedin_url && (
            <a
              href={app.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              LinkedIn
            </a>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Answer label="Why interested" value={app.why_interested} />
        <Answer label="Took initiative" value={app.initiative_example} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-50 pt-4">
        <div className="flex items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-gray-400">Set status:</span>
          {STATUSES.map((s) => (
            <button
              key={s.key}
              onClick={() => onStatus(app, s.key)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                app.status === s.key
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => onDelete(app)}
          className="text-xs font-medium text-red-500 hover:text-red-600"
        >
          Delete
        </button>
      </div>

      <div className="mt-3">
        <textarea
          defaultValue={app.admin_notes ?? ""}
          onBlur={(e) => onNotes(app, e.target.value)}
          rows={2}
          placeholder="Private notes (saved when you click away)…"
          className="w-full rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}

function Answer({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50/70 p-3">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const styles = {
    new: "bg-blue-50 text-blue-700 ring-blue-200",
    shortlisted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    rejected: "bg-gray-100 text-gray-500 ring-gray-200",
  }[status];
  const label = { new: "New", shortlisted: "Shortlisted", rejected: "Rejected" }[status];
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${styles}`}>
      {label}
    </span>
  );
}

function Tab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ${
        active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 text-xs ${
          active ? "bg-white/20 text-white" : "bg-white text-gray-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
