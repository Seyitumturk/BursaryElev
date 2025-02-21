"use client";

import { useState, useEffect } from "react";
import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
// Import sun and moon icons from heroicons
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

export default function Header() {
  const { user } = useUser();
  // Explicitly type the role as string | null
  const role = user?.publicMetadata?.role as string | null;

  // Theme state and toggle logic
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Check localStorage first
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    } else {
      // If no stored preference, check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="bg-[#e8dccc] dark:bg-gray-900 shadow-lg backdrop-blur-md px-4 py-2 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white font-sans">
        {user ? (user.firstName || user.fullName) : ""}{" "}
        {role && <span className="text-sm font-normal text-gray-500">({role})</span>}
      </h1>
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:shadow-md transition"
          aria-label="Toggle Theme"
        >
          {theme === "light" ? (
            <MoonIcon className="h-6 w-6 text-gray-800" />
          ) : (
            <SunIcon className="h-6 w-6 text-yellow-500" />
          )}
        </button>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in" className="text-blue-600">
            Sign In
          </Link>
          <Link href="/sign-up" className="text-blue-600">
            Register
          </Link>
        </SignedOut>
      </div>
    </header>
  );
} 