import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cellilox.com";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/dashboard",
                "/agents",
                "/admin",
                "/pricing",
                "/billing",
                "/payments",
                "/accept-invite",
                "/submissions",
                "/invite-error",
                "/offline",
                "/sign-in",
                "/sign-up",
                "/auth/",
                "/api/",
            ],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    };
}
