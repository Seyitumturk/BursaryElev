"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    institution: "",
    major: "",
    graduationYear: "",
    interests: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    // Simple validation for Step 1
    if (currentStep === 1) {
      const { institution, major, graduationYear } = formData;
      if (!institution.trim() || !major.trim() || !graduationYear.trim()) {
        setError("Please fill in all required fields in Basic Information.");
        return;
      }
    }
    setError("");
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setError("");
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
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
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Basic Information
            </h2>
            <div>
              <label
                htmlFor="institution"
                className="block text-gray-700 dark:text-gray-300"
              >
                Institution <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="institution"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                placeholder="Enter your institution"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="major"
                className="block text-gray-700 dark:text-gray-300"
              >
                Major <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="major"
                name="major"
                value={formData.major}
                onChange={handleChange}
                placeholder="Enter your major"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="graduationYear"
                className="block text-gray-700 dark:text-gray-300"
              >
                Graduation Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="graduationYear"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                placeholder="Enter your graduation year"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Additional Information
            </h2>
            <div>
              <label
                htmlFor="interests"
                className="block text-gray-700 dark:text-gray-300"
              >
                Interests
              </label>
              <input
                type="text"
                id="interests"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                placeholder="Enter your interests"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="bio"
                className="block text-gray-700 dark:text-gray-300"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
              ></textarea>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Review Your Information
            </h2>
            <div className="p-4 border rounded-md">
              <p>
                <strong>Institution:</strong> {formData.institution}
              </p>
              <p>
                <strong>Major:</strong> {formData.major}
              </p>
              <p>
                <strong>Graduation Year:</strong> {formData.graduationYear}
              </p>
              <p>
                <strong>Interests:</strong> {formData.interests}
              </p>
              <p>
                <strong>Bio:</strong> {formData.bio}
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStep()}
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-between">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="btn-secondary"
              >
                Back
              </button>
            )}
            {currentStep < 3 && (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary ml-auto"
              >
                Next
              </button>
            )}
            {currentStep === 3 && (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary ml-auto"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 