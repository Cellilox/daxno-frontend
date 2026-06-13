import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getPostingForEdit, type JobPosting } from "@/actions/careers-actions";
import PostingEditor from "@/components/admin/PostingEditor";

export const metadata: Metadata = {
  title: "Cellilox | Admin · Edit posting",
};

const ADMIN_EMAIL = "ntirandth@gmail.com";

type Params = { params: Promise<{ id: string }> };

export default async function EditPostingPage({ params }: Params) {
  const user = await currentUser();
  if (user && user.emailAddresses?.[0]?.emailAddress !== ADMIN_EMAIL) {
    return (
      <div className="flex h-screen items-center justify-center font-sans text-gray-500">
        Unauthorized
      </div>
    );
  }

  const { id } = await params;
  let posting: JobPosting;
  try {
    posting = await getPostingForEdit(id);
  } catch (e) {
    console.error("[admin/applications/edit] failed to load posting:", e);
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin/applications" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to careers
        </Link>
        <h1 className="mb-6 mt-3 text-2xl font-bold text-gray-800">Edit job posting</h1>
        <PostingEditor posting={posting} />
      </div>
    </div>
  );
}
