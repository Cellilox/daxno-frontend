import { getRequestAuthHeaders, JsonAuthRequestHeaders } from "./server-headers";

const isServer = typeof window === 'undefined';
const internalUrl = process.env.INTERNAL_API_URL;
const publicUrl = process.env.NEXT_PUBLIC_API_URL || '';

function resolveInternalUrl(url: string) {
  // If we are on the server and have an internal URL, 
  // we swap the public URL piece with the internal service name.
  if (isServer && internalUrl && publicUrl && url.startsWith(publicUrl)) {
    return url.replace(publicUrl, internalUrl);
  }
  return url;
}

export async function fetchAuthed(url: string, options?: RequestInit) {
  const headers = await getRequestAuthHeaders();
  const resolvedUrl = resolveInternalUrl(url);

  if (options?.headers) {
    const extraHeaders = new Headers(options.headers);
    extraHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return fetch(resolvedUrl, {
    ...options,
    headers,
  });
}

export async function fetchAuthedJson(url: string, options?: RequestInit) {
  const headers = await JsonAuthRequestHeaders();
  const resolvedUrl = resolveInternalUrl(url);

  if (options?.headers) {
    const extraHeaders = new Headers(options.headers);
    extraHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return fetch(resolvedUrl, {
    ...options,
    headers,
  });
}



