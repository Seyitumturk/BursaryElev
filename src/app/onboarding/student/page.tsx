"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface StudentFormData {
  institution: string;
  major: string;
  graduationYear: string;
  interests: string;
  bio: string;
  [key: string]: string; // Index signature for dynamic access
}

export default function StudentOnboardingPage() {
  const router = useRouter();

  // Define the ordered steps for student onboarding
  const studentSteps = [
    { name: "institution", label: "Institution", placeholder: "Enter your institution", required: true },
    { name: "major", label: "Major", placeholder: "Enter your major", required: true },
    { name: "graduationYear", label: "Graduation Year", placeholder: "Enter your graduation year", required: true },
    { name: "interests", label: "Interests", placeholder: "Enter your interests", required: false },
    { name: "bio", label: "Bio", placeholder: "Tell us about yourself", required: false, multiline: true },
    { name: "review", label: "Review Your Information" } // Review step
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<StudentFormData>({
    institution: "",
    major: "",
    graduationYear: "",
    interests: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = async () => {
    // For review step, dont validate
    if (studentSteps[currentStep].name !== "review") {
      if (studentSteps[currentStep].required && !formData[studentSteps[currentStep].name].trim()) {
        setError(`Please enter ${studentSteps[currentStep].label}`);
        return;
      }
    }
    setError("");
    if (currentStep < studentSteps.length - 1) {
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }
      router.push("/dashboard/bursaries");
    } catch (error: Error | unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress; for review step we count it as a step
  const progress = ((currentStep + 1) / studentSteps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#e8dccc] rounded-xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">
          Student Onboarding
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
            Step {currentStep + 1} of {studentSteps.length}
          </p>
        </div>
        {studentSteps[currentStep].name === "review" ? (
          <div className="mb-4 text-black">
            <h2 className="text-xl font-medium mb-4">Review Your Information</h2>
            <div className="space-y-2">
              <p>
                <strong>Institution:</strong> {formData.institution || "N/A"}
              </p>
              <p>
                <strong>Major:</strong> {formData.major || "N/A"}
              </p>
              <p>
                <strong>Graduation Year:</strong> {formData.graduationYear || "N/A"}
              </p>
              <p>
                <strong>Interests:</strong> {formData.interests || "N/A"}
              </p>
              <p>
                <strong>Bio:</strong> {formData.bio || "N/A"}
              </p>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        ) : (
          <div className="mb-4">
            <label
              htmlFor={studentSteps[currentStep].name}
              className="block text-black font-medium mb-2"
            >
              {studentSteps[currentStep].label}{" "}
              {studentSteps[currentStep].required && <span className="text-red-500">*</span>}
            </label>
            {studentSteps[currentStep].multiline ? (
              <textarea
                id={studentSteps[currentStep].name}
                name={studentSteps[currentStep].name}
                value={formData[studentSteps[currentStep].name]}
                onChange={handleChange}
                placeholder={studentSteps[currentStep].placeholder}
                className="w-full px-4 py-2 text-black placeholder-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
              ></textarea>
            ) : (
              <input
                type="text"
                id={studentSteps[currentStep].name}
                name={studentSteps[currentStep].name}
                value={formData[studentSteps[currentStep].name]}
                onChange={handleChange}
                placeholder={studentSteps[currentStep].placeholder}
                className="w-full px-4 py-2 text-black placeholder-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        )}
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
            {currentStep === studentSteps.length - 1
              ? loading
                ? "Submitting..."
                : "Submit"
              : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
} 