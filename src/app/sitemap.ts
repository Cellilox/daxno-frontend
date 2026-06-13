import type { MetadataRoute } from "next";
import { listPublishedPosts } from "@/actions/blog-actions";
import { listOpenPostings } from "@/actions/careers-actions";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cellilox.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const lastModified = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: `${siteUrl}/`,
            lastModified,
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${siteUrl}/blogs`,
            lastModified,
            changeFrequency: "weekly",
            priority: 0.7,
        },
        {
            url: `${siteUrl}/careers`,
            lastModified,
            changeFrequency: "weekly",
            priority: 0.7,
        },
        {
            url: `${siteUrl}/privacy-policy`,
            lastModified,
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${siteUrl}/terms-of-service`,
            lastModified,
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${siteUrl}/cookie-policy`,
            lastModified,
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${siteUrl}/refund-policy`,
            lastModified,
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];

    // Append each published blog post. Failures must not break the sitemap.
    let postRoutes: MetadataRoute.Sitemap = [];
    try {
        const posts = await listPublishedPosts();
        postRoutes = posts.map((post) => ({
            url: `${siteUrl}/blogs/${post.slug}`,
            lastModified: post.updated_at ? new Date(post.updated_at) : lastModified,
            changeFrequency: "weekly",
            priority: 0.6,
        }));
    } catch (e) {
        console.error("[sitemap] failed to load blog posts:", e);
    }

    // Append each published job posting. Failures must not break the sitemap.
    let careerRoutes: MetadataRoute.Sitemap = [];
    try {
        const postings = await listOpenPostings();
        careerRoutes = postings.map((posting) => ({
            url: `${siteUrl}/careers/${posting.slug}`,
            lastModified: posting.updated_at ? new Date(posting.updated_at) : lastModified,
            changeFrequency: "weekly",
            priority: 0.6,
        }));
    } catch (e) {
        console.error("[sitemap] failed to load job postings:", e);
    }

    return [...staticRoutes, ...postRoutes, ...careerRoutes];
}
