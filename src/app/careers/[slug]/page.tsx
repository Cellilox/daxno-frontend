import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPosting } from "@/actions/careers-actions";
import BlogMarkdown from "@/components/blog/BlogMarkdown";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cellilox.com";

// Render per request (SSR). Matches the blog/privacy-policy convention — the
// global <Header> calls Clerk auth()/headers(), a dynamic API.
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const posting = await getPosting(slug);
  if (!posting) {
    return { title: "Role not found | Cellilox", robots: { index: false } };
  }
  const url = `${siteUrl}/careers/${posting.slug}`;
  const title = posting.meta_title || posting.title;
  const description = posting.meta_description || posting.excerpt || posting.title;
  return {
    title: `${title} | Cellilox Careers`,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article" },
  };
}

function deadlineLabel(iso: string | null): string | null {
  if (!iso) return null;
  // Count whole calendar days to the deadline *date* (stored as end-of-day),
  // normalizing both sides to midnight so a partial day doesn't round up.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(iso);
  due.setHours(0, 0, 0, 0);
  const days = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return "Applications closed";
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  return `Closes in ${days} days`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default async function CareerPostingPage({ params }: Params) {
  const { slug } = await params;
  const posting = await getPosting(slug);
  if (!posting) notFound();

  const url = `${siteUrl}/careers/${posting.slug}`;
  const isAccepting = posting.is_accepting ?? false;
  const label = deadlineLabel(posting.deadline);

  // JobPosting structured data for Google Jobs / rich results.
  const jobJsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: posting.title,
    description: posting.meta_description || posting.excerpt || posting.title,
    datePosted: posting.published_at || posting.created_at,
    validThrough: posting.deadline || undefined,
    employmentType: posting.employment_type || undefined,
    hiringOrganization: {
      "@type": "Organization",
      name: "Cellilox",
      sameAs: siteUrl,
      logo: `${siteUrl}/icon.png`,
    },
    jobLocationType: posting.location?.toLowerCase().includes("remote")
      ? "TELECOMMUTE"
      : undefined,
    applicantLocationRequirements: { "@type": "Country", name: "Rwanda" },
    directApply: true,
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-gray-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-gray-600">Home</Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/careers" className="hover:text-gray-600">Careers</Link>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_300px]">
        {/* Job description */}
        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-black leading-tight tracking-tight text-gray-900 sm:text-4xl">
              {posting.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              {posting.location && <Badge>{posting.location}</Badge>}
              {posting.employment_type && <Badge>{posting.employment_type}</Badge>}
            </div>
          </header>
          <BlogMarkdown content={posting.content} />
        </article>

        {/* Sticky apply sidebar */}
        <aside className="lg:pl-2">
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-6">
              {isAccepting ? (
                <>
                  <Link
                    href={`/careers/${posting.slug}/apply`}
                    className="block w-full rounded-xl bg-gray-900 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                  >
                    Apply now
                  </Link>
                  {label && (
                    <p className="mt-3 text-center text-xs font-medium text-gray-500">
                      {label}
                    </p>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <span className="inline-flex rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
                    Applications closed
                  </span>
                  <p className="mt-3 text-xs text-gray-500">
                    This role is no longer accepting applications.
                  </p>
                </div>
              )}

              <dl className="mt-6 space-y-3 border-t border-gray-200 pt-5 text-sm">
                {posting.location && <Row label="Location" value={posting.location} />}
                {posting.employment_type && (
                  <Row label="Type" value={posting.employment_type} />
                )}
                {posting.deadline && (
                  <Row label="Deadline" value={formatDate(posting.deadline)} />
                )}
              </dl>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-12 border-t border-gray-100 pt-8">
        <Link href="/careers" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          ← Back to all roles
        </Link>
      </div>
    </main>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-600 ring-1 ring-gray-200">
      {children}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-gray-400">{label}</dt>
      <dd className="text-right font-medium text-gray-700">{value}</dd>
    </div>
  );
}
