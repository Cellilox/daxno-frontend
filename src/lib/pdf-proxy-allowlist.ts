/**
 * Host allowlist for the server-side PDF proxy (`/api/pdf-proxy`).
 *
 * The proxy fetches a URL server-side and streams the body back. Without a
 * strict allowlist that is a classic SSRF sink: an attacker could ask the
 * Next server to fetch internal services or the cloud metadata endpoint
 * (169.254.169.254) and read the response. The proxy only ever needs to reach
 * our S3 bucket (presigned URLs), so we hard-restrict it to that host.
 *
 * `isAllowedProxyUrl` is a pure function so it can be unit-tested without a
 * running server.
 */

const DEFAULT_ALLOWED_HOSTS = ["daxno-files-897354.s3.amazonaws.com"];

/**
 * Allowed hostnames, lower-cased. Overridable via `PDF_PROXY_ALLOWED_HOSTS`
 * (comma-separated) for other environments/buckets.
 */
export const getAllowedProxyHosts = (): string[] => {
    const raw = process.env.PDF_PROXY_ALLOWED_HOSTS;
    if (!raw || !raw.trim()) return DEFAULT_ALLOWED_HOSTS;
    return raw
        .split(",")
        .map((h) => h.trim().toLowerCase())
        .filter(Boolean);
};

/**
 * True only for an absolute https URL whose host is an exact match for an
 * allowed host. Everything else — relative URLs, non-https schemes
 * (file:/data:/http:), unparseable input, and any other host — is rejected.
 */
export const isAllowedProxyUrl = (
    rawUrl: string,
    allowedHosts: string[] = getAllowedProxyHosts()
): boolean => {
    let parsed: URL;
    try {
        parsed = new URL(rawUrl);
    } catch {
        return false;
    }

    // https only — blocks http:// SSRF to internal services and file:/data: reads.
    if (parsed.protocol !== "https:") return false;

    // Exact host match. `URL.hostname` excludes port and userinfo, so tricks
    // like `https://allowed.host@evil.com` resolve to `evil.com` and fail.
    return allowedHosts.includes(parsed.hostname.toLowerCase());
};
