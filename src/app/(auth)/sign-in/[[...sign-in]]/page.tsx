"use client";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <SignIn 
        routing="path" 
        path="/sign-in"
        afterSignInUrl="/dashboard/bursaries" 
        signUpUrl="/sign-up"
      />
    </div>
  );
} 