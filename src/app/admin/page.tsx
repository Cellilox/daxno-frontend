import { Metadata } from "next";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { getDocs } from "@/actions/documents-action";

export const metadata = {
  title: 'Cellilox | Admin',
  description: 'Administrative dashboard for managing users, projects, and platform settings in Daxno.'
};

export default async function Admin() {
  const users = await (await clerkClient()).users.getUserList();
  const getPages = async(user: string) => {
    const docs = await getDocs(user)
    const pages = docs.reduce((acc: number, doc: any) => acc + doc.page_number, 0);
    return pages
  }
  const user = await currentUser()
  if(user?.emailAddresses[0].emailAddress !== "ntirandth@gmail.com") {
    return <div className="flex justify-center items-center h-screen">Unauthorized</div>
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Users Table */}
      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600, fontSize: '1rem' }}>First Name</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600, fontSize: '1rem' }}>Last Name</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600, fontSize: '1rem' }}>Username</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600, fontSize: '1rem' }}>Primary Email</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600, fontSize: '1rem' }}>Last Sign-In</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600, fontSize: '1rem' }}>Processed Pages</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600, fontSize: '1rem' }}>Payment Plan</th>
            </tr>
          </thead>
          <tbody>
            {users?.data?.map((user: any) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.75rem 1rem' }}>{user.firstName || '-'}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{user.lastName || '-'}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{user.username || '-'}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{user?.emailAddresses[0].emailAddress || '-'}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : '-'}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{getPages(user.id)}</td>
                <td style={{ padding: '0.75rem 1rem' }}>Pro</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}