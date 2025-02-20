"use client";

import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
  const { user } = useUser();
  return (
    <header
      className="
        flex items-center justify-between 
        px-4 py-2 
        bg-white/30 dark:bg-gray-900/30 
        backdrop-blur-md 
        /* Removed box-shadow for header */
      "
    >
      <h1 className="text-xl font-bold text-gray-800 dark:text-white font-sans">
        {user ? (user.firstName || user.fullName) : ""}
      </h1>
      <div className="flex items-center gap-4">
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in" className="text-blue-600">
            Sign In
          </Link>
        </SignedOut>
      </div>
    </header>
  );
} 