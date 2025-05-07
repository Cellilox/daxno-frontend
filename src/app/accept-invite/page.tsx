import { currentUser } from "@clerk/nextjs/server";
import AcceptInvitation from "./AcceptInvitation";

export default async function AcceptInvite({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await currentUser();
  const currentUserPrimaryEmail = user?.primaryEmailAddress?.emailAddress;
  
  // Get query parameters
  const {token} = await searchParams
  const {project_id} = await searchParams;
  console.log(token, project_id)

  return (
    <div className="mx-auto p-6 md:p-12 h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800">Accept this invite</h1>
      <p className="mb-3">You have been invited to collaborate on this project ({project_id})</p>
      <AcceptInvitation token={token} projectId={project_id}/>
    </div>
  );
}