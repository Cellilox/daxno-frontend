import { auth } from "@clerk/nextjs/server";

export async function getAuthHeaders() {
  const authObj = await auth();
  const headers = new Headers();

  headers.append('Authorization', `Bearer ${await authObj.getToken()}`);
  if (authObj.sessionId) {
    headers.append('sessionId', authObj.sessionId);
  }

  return headers;
}

export async function getJsonAuthHeaders() {
  const headers = await getAuthHeaders();
  headers.append('Content-Type', 'application/json');
  return headers;
}

export async function getFormDataAuthHeaders() {
    const headers = await getAuthHeaders();
    return headers;
  }
  