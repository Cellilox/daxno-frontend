import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPosting } from "@/actions/careers-actions";
import ApplicationForm from "@/components/careers/ApplicationForm";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const posting = await getPosting(slug);
  return {
    title: posting ? `Apply · ${posting.title} | Cellilox` : "Apply | Cellilox",
    robots: { index: false },
  };
}

export default async function ApplyPage({ params }: Params) {
  const { slug } = await params;
  const posting = await getPosting(slug);
  if (!posting) notFound();

  const isAccepting = posting.is_accepting ?? false;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <Link
        href={`/careers/${posting.slug}`}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back to role
      </Link>

      <h1 className="mb-1 mt-4 text-3xl font-black tracking-tight text-gray-900">
        Apply: {posting.title}
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        We care about energy and honesty more than polish. This takes a few minutes.
      </p>

      {isAccepting ? (
        <ApplicationForm slug={posting.slug} />
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
          <span className="inline-flex rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
            Applications closed
          </span>
          <p className="mt-3 text-sm text-gray-600">
            This role is no longer accepting applications. See our other open roles.
          </p>
          <Link
            href="/careers"
            className="mt-5 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
          >
            View open roles
          </Link>
        </div>
      )}
    </main>
  );
}
