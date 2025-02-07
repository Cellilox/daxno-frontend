import { Link } from 'lucide-react'
import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12 mt-20">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <p className="text-xl font-medium mb-8">Join 500+ Businesses Automating Their Workflows</p>
      <div className="flex flex-wrap justify-center gap-8 mb-8">
        {/* Add client logos here */}
      </div>
      <p className="text-gray-400 text-sm">
        © 2025 TheWings AI. All rights reserved. 
        <Link href="/privacy" className="ml-4 hover:text-blue-400">Privacy Policy</Link>
      </p>
    </div>
  </footer>
  )
}
