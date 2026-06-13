import type { Metadata } from "next";
import Link from "next/link";
import { listOpenPostings } from "@/actions/careers-actions";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cellilox.com";

// Render per request (SSR) — the global <Header> uses Clerk auth()/headers(),
// which can't be statically prerendered. New roles surface immediately.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Careers at Cellilox | Join us",
  description:
    "Open roles at Cellilox — help us build the AI platform that turns business documents into clean, structured data. Remote-friendly, built in Rwanda.",
  alternates: { canonical: `${siteUrl}/careers` },
  openGraph: {
    title: "Careers at Cellilox",
    description: "Open roles at Cellilox — build AI for document automation with us.",
    url: `${siteUrl}/careers`,
    type: "website",
  },
};

function deadlineLabel(iso: string | null): string | null {
  if (!iso) return null;
  // Count whole calendar days between today and the deadline *date*. The
  // deadline is stored as end-of-day, so comparing raw timestamps would round
  // a partial day up (tomorrow → "in 2 days"). Normalize both to midnight.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(iso);
  due.setHours(0, 0, 0, 0);
  const days = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return "Closed";
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  return `Closes in ${days} days`;
}

export default async function CareersIndexPage() {
  const postings = await listOpenPostings();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
      <header className="mb-12 text-center">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">
          Careers
        </p>
        <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
          Build the future of document AI
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
          We&apos;re a focused team building the platform that turns invoices, contracts and
          statements into clean, structured data. Come help us grow.
        </p>
      </header>

      {postings.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
          No open roles right now — check back soon.
        </p>
      ) : (
        <div className="space-y-4">
          {postings.map((p) => {
            const label = deadlineLabel(p.deadline);
            return (
              <Link
                key={p.id}
                href={`/careers/${p.slug}`}
                className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                    {p.title}
                  </h2>
                  {p.excerpt && (
                    <p className="mt-1.5 line-clamp-2 max-w-xl text-sm text-gray-500">
                      {p.excerpt}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    {p.location && <Badge>{p.location}</Badge>}
                    {p.employment_type && <Badge>{p.employment_type}</Badge>}
                    {label && (
                      <span className="text-gray-400">{label}</span>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold text-blue-600 group-hover:translate-x-0.5">
                  View role →
                </span>
              </Link>
            );
          })}
        </div>
      )}
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
