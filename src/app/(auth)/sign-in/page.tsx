"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard/bursaries");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <SignIn 
        routing="path" 
        path="/sign-in" 
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard/bursaries"
      />
    </div>
  );
} 