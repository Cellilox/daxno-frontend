import AcceptInvitation from "./AcceptInvitation";

export default async function AcceptInvite({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  
  const {token} = await searchParams
  const {project_id} = await searchParams;

  return (
    <div className="mx-auto p-6 md:p-12 h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800">Accept this invite</h1>
      <p className="mb-3">You have been invited to collaborate on this project ({project_id})</p>
      <AcceptInvitation token={token} projectId={project_id}/>
    </div>
  );
}