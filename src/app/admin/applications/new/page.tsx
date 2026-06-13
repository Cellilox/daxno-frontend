import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import PostingEditor from "@/components/admin/PostingEditor";

export const metadata: Metadata = {
  title: "Cellilox | Admin · New posting",
};

const ADMIN_EMAIL = "ntirandth@gmail.com";

export default async function NewPostingPage() {
  const user = await currentUser();
  if (user && user.emailAddresses?.[0]?.emailAddress !== ADMIN_EMAIL) {
    return (
      <div className="flex h-screen items-center justify-center font-sans text-gray-500">
        Unauthorized
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin/applications" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to careers
        </Link>
        <h1 className="mb-6 mt-3 text-2xl font-bold text-gray-800">New job posting</h1>
        <PostingEditor />
      </div>
    </div>
  );
}
