"use server";

import { revalidatePath } from "next/cache";
import { buildApiUrl, fetchAuthed } from "@/lib/api-client";

export type BlogPostListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  published: boolean;
  published_at: string | null;
  author_name: string | null;
  updated_at: string;
};

export type BlogPost = BlogPostListItem & {
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  target_keyword: string | null;
  target_audience: string | null;
  created_at: string;
};

export type BlogPostInput = {
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  cover_image_url?: string | null;
  cover_image_alt?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  target_keyword?: string | null;
  target_audience?: string | null;
  published?: boolean;
  author_name?: string | null;
};

// ---------------------------------------------------------------------------
// Public reads (no auth needed). Plain fetch with ISR so crawlers get cached HTML.
// ---------------------------------------------------------------------------
export async function listPublishedPosts(): Promise<BlogPostListItem[]> {
  try {
    const res = await fetch(buildApiUrl("/blog/posts"), {
      next: { revalidate: 300, tags: ["blog"] },
    });
    if (!res.ok) return [];
    return (await res.json()) as BlogPostListItem[];
  } catch (e) {
    console.error("[blog] listPublishedPosts failed:", e);
    return [];
  }
}

export async function getPublishedPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(buildApiUrl(`/blog/posts/${encodeURIComponent(slug)}`), {
      next: { revalidate: 300, tags: ["blog", `blog:${slug}`] },
    });
    if (!res.ok) return null;
    return (await res.json()) as BlogPost;
  } catch (e) {
    console.error("[blog] getPublishedPost failed:", e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Admin reads/writes (Clerk token forwarded; backend enforces ADMIN_EMAILS).
// ---------------------------------------------------------------------------
export async function listAllPosts(): Promise<BlogPostListItem[]> {
  const res = await fetchAuthed(buildApiUrl("/blog/admin/posts"));
  if (!res.ok) throw new Error(`Failed to load posts (${res.status})`);
  return (await res.json()) as BlogPostListItem[];
}

export async function getPostForEdit(id: string): Promise<BlogPost> {
  const res = await fetchAuthed(buildApiUrl(`/blog/admin/posts/${id}`));
  if (!res.ok) throw new Error(`Failed to load post (${res.status})`);
  return (await res.json()) as BlogPost;
}

export async function createPost(input: BlogPostInput): Promise<BlogPost> {
  const res = await fetchAuthed(buildApiUrl("/blog/posts"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const msg = await safeDetail(res);
    throw new Error(msg || `Failed to create post (${res.status})`);
  }
  const post = (await res.json()) as BlogPost;
  revalidateBlog(post.slug);
  return post;
}

export async function updatePost(
  id: string,
  input: Partial<BlogPostInput>,
): Promise<BlogPost> {
  const res = await fetchAuthed(buildApiUrl(`/blog/posts/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const msg = await safeDetail(res);
    throw new Error(msg || `Failed to update post (${res.status})`);
  }
  const post = (await res.json()) as BlogPost;
  revalidateBlog(post.slug);
  return post;
}

export async function deletePost(id: string): Promise<void> {
  const res = await fetchAuthed(buildApiUrl(`/blog/posts/${id}`), {
    method: "DELETE",
  });
  if (!res.ok) {
    const msg = await safeDetail(res);
    throw new Error(msg || `Failed to delete post (${res.status})`);
  }
  revalidateBlog();
}

export async function uploadBlogImage(formData: FormData): Promise<{ url: string }> {
  // formData must contain a `file` field (the image).
  const res = await fetchAuthed(buildApiUrl("/blog/upload-image"), {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const msg = await safeDetail(res);
    throw new Error(msg || `Image upload failed (${res.status})`);
  }
  return (await res.json()) as { url: string };
}

function revalidateBlog(slug?: string) {
  revalidatePath("/blogs");
  if (slug) revalidatePath(`/blogs/${slug}`);
  revalidatePath("/admin/blogs");
  revalidatePath("/sitemap.xml");
}

async function safeDetail(res: Response): Promise<string | null> {
  try {
    const data = await res.json();
    return typeof data?.detail === "string" ? data.detail : null;
  } catch {
    return null;
  }
}
