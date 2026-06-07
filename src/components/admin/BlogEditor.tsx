"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createPost,
  updatePost,
  uploadBlogImage,
  type BlogPost,
  type BlogPostInput,
} from "@/actions/blog-actions";
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

type Props = { post?: BlogPost };

export default function BlogEditor({ post }: Props) {
  const router = useRouter();
  const isEdit = !!post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [content, setContent] = useState(post?.content ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url ?? "");
  const [coverImageAlt, setCoverImageAlt] = useState(post?.cover_image_alt ?? "");
  const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? "");
  const [metaKeywords, setMetaKeywords] = useState(post?.meta_keywords ?? "");
  const [targetKeyword, setTargetKeyword] = useState(post?.target_keyword ?? "");
  const [targetAudience, setTargetAudience] = useState(post?.target_audience ?? "");
  const [authorName, setAuthorName] = useState(post?.author_name ?? "Cellilox Team");
  const [published, setPublished] = useState(post?.published ?? false);

  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveSlug = slugTouched ? slug : slugify(title);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function onUploadCover(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { url } = await uploadBlogImage(fd);
      setCoverImageUrl(url);
    } catch (e: any) {
      setError(e?.message ?? "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !effectiveSlug || !content.trim()) {
      setError("Title, slug, and content are required.");
      return;
    }

    const payload: BlogPostInput = {
      title: title.trim(),
      slug: effectiveSlug,
      content,
      excerpt: excerpt || null,
      cover_image_url: coverImageUrl || null,
      cover_image_alt: coverImageAlt || null,
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      meta_keywords: metaKeywords || null,
      target_keyword: targetKeyword || null,
      target_audience: targetAudience || null,
      author_name: authorName || null,
      published,
    };

    setSaving(true);
    try {
      if (isEdit && post) {
        await updatePost(post.id, payload);
      } else {
        await createPost(payload);
      }
      router.push("/admin/blogs");
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to save post");
      setSaving(false);
    }
  }

  const metaTitleLen = (metaTitle || title).length;
  const metaDescLen = (metaDescription || excerpt).length;

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Field label="Title">
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="How to Automate Your Document Workflow"
          className={inputCls}
        />
      </Field>

      <Field label="Slug" hint="Lowercase, hyphenated. Include your target keyword.">
        <input
          value={effectiveSlug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          placeholder="how-to-automate-invoice-data-extraction"
          className={`${inputCls} font-mono text-sm`}
        />
      </Field>

      <Field label="Content (Markdown)">
        <div className="mb-2 flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={tabCls(!showPreview)}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={tabCls(showPreview)}
          >
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
            rows={18}
            placeholder="# Heading&#10;&#10;Write your post in Markdown…"
            className={`${inputCls} font-mono text-sm leading-relaxed`}
          />
        )}
      </Field>

      <Field label="Excerpt" hint="Short summary shown on the blog index and as a fallback meta description.">
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          className={inputCls}
        />
      </Field>

      {/* Cover image */}
      <Field label="Cover image" hint="Used as the OpenGraph/social image (ideal 1200×630).">
        <div className="space-y-3">
          {coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImageUrl}
              alt={coverImageAlt || "cover preview"}
              className="h-40 w-full rounded-lg object-cover"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUploadCover(f);
            }}
            className="block text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
          />
          {uploading && <p className="text-xs text-gray-400">Uploading…</p>}
          <input
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="…or paste an image URL"
            className={`${inputCls} text-sm`}
          />
          <input
            value={coverImageAlt}
            onChange={(e) => setCoverImageAlt(e.target.value)}
            placeholder="Image alt text (for SEO & accessibility)"
            className={`${inputCls} text-sm`}
          />
        </div>
      </Field>

      {/* SEO section */}
      <fieldset className="space-y-4 rounded-xl border border-gray-200 p-5">
        <legend className="px-2 text-sm font-semibold text-gray-700">SEO</legend>

        <Field
          label="Meta title"
          hint={`${metaTitleLen}/60 chars${metaTitleLen > 60 ? " — too long" : ""}`}
          hintWarn={metaTitleLen > 60}
        >
          <input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Defaults to the post title"
            className={inputCls}
          />
        </Field>

        <Field
          label="Meta description"
          hint={`${metaDescLen}/160 chars${metaDescLen > 160 ? " — too long" : ""}`}
          hintWarn={metaDescLen > 160}
        >
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={2}
            placeholder="Defaults to the excerpt"
            className={inputCls}
          />
        </Field>

        <Field label="Target keyword">
          <input
            value={targetKeyword}
            onChange={(e) => setTargetKeyword(e.target.value)}
            placeholder="automate invoice data extraction"
            className={inputCls}
          />
        </Field>

        <Field label="Target audience">
          <input
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="Accounts Payable Teams, SMB Owners, Office Managers"
            className={inputCls}
          />
        </Field>

        <Field label="Meta keywords" hint="Comma-separated.">
          <input
            value={metaKeywords}
            onChange={(e) => setMetaKeywords(e.target.value)}
            className={inputCls}
          />
        </Field>
      </fieldset>

      <Field label="Author name">
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
          Published (visible at /blogs)
        </span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create post"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/blogs")}
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
  hintWarn,
  children,
}: {
  label: string;
  hint?: string;
  hintWarn?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        {hint && (
          <span className={`text-xs ${hintWarn ? "text-red-500" : "text-gray-400"}`}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
