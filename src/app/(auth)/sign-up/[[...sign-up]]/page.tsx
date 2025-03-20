"use client";
import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#d1a989] via-[#e3cbb7] to-[#f5ede7] dark:from-[#5b3d2e] dark:via-[#876650] dark:to-[#a9866b] animated-gradient relative overflow-hidden px-4">
      {/* Glassmorphic floating orbs */}
      <div className="h-full w-full absolute inset-0 overflow-hidden">
        <div className="floating-orb floating-orb-1"></div>
        <div className="floating-orb floating-orb-2"></div>
        <div className="floating-orb floating-orb-3"></div>
        <div className="floating-orb floating-orb-4"></div>
        <div className="floating-orb floating-orb-5"></div>
      </div>
      
      {/* Logo on top left */}
      <div className="absolute top-8 left-8 z-20">
        <Image 
          src="/logo.png" 
          alt="Ulnooweg EleV Logo" 
          width={60} 
          height={60}
          className="drop-shadow-lg"
        />
      </div>
      
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Eagle GIF above form - ensuring it's perfectly centered */}
        <div className="flex justify-center items-center mb-6 w-full">
          <div className="relative flex justify-center items-center">
            <Image 
              src="/eagle.gif" 
              alt="Eagle Animation" 
              width={180} 
              height={180}
              className="drop-shadow-lg"
              priority
            />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-[#ffffff] dark:text-[#f5ede7] text-center mb-1">
          Ulnooweg EleV
        </h2>
        <p className="text-sm text-[#f5ede7] dark:text-[#f5ede7] text-center max-w-xs mb-6">
          Join our community and connect with bursary opportunities
        </p>
        
        {/* Form container */}
        <div className="w-full">
          <SignUp 
            routing="path" 
            path="/sign-up"
            afterSignUpUrl="/onboarding/select"
            signInUrl="/sign-in"
            appearance={{
              variables: {
                colorBackground: "#a9866b",
                colorInputBackground: "#ffffff",
                colorNeutral: "#d1a989",
                colorPrimary: "#5b3d2e",
                colorTextOnPrimaryBackground: "#ffffff",
                colorText: "#ffffff",
                colorTextSecondary: "#f5ede7"
              },
              elements: {
                formButtonPrimary: "bg-[#5b3d2e] hover:bg-[#876650]",
                card: "shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-white border-[#5b3d2e] text-[#5b3d2e]",
                socialButtonsBlockButtonText: "text-[#5b3d2e] font-medium",
                formFieldLabel: "text-[#ffffff]",
                formFieldInput: "border-[#d1a989] focus:border-[#5b3d2e] text-[#5b3d2e] bg-white",
                footer: "text-[#f5ede7]",
                footerActionLink: "text-[#ffffff] font-medium",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}