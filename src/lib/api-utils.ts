const isServer = typeof window === 'undefined';
const internalUrl = process.env.INTERNAL_API_URL;
const publicUrl = process.env.NEXT_PUBLIC_API_URL;

const getBaseUrl = () => {
    // On the server, prefer the internal Docker network URL if available
    if (isServer && internalUrl) {
        return internalUrl;
    }
    // On the client (or server fallback), use the public URL
    // Default to localhost:8000 if not set, preventing crashes if env is missing
    return publicUrl || 'http://localhost:8000';
};

export const API_BASE_URL = getBaseUrl();

/**
 * Safely constructs a URL from a base and a path.
 * Uses string concatenation to avoid 'Invalid URL' crashes with relative paths.
 */
export function getSafeUrl(base: string, path: string = '') {
    // Ensure path starts with / if it's not empty and doesn't already have one
    const normalizedPath = path && !path.startsWith('/') ? `/${path}` : path;
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
    return `${cleanBase}${normalizedPath}`;
}

/**
 * Centrally builds a safe API URL.
 */
export function buildApiUrl(path: string) {
    return getSafeUrl(API_BASE_URL, path);
}

// No longer needed: resolveInternalUrl was for fixing relative proxy -> absolute docker mapping
export function resolveInternalUrl(url: string) {
    return url;
}
