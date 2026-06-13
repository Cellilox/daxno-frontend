"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createPosting,
  updatePosting,
  type JobPosting,
  type JobPostingInput,
} from "@/actions/careers-actions";
import BlogMarkdown from "@/components/blog/BlogMarkdown";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

// Backend wants ISO datetimes; <input type="date"> gives YYYY-MM-DD.
function toDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

type Props = { posting?: JobPosting };

export default function PostingEditor({ posting }: Props) {
  const router = useRouter();
  const isEdit = !!posting;

  const [title, setTitle] = useState(posting?.title ?? "");
  const [slug, setSlug] = useState(posting?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [content, setContent] = useState(posting?.content ?? "");
  const [excerpt, setExcerpt] = useState(posting?.excerpt ?? "");
  const [location, setLocation] = useState(posting?.location ?? "Remote");
  const [employmentType, setEmploymentType] = useState(
    posting?.employment_type ?? "Internship",
  );
  const [deadline, setDeadline] = useState(toDateInput(posting?.deadline));
  const [metaTitle, setMetaTitle] = useState(posting?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(posting?.meta_description ?? "");
  const [authorName, setAuthorName] = useState(posting?.author_name ?? "Cellilox");
  const [published, setPublished] = useState(posting?.published ?? false);
  const [accepting, setAccepting] = useState(posting?.accepting_applications ?? true);

  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveSlug = slugTouched ? slug : slugify(title);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !effectiveSlug || !content.trim()) {
      setError("Title, slug, and job description are required.");
      return;
    }

    const payload: JobPostingInput = {
      title: title.trim(),
      slug: effectiveSlug,
      content,
      excerpt: excerpt || null,
      location: location || null,
      employment_type: employmentType || null,
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      author_name: authorName || null,
      published,
      accepting_applications: accepting,
      // End-of-day so the chosen day is fully inclusive.
      deadline: deadline ? new Date(`${deadline}T23:59:59`).toISOString() : null,
    };

    setSaving(true);
    try {
      if (isEdit && posting) {
        await updatePosting(posting.id, payload);
      } else {
        await createPosting(payload);
      }
      router.push("/admin/applications");
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to save posting");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Field label="Role title">
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Sales & Growth Intern"
          className={inputCls}
        />
      </Field>

      <Field label="Slug" hint="Lowercase, hyphenated. Used in the public URL.">
        <input
          value={effectiveSlug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          placeholder="sales-growth-intern"
          className={`${inputCls} font-mono text-sm`}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Location">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Remote"
            className={inputCls}
          />
        </Field>
        <Field label="Employment type">
          <input
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            placeholder="Full-Time Internship"
            className={inputCls}
          />
        </Field>
        <Field label="Application deadline" hint="Auto-closes after this day.">
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Job description (Markdown)">
        <div className="mb-2 flex gap-2">
          <button type="button" onClick={() => setShowPreview(false)} className={tabCls(!showPreview)}>
            Write
          </button>
          <button type="button" onClick={() => setShowPreview(true)} className={tabCls(showPreview)}>
            Preview
          </button>
        </div>
        {showPreview ? (
          <div className="min-h-[300px] rounded-lg border border-gray-200 bg-white p-5">
            <BlogMarkdown content={content || "_Nothing to preview yet._"} />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            placeholder="# About the role&#10;&#10;Write the full job description in Markdown…"
            className={`${inputCls} font-mono text-sm leading-relaxed`}
          />
        )}
      </Field>

      <Field label="Excerpt" hint="Short summary shown on the /careers list.">
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className={inputCls}
        />
      </Field>

      <fieldset className="space-y-4 rounded-xl border border-gray-200 p-5">
        <legend className="px-2 text-sm font-semibold text-gray-700">SEO (optional)</legend>
        <Field label="Meta title">
          <input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Defaults to the role title"
            className={inputCls}
          />
        </Field>
        <Field label="Meta description">
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={2}
            placeholder="Defaults to the excerpt"
            className={inputCls}
          />
        </Field>
      </fieldset>

      <Field label="Posted by">
        <input
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className={inputCls}
        />
      </Field>

      <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4"
        />
        <span className="text-sm font-medium text-gray-700">
          Published (visible at /careers)
        </span>
      </label>

      <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
        <input
          type="checkbox"
          checked={accepting}
          onChange={(e) => setAccepting(e.target.checked)}
          className="h-4 w-4"
        />
        <span className="text-sm font-medium text-gray-700">
          Accepting applications (uncheck to close the form early)
        </span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create posting"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/applications")}
          className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

function tabCls(active: boolean) {
  return `rounded-md px-3 py-1.5 text-xs font-medium ${
    active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
  }`;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
