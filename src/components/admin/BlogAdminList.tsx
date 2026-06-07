"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deletePost, type BlogPostListItem } from "@/actions/blog-actions";

export default function BlogAdminList({ posts }: { posts: BlogPostListItem[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onDelete(post: BlogPostListItem) {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setBusyId(post.id);
    setError(null);
    try {
      await deletePost(post.id);
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete");
    } finally {
      setBusyId(null);
    }
  }

  if (posts.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-gray-400">
        No posts yet. Create your first one.
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
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50/60">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{post.title}</div>
                  <div className="font-mono text-xs text-gray-400">/{post.slug}</div>
                </td>
                <td className="px-4 py-3">
                  {post.published ? (
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
                      Draft
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(post.updated_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {post.published && (
                      <Link
                        href={`/blogs/${post.slug}`}
                        target="_blank"
                        className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                      >
                        View
                      </Link>
                    )}
                    <Link
                      href={`/admin/blogs/${post.id}/edit`}
                      className="rounded-md px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => onDelete(post)}
                      disabled={busyId === post.id}
                      className="rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {busyId === post.id ? "…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
