import Link from "next/link";

export default async function AcceptInvite({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  
  // Get query parameters
  const {message} = await searchParams

  return (
    <div className="mx-auto p-6 md:p-12 h-screen bg-gray-50 flex flex-col justify-center items-center">
      <p className="text-xl font-bold text-gray-800">{message}</p>
      <Link href="/dashboard" className="mt-3 underline">Go to dashboard</Link>
    </div>
  );
}