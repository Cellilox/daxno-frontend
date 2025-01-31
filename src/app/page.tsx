import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-extrabold text-gray-800 mb-6">
          Welcome to <span className="text-green-600">TheWings AI Agent</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Simplify your data entry with AI-powered automation. Create projects, define key insights, and let our AI handle the rest. 
          Extract data from images, manage your findings in spreadsheets, and seamlessly integrate with your favorite Google tools.
        </p>
        <Link 
          href="/projects"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded shadow-lg transition duration-300"
        >
          Get Started
        </Link>
      </div>
      <footer className="mt-12 text-gray-500 text-sm">
        Powered by TheWings AI | Transforming your workflow
      </footer>
    </div>
  );
}
