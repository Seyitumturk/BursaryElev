import { SignUp } from "@clerk/nextjs";

export default function StudentSignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <SignUp path="/sign-up/student" routing="path" signInUrl="/sign-in/student" />
      </div>
    </div>
  );
} 