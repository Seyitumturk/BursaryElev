"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface OrgFormData {
  title: string;
  category: string;
  about: string;
  mission: string;
  address: string;
  province: string;
  city: string;
  postalCode: string;
  officeNumber: string;
  alternativePhone: string;
  email: string;
  website: string;
  twitter: string;
  facebook: string;
  linkedin: string;
  [key: string]: string; // Index signature for dynamic access
}

export default function OrgOnboardingPage() {
  const router = useRouter();

  // Define the ordered steps for organization onboarding
  const orgSteps = [
    { name: "title", label: "Organization Name", placeholder: "Enter your organization name", required: true },
    { name: "category", label: "Category", placeholder: "Enter the category", required: true },
    { name: "about", label: "About", placeholder: "Tell us about your organization", required: true, multiline: true },
    { name: "mission", label: "Mission", placeholder: "Describe your mission", required: true, multiline: true },
    { name: "address", label: "Address", placeholder: "Enter your address", required: true },
    { name: "province", label: "Province", placeholder: "Enter your province", required: true },
    { name: "city", label: "City", placeholder: "Enter your city", required: true },
    { name: "postalCode", label: "Postal Code", placeholder: "Enter postal code", required: true },
    { name: "officeNumber", label: "Office Number", placeholder: "Enter office number", required: true },
    { name: "alternativePhone", label: "Alternative Phone", placeholder: "Enter alternative phone (optional)", required: false },
    { name: "email", label: "Contact Email", placeholder: "Enter contact email", required: true, type: "email" },
    { name: "website", label: "Website", placeholder: "Enter website URL (optional)", required: false, type: "url" },
    { name: "twitter", label: "Twitter", placeholder: "Twitter handle (optional)", required: false },
    { name: "facebook", label: "Facebook", placeholder: "Facebook page (optional)", required: false },
    { name: "linkedin", label: "LinkedIn", placeholder: "LinkedIn profile (optional)", required: false },
  ];

  // Initialize form state with all keys
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OrgFormData>({
    title: "",
    category: "",
    about: "",
    mission: "",
    address: "",
    province: "",
    city: "",
    postalCode: "",
    officeNumber: "",
    alternativePhone: "",
    email: "",
    website: "",
    twitter: "",
    facebook: "",
    linkedin: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = async () => {
    const step = orgSteps[currentStep];
    if (step.required && !formData[step.name].trim()) {
      setError(`Please enter ${step.label}`);
      return;
    }
    setError("");
    if (currentStep < orgSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step: submit the form
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError("");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "An error occurred");
      } else {
        router.push("/dashboard/profile");
      }
    } catch (error: Error | unknown) {
      setError("An error occurred");
      console.error(error);
    }
    setLoading(false);
  };

  // Calculate progress percentage
  const progress = ((currentStep + 1) / orgSteps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#e8dccc] rounded-xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">
          Organization Onboarding
        </h1>
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-2 w-full bg-gray-200 rounded-full">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-center mt-1 text-black">
            Step {currentStep + 1} of {orgSteps.length}
          </p>
        </div>
        <div className="mb-4">
          <label
            htmlFor={orgSteps[currentStep].name}
            className="block text-black font-medium mb-2"
          >
            {orgSteps[currentStep].label}{" "}
            {orgSteps[currentStep].required && <span className="text-red-500">*</span>}
          </label>
          {orgSteps[currentStep].multiline ? (
            <textarea
              id={orgSteps[currentStep].name}
              name={orgSteps[currentStep].name}
              value={formData[orgSteps[currentStep].name]}
              onChange={handleChange}
              placeholder={orgSteps[currentStep].placeholder}
              className="w-full px-4 py-2 text-black placeholder-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
            ></textarea>
          ) : (
            <input
              type={orgSteps[currentStep].type || "text"}
              id={orgSteps[currentStep].name}
              name={orgSteps[currentStep].name}
              value={formData[orgSteps[currentStep].name]}
              onChange={handleChange}
              placeholder={orgSteps[currentStep].placeholder}
              className="w-full px-4 py-2 text-black placeholder-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
        <div className="flex justify-between">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 bg-gray-200 text-black rounded-xl shadow hover:bg-gray-300 transition"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="ml-auto px-6 py-3 bg-black dark:bg-black text-white rounded-xl shadow hover:bg-gray-800 transition"
          >
            {currentStep === orgSteps.length - 1 ? (loading ? "Submitting..." : "Complete Onboarding") : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
} 