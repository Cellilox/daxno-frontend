import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getPostForEdit, type BlogPost } from "@/actions/blog-actions";
import BlogEditor from "@/components/admin/BlogEditor";

export const metadata: Metadata = {
  title: "Cellilox | Admin · Edit post",
};

const ADMIN_EMAIL = "ntirandth@gmail.com";

type Params = { params: Promise<{ id: string }> };

export default async function EditBlogPostPage({ params }: Params) {
  const user = await currentUser();
  if (user && user.emailAddresses?.[0]?.emailAddress !== ADMIN_EMAIL) {
    return (
      <div className="flex h-screen items-center justify-center font-sans text-gray-500">
        Unauthorized
      </div>
    );
  }

  const { id } = await params;
  let post: BlogPost;
  try {
    post = await getPostForEdit(id);
  } catch (e) {
    console.error("[admin/blogs/edit] failed to load post:", e);
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin/blogs" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to posts
        </Link>
        <h1 className="mb-6 mt-3 text-2xl font-bold text-gray-800">Edit post</h1>
        <BlogEditor post={post} />
      </div>
    </div>
  );
}
