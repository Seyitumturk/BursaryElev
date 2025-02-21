"use client";
import React from "react";
import Link from "next/link";

export default function OnboardingSelect() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <h1 className="text-3xl font-bold mb-8">Complete Your Onboarding</h1>
      <div className="flex flex-col gap-4">
        <Link href="/onboarding/student" className="btn-primary px-4 py-2">
          I&apos;m a Student
        </Link>
        <Link href="/onboarding/org" className="btn-primary px-4 py-2">
          I&apos;m a Funder
        </Link>
      </div>
    </div>
  );
} 