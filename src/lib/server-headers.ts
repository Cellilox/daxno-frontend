import { auth } from "@clerk/nextjs/server";

export async function getRequestAuthHeaders() {
  const authObj = await auth();
  const headers = new Headers();

  headers.append('Authorization', `Bearer ${await authObj.getToken()}`);
  if (authObj.sessionId) {
    headers.append('sessionId', authObj.sessionId);
  }

  return headers;
}

export async function JsonAuthRequestHeaders() {
  const headers = await getRequestAuthHeaders();
  headers.append('Content-Type', 'application/json');
  return headers;
}
