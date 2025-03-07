"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function SubmitBursaryPage() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const [formData, setFormData] = useState({
    organization: "",
    contactEmail: "",
    title: "",
    description: "",
    applicationUrl: "",
    deadline: "",
    eligibilityCriteria: "",
    awardAmount: "",
    fieldOfStudy: [] as string[],
    academicLevel: [] as string[],
    financialNeedLevel: "medium",
    requiredDocuments: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if user is authenticated - this is just a fallback, the middleware should already handle this
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [isLoaded, userId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const values = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    
    setFormData(prev => ({ ...prev, [name]: values }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Convert string to number for award amount
      const numericAmount = parseFloat(formData.awardAmount);
      
      if (isNaN(numericAmount)) {
        throw new Error("Award amount must be a valid number");
      }
      
      // Prepare data for submission
      const bursaryData = {
        ...formData,
        awardAmount: numericAmount,
        deadline: new Date(formData.deadline).toISOString(),
      };
      
      console.log("Submitting data:", bursaryData);
      
      // Submit to API
      const response = await fetch("/api/bursaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bursaryData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit bursary");
      }
      
      const createdBursary = await response.json();
      setSuccess("Bursary opportunity submitted successfully!");
      
      // Reset form after successful submission
      setFormData({
        organization: "",
        contactEmail: "",
        title: "",
        description: "",
        applicationUrl: "",
        deadline: "",
        eligibilityCriteria: "",
        awardAmount: "",
        fieldOfStudy: [],
        academicLevel: [],
        financialNeedLevel: "medium",
        requiredDocuments: [],
      });
      
      // Redirect to bursaries page after a short delay
      setTimeout(() => {
        router.push("/dashboard/bursaries");
      }, 2000);
    } catch (error) {
      console.error("Error submitting bursary:", error);
      setError(error instanceof Error ? error.message : "Failed to submit bursary opportunity");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sample field of study options
  const FIELD_OF_STUDY_OPTIONS = [
    "Engineering",
    "Computer Science",
    "Business",
    "Medicine",
    "Law",
    "Arts",
    "Humanities",
    "Social Sciences",
    "Natural Sciences",
    "Education",
    "Mathematics",
    "Other",
  ];

  // Sample academic level options
  const ACADEMIC_LEVEL_OPTIONS = [
    "undergraduate",
    "graduate",
    "phd",
    "postdoctoral",
  ];

  // If loading auth status, show loading
  if (!isLoaded) {
    return (
      <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Submit a Bursary Opportunity
        </h1>
        
        {/* Success message */}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="organization"
                className="block text-gray-700 dark:text-gray-300"
              >
                Organization Name
              </label>
              <input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="Your organization's name"
                className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="contactEmail"
                className="block text-gray-700 dark:text-gray-300"
              >
                Contact Email
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="you@example.com"
                className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label
              htmlFor="title"
              className="block text-gray-700 dark:text-gray-300"
            >
              Bursary Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title of the bursary opportunity"
              className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label
              htmlFor="description"
              className="block text-gray-700 dark:text-gray-300"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the opportunity"
              rows={4}
              className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="applicationUrl"
                className="block text-gray-700 dark:text-gray-300"
              >
                Application URL
              </label>
              <input
                type="url"
                id="applicationUrl"
                name="applicationUrl"
                value={formData.applicationUrl}
                onChange={handleChange}
                placeholder="https://"
                className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="deadline"
                className="block text-gray-700 dark:text-gray-300"
              >
                Deadline
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label
              htmlFor="eligibilityCriteria"
              className="block text-gray-700 dark:text-gray-300"
            >
              Eligibility Criteria
            </label>
            <textarea
              id="eligibilityCriteria"
              name="eligibilityCriteria"
              value={formData.eligibilityCriteria}
              onChange={handleChange}
              placeholder="Who is eligible for this bursary?"
              rows={3}
              className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="awardAmount"
                className="block text-gray-700 dark:text-gray-300"
              >
                Award Amount ($)
              </label>
              <input
                type="number"
                id="awardAmount"
                name="awardAmount"
                value={formData.awardAmount}
                onChange={handleChange}
                placeholder="Amount in dollars"
                min="0"
                step="0.01"
                className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="financialNeedLevel"
                className="block text-gray-700 dark:text-gray-300"
              >
                Financial Need Level
              </label>
              <select
                id="financialNeedLevel"
                name="financialNeedLevel"
                value={formData.financialNeedLevel}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="fieldOfStudy"
                className="block text-gray-700 dark:text-gray-300"
              >
                Fields of Study (Ctrl+Click for multiple)
              </label>
              <select
                id="fieldOfStudy"
                name="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={handleMultiSelectChange}
                className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                multiple
                size={4}
                required
              >
                {FIELD_OF_STUDY_OPTIONS.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="academicLevel"
                className="block text-gray-700 dark:text-gray-300"
              >
                Academic Level (Ctrl+Click for multiple)
              </label>
              <select
                id="academicLevel"
                name="academicLevel"
                value={formData.academicLevel}
                onChange={handleMultiSelectChange}
                className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                multiple
                size={4}
                required
              >
                {ACADEMIC_LEVEL_OPTIONS.map(level => (
                  <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label
              htmlFor="requiredDocuments"
              className="block text-gray-700 dark:text-gray-300"
            >
              Required Documents (comma-separated)
            </label>
            <input
              type="text"
              id="requiredDocuments"
              name="requiredDocuments"
              value={formData.requiredDocuments.join(", ")}
              onChange={(e) => setFormData(prev => ({ ...prev, requiredDocuments: e.target.value.split(",").map(item => item.trim()).filter(Boolean) }))}
              placeholder="Transcript, CV, Cover Letter, etc."
              className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-4 px-4 py-2 ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md transition`}
          >
            {isSubmitting ? "Submitting..." : "Submit Opportunity"}
          </button>
        </form>
      </div>
    </div>
  );
} 