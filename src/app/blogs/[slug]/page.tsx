import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPost, listPublishedPosts } from "@/actions/blog-actions";
import BlogMarkdown from "@/components/blog/BlogMarkdown";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cellilox.com";

export const revalidate = 300;

// Pre-render known published slugs at build for instant, crawlable HTML.
export async function generateStaticParams() {
  const posts = await listPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) {
    return { title: "Post not found | Cellilox", robots: { index: false } };
  }

  const url = `${siteUrl}/blogs/${post.slug}`;
  const title = post.meta_title || post.title;
  const description =
    post.meta_description || post.excerpt || post.title;
  const images = post.cover_image_url ? [{ url: post.cover_image_url }] : undefined;

  return {
    title: `${title} | Cellilox`,
    description,
    keywords: post.meta_keywords || post.target_keyword || undefined,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at,
      authors: post.author_name ? [post.author_name] : undefined,
      images,
    },
    twitter: {
      card: post.cover_image_url ? "summary_large_image" : "summary",
      title,
      description,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
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

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const url = `${siteUrl}/blogs/${post.slug}`;
  const description = post.meta_description || post.excerpt || post.title;

  // BlogPosting structured data for rich results.
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    image: post.cover_image_url ? [post.cover_image_url] : undefined,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    author: {
      "@type": "Organization",
      name: post.author_name || "Cellilox",
      url: siteUrl,
      description:
        "Cellilox builds AI tools that read business documents — invoices, bank statements, contracts and more — and turn them into structured data for finance and operations teams.",
    },
    publisher: {
      "@type": "Organization",
      name: "Cellilox",
      url: siteUrl,
      logo: { "@type": "ImageObject", url: `${siteUrl}/icon.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: post.meta_keywords || post.target_keyword || undefined,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Blogs", item: `${siteUrl}/blogs` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-gray-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-gray-600">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/blogs" className="hover:text-gray-600">
              Blogs
            </Link>
          </li>
        </ol>
      </nav>

      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-black leading-tight tracking-tight text-gray-900 sm:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            {post.author_name && <span>{post.author_name}</span>}
            {post.author_name && post.published_at && <span>·</span>}
            {post.published_at && (
              <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
            )}
          </div>
        </header>

        {post.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image_url}
            alt={post.cover_image_alt ?? post.title}
            width={1200}
            height={630}
            decoding="async"
            className="mb-10 w-full rounded-2xl object-cover"
          />
        )}

        <BlogMarkdown content={post.content} />
      </article>

      {/* Author / publisher block — establishes the entity behind the content (E-E-A-T). */}
      <aside className="mt-12 rounded-2xl border border-gray-100 bg-gray-50/70 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gray-900 text-sm font-bold text-white">
            C
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {post.author_name || "Cellilox Team"}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
              Cellilox builds AI tools that read business documents — invoices, bank
              statements, contracts and more — and turn them into structured data finance
              and operations teams can actually use. We write about the document workflows
              we work with every day.
            </p>
          </div>
        </div>
      </aside>

      <div className="mt-12 border-t border-gray-100 pt-8">
        <Link
          href="/blogs"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to all posts
        </Link>
      </div>
    </main>
  );
}
