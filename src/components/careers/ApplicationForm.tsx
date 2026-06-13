"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { submitApplication } from "@/actions/careers-actions";

const MAX_RESUME_MB = 5;
const RESUME_ACCEPT = ".pdf,.doc,.docx";
const RESUME_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

type FormValues = {
  full_name: string;
  email: string;
  university: string;
  field_of_study: string;
  education_level: string;
  graduation_year: string;
  why_interested: string;
  initiative_example: string;
  linkedin_url: string;
  company_website: string; // honeypot
};

export default function ApplicationForm({ slug }: { slug: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const [resume, setResume] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onPickResume(file: File | undefined) {
    setResumeError(null);
    if (!file) {
      setResume(null);
      return;
    }
    if (!RESUME_MIME.includes(file.type)) {
      setResumeError("Resume must be a PDF or Word document.");
      setResume(null);
      return;
    }
    if (file.size > MAX_RESUME_MB * 1024 * 1024) {
      setResumeError(`File too large — max ${MAX_RESUME_MB} MB.`);
      setResume(null);
      return;
    }
    setResume(file);
  }

  async function onSubmit(values: FormValues) {
    setError(null);
    if (!resume) {
      setResumeError("Please attach your resume (PDF or Word).");
      return;
    }

    const fd = new FormData();
    fd.append("full_name", values.full_name);
    fd.append("email", values.email);
    fd.append("why_interested", values.why_interested);
    fd.append("initiative_example", values.initiative_example);
    if (values.linkedin_url) fd.append("linkedin_url", values.linkedin_url);
    if (values.university) fd.append("university", values.university);
    if (values.field_of_study) fd.append("field_of_study", values.field_of_study);
    if (values.education_level) fd.append("education_level", values.education_level);
    if (values.graduation_year) fd.append("graduation_year", values.graduation_year);
    if (values.company_website) fd.append("company_website", values.company_website);
    fd.append("resume", resume);

    setSubmitting(true);
    try {
      await submitApplication(slug, fd);
      setDone(true);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-xl text-white">
          ✓
        </div>
        <h2 className="text-xl font-bold text-gray-900">Application received</h2>
        <p className="mt-2 text-sm text-gray-600">
          Thanks for applying. We review every application and will be in touch if
          there&apos;s a fit. Good luck!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* About you */}
      <Section title="About you">
        <Field label="Full name" error={errors.full_name?.message}>
          <input
            className={inputCls}
            placeholder="Jane Doe"
            {...register("full_name", { required: "Your name is required" })}
          />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input
            type="email"
            className={inputCls}
            placeholder="jane@example.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Enter a valid email address",
              },
            })}
          />
        </Field>
      </Section>

      {/* Education */}
      <Section title="Education">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="University / School">
            <input
              className={inputCls}
              placeholder="University of Rwanda"
              {...register("university")}
            />
          </Field>
          <Field label="Field of study">
            <input
              className={inputCls}
              placeholder="Marketing"
              {...register("field_of_study")}
            />
          </Field>
          <Field label="Education level">
            <select className={inputCls} defaultValue="" {...register("education_level")}>
              <option value="">Select…</option>
              <option>Currently studying</option>
              <option>Bachelor&apos;s</option>
              <option>Master&apos;s</option>
              <option>Diploma / Certificate</option>
              <option>Other</option>
            </select>
          </Field>
          <Field label="Graduation year" error={errors.graduation_year?.message}>
            <input
              type="number"
              className={inputCls}
              placeholder="2026"
              {...register("graduation_year", {
                min: { value: 1980, message: "Enter a valid year" },
                max: { value: 2100, message: "Enter a valid year" },
              })}
            />
          </Field>
        </div>
      </Section>

      {/* Your fit */}
      <Section title="Your fit">
        <Field
          label="Why do you want this role?"
          hint="3–5 sentences."
          error={errors.why_interested?.message}
        >
          <textarea
            rows={4}
            className={inputCls}
            {...register("why_interested", {
              required: "Tell us why you're interested",
              minLength: { value: 20, message: "A little more detail, please" },
            })}
          />
        </Field>
        <Field
          label="A time you took initiative"
          hint="School, a project, or any experience."
          error={errors.initiative_example?.message}
        >
          <textarea
            rows={4}
            className={inputCls}
            {...register("initiative_example", {
              required: "Share one example of taking initiative",
              minLength: { value: 20, message: "A little more detail, please" },
            })}
          />
        </Field>
      </Section>

      {/* Resume & links */}
      <Section title="Resume & links">
        <Field label="Resume / CV" hint="PDF or Word, max 5 MB. Required.">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/40">
            <input
              type="file"
              accept={RESUME_ACCEPT}
              className="hidden"
              onChange={(e) => onPickResume(e.target.files?.[0])}
            />
            {resume ? (
              <span className="text-sm font-medium text-gray-800">
                📄 {resume.name}{" "}
                <span className="text-gray-400">
                  ({Math.round(resume.size / 1024)} KB)
                </span>
              </span>
            ) : (
              <span className="text-sm text-gray-500">
                Click to upload your resume
              </span>
            )}
          </label>
          {resumeError && (
            <p className="mt-1.5 text-xs text-red-500">{resumeError}</p>
          )}
        </Field>
        <Field label="LinkedIn URL" hint="Optional.">
          <input
            className={inputCls}
            placeholder="https://linkedin.com/in/you"
            {...register("linkedin_url")}
          />
        </Field>
      </Section>

      {/* Honeypot — hidden from real users; bots fill it and get silently dropped. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        {...register("company_website")}
      />

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
