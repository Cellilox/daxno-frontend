import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

export async function getRequestAuthHeaders() {
  const authObj = await auth();
  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get('cookie');

  const token = await authObj.getToken();
  const resultHeaders = new Headers();

  if (token) {
    resultHeaders.append('Authorization', `Bearer ${token}`);
  } else {
    console.log(`[SERVER-HEADERS] No token found. Cookies present: ${!!cookieHeader} (Length: ${cookieHeader?.length || 0})`);
  }
  return resultHeaders;
}

export async function JsonAuthRequestHeaders() {
  const headers = await getRequestAuthHeaders();
  headers.append('Content-Type', 'application/json');
  return headers;
}
