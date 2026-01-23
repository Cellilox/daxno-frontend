import { getRequestAuthHeaders, JsonAuthRequestHeaders } from "./server-headers";
import { resolveInternalUrl } from "./api-utils";

export { getSafeUrl, buildApiUrl, API_BASE_URL } from "./api-utils";

export async function fetchAuthed(url: string, options?: RequestInit) {
  const headers = await getRequestAuthHeaders();
  const resolvedUrl = resolveInternalUrl(url);

  console.log(`[API_CLIENT] Fetching: ${resolvedUrl}`);

  if (options?.headers) {
    const extraHeaders = new Headers(options.headers);
    extraHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  let response: Response;
  try {
    response = await fetch(resolvedUrl, {
      ...options,
      headers,
    });
  } catch (error: any) {
    console.error(`[API_CLIENT] Network/Fetch failure for ${resolvedUrl}:`, error.message);
    throw error; // Re-throw to allow component handling
  }

  if (!response.ok) {
    // Silence 401s specifically as they are expected during session reconnection/handshake
    if (response.status !== 401) {
      console.error(`[API_CLIENT] HTTP Error: ${response.status} ${response.statusText} for ${resolvedUrl}`);
    }
  }

  return response;
}

export async function fetchAuthedJson(url: string, options?: RequestInit) {
  const headers = await JsonAuthRequestHeaders();
  const resolvedUrl = resolveInternalUrl(url);

  console.log(`[API_CLIENT] Fetching JSON: ${resolvedUrl}`);

  if (options?.headers) {
    const extraHeaders = new Headers(options.headers);
    extraHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  const response = await fetch(resolvedUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status !== 401) {
      console.error(`[API_CLIENT] JSON Error: ${response.status} for ${resolvedUrl}`);
    }
  }

  return response;
}



