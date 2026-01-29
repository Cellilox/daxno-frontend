import { Metadata } from "next";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { getDocs } from "@/actions/documents-action";

export const metadata: Metadata = {
  title: 'Cellilox | Admin',
  description: 'Administrative dashboard for managing users, projects, and platform settings in Daxno.'
};

export default async function Admin() {
  const user = await currentUser();

  // If we have a user, check their email. 
  // If no user (guest), we fall through to the SmartAuthGuard which will handle redirection on the client.
  if (user && user.emailAddresses?.[0]?.emailAddress !== "ntirandth@gmail.com") {
    return <div className="flex justify-center items-center h-screen font-sans text-gray-500">Unauthorized</div>;
  }

  // Only fetch users if we are tentatively authorized
  let userData: any[] = [];
  try {
    if (user) {
      const usersResponse = await (await clerkClient()).users.getUserList();
      userData = usersResponse.data;
    }
  } catch (error) {
    console.error("[Admin] Failed to fetch users:", error);
  }

  const getPages = async (userId: string) => {
    try {
      const docs = await getDocs(userId);
      return docs.reduce((acc: number, doc: any) => acc + (doc.page_number || 0), 0);
    } catch {
      return 0;
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">User Management</h1>
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-left">
              <th className="p-4 font-semibold text-gray-600">User</th>
              <th className="p-4 font-semibold text-gray-600">Username</th>
              <th className="p-4 font-semibold text-gray-600">Email</th>
              <th className="p-4 font-semibold text-gray-600">Last Sign-In</th>
              <th className="p-4 font-semibold text-gray-600">Activity</th>
              <th className="p-4 font-semibold text-gray-600">Plan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {userData.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{u.firstName} {u.lastName}</div>
                  <div className="text-xs text-gray-400 font-mono">{u.id}</div>
                </td>
                <td className="p-4 text-gray-600">{u.username || '-'}</td>
                <td className="p-4 text-gray-600">{u.emailAddresses?.[0]?.emailAddress || '-'}</td>
                <td className="p-4 text-sm text-gray-500">
                  {u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleDateString() : '-'}
                </td>
                <td className="p-4">
                  <div className="text-sm font-semibold text-blue-600">{getPages(u.id)} pages</div>
                </td>
                <td className="p-4 text-gray-600">Professional</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}