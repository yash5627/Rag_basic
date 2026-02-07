"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full h-16 bg-gray-900 text-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8  h-full flex items-center justify-between">

        {/* Left Side */}
        <div className="flex text-white items-center space-x-2">
          <span className="text-xl">🎥</span>
          <span className="text-lg font-semibold">
            Sigma Course AI
          </span>
        </div>

        {/* Right Side */}
        <div className="hidden md:flex text-slate-200 items-center space-x-8  font-bold">
          <Link
            href="/"
            className=" hover:text-blue-600 transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            href="/search"
            className=" hover:text-blue-600 transition-colors duration-200"
          >
            Search
          </Link>

          <Link
            href="/Login"
            className=" hover:text-blue-600 transition-colors duration-200"
          >
            Login
          </Link>

          <Link
            href="/about"
            className=" hover:text-blue-600 transition-colors duration-200"
          >
            About
          </Link>

          <a
            href="https://github.com/your-repo"
            target="_blank"
            rel="noreferrer"
            className=" hover:text-blue-600 transition-colors duration-200"
          >
            GitHub
          </a>
        </div>

      </div>
    </nav>
  );
}
