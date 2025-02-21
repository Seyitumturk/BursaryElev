"use client";
import React from "react";
import Link from "next/link";
import { AcademicCapIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";

export default function OnboardingSelect() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-light-secondary p-4">
      <h1 className="text-3xl font-bold mb-8 text-black">Complete Your Onboarding</h1>
      <div className="flex flex-col sm:flex-row gap-8">
        <Link
          href="/onboarding/student"
          className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center hover:shadow-2xl transition"
        >
          <AcademicCapIcon className="h-16 w-16 text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold text-black">I'm a Student</h2>
        </Link>
        <Link
          href="/onboarding/org"
          className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center hover:shadow-2xl transition"
        >
          <BuildingOffice2Icon className="h-16 w-16 text-green-600 mb-4" />
          <h2 className="text-xl font-semibold text-black">I'm a Funder</h2>
        </Link>
      </div>
    </div>
  );
} 