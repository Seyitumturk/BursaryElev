"use client";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <SignUp 
        routing="hash" 
        afterSignUpUrl="/onboarding/select"
        signInUrl="/sign-in"
      />
    </div>
  );
} 