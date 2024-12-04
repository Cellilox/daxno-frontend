import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-5xl font-bold mt-32">DaxNo AI</h1>
      <Link href="/projects"className="bg-green-600 p-4 rounded mt-3">Get Started</Link>
    </div>
  );
}
