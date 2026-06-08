import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { listAllPosts, type BlogPostListItem } from "@/actions/blog-actions";
import BlogAdminList from "@/components/admin/BlogAdminList";

export const metadata: Metadata = {
  title: "Cellilox | Admin · Blog",
  description: "Create and manage blog posts.",
};

const ADMIN_EMAIL = "ntirandth@gmail.com";

export default async function AdminBlogsPage() {
  const user = await currentUser();
  if (user && user.emailAddresses?.[0]?.emailAddress !== ADMIN_EMAIL) {
    return (
      <div className="flex h-screen items-center justify-center font-sans text-gray-500">
        Unauthorized
      </div>
    );
  }

  let posts: BlogPostListItem[] = [];
  if (user) {
    try {
      posts = await listAllPosts();
    } catch (e) {
      console.error("[admin/blogs] failed to load posts:", e);
    }
  }

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blog</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, edit, and publish posts for the public /blogs section.
          </p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
        >
          + New post
        </Link>
      </div>

      <BlogAdminList posts={posts} />
    </div>
  );
}
