import { Link } from "lucide-react";
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top Section */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold">
            Join 500+ Businesses Automating Their Workflows
          </h2>
          <div className="flex flex-wrap justify-center gap-8 mt-6">
            {/* Add client logos here */}
          </div>
        </div>

        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-400 text-sm">
          {/* Navigation */}
          <div>
            <h3 className="text-white text-lg font-medium mb-3">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="hover:text-blue-400">About Us</a>
              </li>
              <li>
                <a href="/blog" className="hover:text-blue-400">Blog</a>
              </li>
              <li>
                <a href="/careers" className="hover:text-blue-400">Careers</a>
              </li>
              <li>
                <a href="/contact" className="hover:text-blue-400">Contact</a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-white text-lg font-medium mb-3">Follow Us</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-medium mb-3">Get in Touch</h3>
            <p>Email: support@thewings.ai</p>
            <p>Phone: +(250) 787-295-921</p>
            <p>Address: 123 AI Street, San Francisco, CA</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500 text-sm">
          <p>© 2025 TheWings AI. All rights reserved.</p>
          <p className="mt-2">
            <a href="/privacy" className="hover:text-blue-400">Privacy Policy</a> · 
            <a href="/terms" className="ml-3 hover:text-blue-400">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
