import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedPosts } from "@/actions/blog-actions";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cellilox.com";

// Render per request (SSR). The global <Header> uses Clerk auth()/headers(),
// which cannot be statically prerendered — so opt this route into dynamic
// rendering (matches privacy-policy/page.tsx). New posts surface immediately.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cellilox Blog | Document Automation & AI Data Extraction",
  description:
    "Practical guides on automating invoice and document data extraction, AI-powered document workflows, and getting more done with less manual data entry.",
  alternates: { canonical: `${siteUrl}/blogs` },
  openGraph: {
    title: "Cellilox Blog",
    description:
      "Guides on document automation, AI data extraction, and smarter document workflows.",
    url: `${siteUrl}/blogs`,
    type: "website",
  },
};

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

export default async function BlogsIndexPage() {
  const posts = await listPublishedPosts();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <header className="mb-12 text-center">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">
          Cellilox Blog
        </p>
        <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
          Automate your document workflow
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
          Guides and playbooks on AI data extraction, invoice automation, and
          chatting with your documents — so your team stops typing and starts shipping.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-center text-gray-400">No posts yet — check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blogs/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              {post.cover_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.cover_image_url}
                  alt={post.cover_image_alt ?? post.title}
                  width={800}
                  height={420}
                  loading="lazy"
                  decoding="async"
                  className="h-48 w-full object-cover"
                />
              )}
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-xl font-bold leading-snug text-gray-900 group-hover:text-blue-600">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-500">
                    {post.excerpt}
                  </p>
                )}
                <div className="mt-5 flex items-center gap-2 text-xs text-gray-400">
                  {post.author_name && <span>{post.author_name}</span>}
                  {post.author_name && post.published_at && <span>·</span>}
                  {post.published_at && (
                    <time dateTime={post.published_at}>
                      {formatDate(post.published_at)}
                    </time>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
