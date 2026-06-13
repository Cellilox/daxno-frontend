import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import {
  getPostingForEdit,
  listApplications,
  type JobApplication,
  type JobPosting,
} from "@/actions/careers-actions";
import ApplicationReview from "@/components/admin/ApplicationReview";

export const metadata: Metadata = {
  title: "Cellilox | Admin · Applications",
};

const ADMIN_EMAIL = "ntirandth@gmail.com";

type Params = { params: Promise<{ id: string }> };

export default async function ReviewApplicationsPage({ params }: Params) {
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
  let applications: JobApplication[] = [];
  try {
    posting = await getPostingForEdit(id);
    applications = await listApplications(id);
  } catch (e) {
    console.error("[admin/applications/review] failed to load:", e);
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Link
            href="/admin/applications"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to careers
          </Link>
          <div className="mt-3 flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Applications · {posting.title}
            </h1>
            <Link
              href={`/admin/applications/${posting.id}/edit`}
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Edit posting
            </Link>
          </div>
        </div>

        <ApplicationReview initial={applications} />
      </div>
    </div>
  );
}
