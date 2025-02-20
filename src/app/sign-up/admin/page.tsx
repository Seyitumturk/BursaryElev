import { SignUp } from "@clerk/nextjs";

export default function AdminSignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mt-4">Admin Sign Up</h1>
        <SignUp path="/sign-up/admin" routing="path" signInUrl="/sign-in/admin" />
      </div>
    </div>
  );
} 