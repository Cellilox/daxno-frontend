import { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { getOnyxSyncHealth } from "@/actions/admin-actions";
import OnyxSyncDashboard from "@/components/admin/OnyxSyncDashboard";

export const metadata: Metadata = {
  title: "Cellilox | Onyx Sync Health",
  description:
    "Real-time view of Onyx sync failures, stuck records, and stuck projects.",
};


export default async function OnyxSyncHealthPage() {
  const user = await currentUser();
  if (
    user &&
    user.emailAddresses?.[0]?.emailAddress !== "ntirandth@gmail.com"
  ) {
    return (
      <div className="flex justify-center items-center h-screen font-sans text-gray-500">
        Unauthorized
      </div>
    );
  }

  // Server-side initial fetch so the page renders with data on first paint.
  // The dashboard component re-fetches every 30s on the client to stay live.
  const initial = await getOnyxSyncHealth();

  return <OnyxSyncDashboard initial={initial} />;
}
