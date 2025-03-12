import { getAuthHeaders, getJsonAuthHeaders } from "./server-headers";

export async function fetchAuthed(url: string, options?: RequestInit) {
    const headers = await getAuthHeaders();

    if (options?.headers) {
      const extraHeaders = new Headers(options.headers);
      extraHeaders.forEach((value, key) => {
        headers.set(key, value);
      });
    }
  
    return fetch(url, {
      ...options,
      headers, 
    });
  }
  
  export async function fetchAuthedJson(url: string, options?: RequestInit) {
    const headers = await getJsonAuthHeaders();
  
    if (options?.headers) {
      const extraHeaders = new Headers(options.headers);
      extraHeaders.forEach((value, key) => {
        headers.set(key, value);
      });
    }
  
    return fetch(url, {
      ...options,
      headers,
    });
  }
  