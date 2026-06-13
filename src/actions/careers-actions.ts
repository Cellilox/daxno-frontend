"use server";

import { revalidatePath } from "next/cache";
import { buildApiUrl, fetchAuthed } from "@/lib/api-client";

export type ApplicationStatus = "new" | "shortlisted" | "rejected";

export type JobPostingListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  location: string | null;
  employment_type: string | null;
  published: boolean;
  accepting_applications: boolean;
  deadline: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Present on the admin listing only:
  is_accepting?: boolean;
  application_count?: number;
  new_application_count?: number;
};

export type JobPosting = JobPostingListItem & {
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  author_name: string | null;
};

export type JobPostingInput = {
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  location?: string | null;
  employment_type?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  published?: boolean;
  accepting_applications?: boolean;
  deadline?: string | null;
  author_name?: string | null;
};

export type JobApplication = {
  id: string;
  posting_id: string;
  full_name: string;
  email: string;
  linkedin_url: string | null;
  resume_filename: string;
  why_interested: string;
  initiative_example: string;
  university: string | null;
  field_of_study: string | null;
  education_level: string | null;
  graduation_year: number | null;
  status: ApplicationStatus;
  admin_notes: string | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Public reads + apply (no auth needed).
// ---------------------------------------------------------------------------
export async function listOpenPostings(): Promise<JobPostingListItem[]> {
  try {
    const res = await fetch(buildApiUrl("/careers/postings"), { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as JobPostingListItem[];
  } catch (e) {
    console.error("[careers] listOpenPostings failed:", e);
    return [];
  }
}

export async function getPosting(slug: string): Promise<JobPosting | null> {
  try {
    const res = await fetch(buildApiUrl(`/careers/postings/${encodeURIComponent(slug)}`), {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as JobPosting;
  } catch (e) {
    console.error("[careers] getPosting failed:", e);
    return null;
  }
}

/** Submit a public application. `formData` carries the text fields + the
 * `resume` file. Returns `{ ok: true }` or throws with the backend's detail. */
export async function submitApplication(
  slug: string,
  formData: FormData,
): Promise<{ ok: true }> {
  const res = await fetch(
    buildApiUrl(`/careers/postings/${encodeURIComponent(slug)}/apply`),
    { method: "POST", body: formData, cache: "no-store" },
  );
  if (!res.ok) {
    const msg = await safeDetail(res);
    throw new Error(msg || `Could not submit application (${res.status})`);
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Admin reads/writes (Clerk token forwarded; backend enforces ADMIN_EMAILS).
// ---------------------------------------------------------------------------
export async function listAllPostings(): Promise<JobPostingListItem[]> {
  const res = await fetchAuthed(buildApiUrl("/careers/admin/postings"));
  if (!res.ok) throw new Error(`Failed to load postings (${res.status})`);
  return (await res.json()) as JobPostingListItem[];
}

export async function getPostingForEdit(id: string): Promise<JobPosting> {
  const res = await fetchAuthed(buildApiUrl(`/careers/admin/postings/${id}`));
  if (!res.ok) throw new Error(`Failed to load posting (${res.status})`);
  return (await res.json()) as JobPosting;
}

export async function createPosting(input: JobPostingInput): Promise<JobPosting> {
  const res = await fetchAuthed(buildApiUrl("/careers/postings"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const msg = await safeDetail(res);
    throw new Error(msg || `Failed to create posting (${res.status})`);
  }
  const posting = (await res.json()) as JobPosting;
  revalidateCareers(posting.slug);
  return posting;
}

export async function updatePosting(
  id: string,
  input: Partial<JobPostingInput>,
): Promise<JobPosting> {
  const res = await fetchAuthed(buildApiUrl(`/careers/postings/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const msg = await safeDetail(res);
    throw new Error(msg || `Failed to update posting (${res.status})`);
  }
  const posting = (await res.json()) as JobPosting;
  revalidateCareers(posting.slug);
  return posting;
}

export async function deletePosting(id: string): Promise<void> {
  const res = await fetchAuthed(buildApiUrl(`/careers/postings/${id}`), {
    method: "DELETE",
  });
  if (!res.ok) {
    const msg = await safeDetail(res);
    throw new Error(msg || `Failed to delete posting (${res.status})`);
  }
  revalidateCareers();
}

export async function listApplications(
  postingId: string,
  status?: ApplicationStatus,
): Promise<JobApplication[]> {
  const qs = status ? `?status=${status}` : "";
  const res = await fetchAuthed(
    buildApiUrl(`/careers/admin/postings/${postingId}/applications${qs}`),
  );
  if (!res.ok) throw new Error(`Failed to load applications (${res.status})`);
  return (await res.json()) as JobApplication[];
}

export async function updateApplication(
  id: string,
  input: { status?: ApplicationStatus; admin_notes?: string | null },
): Promise<JobApplication> {
  const res = await fetchAuthed(buildApiUrl(`/careers/admin/applications/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const msg = await safeDetail(res);
    throw new Error(msg || `Failed to update application (${res.status})`);
  }
  return (await res.json()) as JobApplication;
}

export async function deleteApplication(id: string): Promise<void> {
  const res = await fetchAuthed(buildApiUrl(`/careers/admin/applications/${id}`), {
    method: "DELETE",
  });
  if (!res.ok) {
    const msg = await safeDetail(res);
    throw new Error(msg || `Failed to delete application (${res.status})`);
  }
}

/** Mint a short-lived presigned URL to view/download a candidate's resume. */
export async function getResumeUrl(
  id: string,
): Promise<{ url: string; filename: string }> {
  const res = await fetchAuthed(buildApiUrl(`/careers/admin/applications/${id}/resume`));
  if (!res.ok) {
    const msg = await safeDetail(res);
    throw new Error(msg || `Could not open resume (${res.status})`);
  }
  return (await res.json()) as { url: string; filename: string };
}

function revalidateCareers(slug?: string) {
  revalidatePath("/careers");
  if (slug) revalidatePath(`/careers/${slug}`);
  revalidatePath("/admin/applications");
}

async function safeDetail(res: Response): Promise<string | null> {
  try {
    const data = await res.json();
    return typeof data?.detail === "string" ? data.detail : null;
  } catch {
    return null;
  }
}
