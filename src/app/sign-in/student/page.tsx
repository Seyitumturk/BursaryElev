import { SignIn } from "@clerk/nextjs";

export default function StudentSignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <SignIn path="/sign-in/student" routing="path" signUpUrl="/sign-up/student" />
      </div>
    </div>
  );
} 