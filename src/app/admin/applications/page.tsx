import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { listAllPostings, type JobPostingListItem } from "@/actions/careers-actions";
import PostingAdminList from "@/components/admin/PostingAdminList";

export const metadata: Metadata = {
  title: "Cellilox | Admin · Careers",
  description: "Create and manage job postings and review applications.",
};

const ADMIN_EMAIL = "ntirandth@gmail.com";

export default async function AdminApplicationsPage() {
  const user = await currentUser();
  if (user && user.emailAddresses?.[0]?.emailAddress !== ADMIN_EMAIL) {
    return (
      <div className="flex h-screen items-center justify-center font-sans text-gray-500">
        Unauthorized
      </div>
    );
  }

  let postings: JobPostingListItem[] = [];
  if (user) {
    try {
      postings = await listAllPostings();
    } catch (e) {
      console.error("[admin/applications] failed to load postings:", e);
    }
  }

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Careers</h1>
          <p className="mt-1 text-sm text-gray-500">
            Post roles, open/close applications, and review candidates.
          </p>
        </div>
        <Link
          href="/admin/applications/new"
          className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
        >
          + New posting
        </Link>
      </div>

      <PostingAdminList postings={postings} />
    </div>
  );
}
