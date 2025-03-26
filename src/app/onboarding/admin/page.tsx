"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ShieldCheckIcon,
  UserIcon,
  PencilSquareIcon,
  BriefcaseIcon,
  PhoneIcon,
  EnvelopeIcon
} from "@heroicons/react/24/outline";

interface AdminFormData {
  fullName: string;
  position: string;
  contact: string;
  bio: string;
  [key: string]: string;
}

export default function AdminOnboardingPage() {
  const router = useRouter();

  // Define the ordered steps for admin onboarding
  const adminSteps = [
    { 
      name: "fullName", 
      label: "Full Name", 
      placeholder: "Enter your full name", 
      required: true,
      icon: <UserIcon className="h-6 w-6" />,
      description: "Your full name for identification purposes"
    },
    { 
      name: "position", 
      label: "Position", 
      placeholder: "Enter your position/role", 
      required: true,
      icon: <BriefcaseIcon className="h-6 w-6" />,
      description: "Your role in the organization or platform administration"
    },
    { 
      name: "contact", 
      label: "Contact Number", 
      placeholder: "Enter your contact number", 
      required: true,
      icon: <PhoneIcon className="h-6 w-6" />,
      description: "Your contact number for platform-related communication"
    },
    { 
      name: "bio", 
      label: "Bio", 
      placeholder: "Tell us about yourself and your administrative role", 
      required: false, 
      multiline: true,
      icon: <UserIcon className="h-6 w-6" />,
      description: "A brief introduction about yourself and your role in managing the platform"
    },
    { name: "review", label: "Review Your Information", icon: <PencilSquareIcon className="h-6 w-6" /> }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AdminFormData>({
    fullName: "",
    position: "",
    contact: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = async () => {
    // For review step or non-required fields, don't validate
    if (adminSteps[currentStep].name === "review" || !adminSteps[currentStep].required) {
      setError("");
      if (currentStep < adminSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final step: submit the form
        await handleSubmit();
      }
      return;
    }

    // Validate required fields
    const currentField = adminSteps[currentStep].name;
    const currentValue = formData[currentField];
    
    if (!currentValue || (typeof currentValue === 'string' && !currentValue.trim())) {
      setError(`Please enter ${adminSteps[currentStep].label}`);
      return;
    }

    setError("");
    if (currentStep < adminSteps.length - 1) {
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
    if (e) e.preventDefault();
    
    try {
      setLoading(true);
      setError("");
      
      console.log("Submitting admin data:", formData);
      
      const response = await fetch("/api/onboarding/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit admin profile");
      }
      
      console.log("Admin profile created:", data);
      
      // Save role to localStorage for sidebar customization
      localStorage.setItem("userRole", "admin");
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Error submitting admin profile:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderFieldContent = () => {
    const currentField = adminSteps[currentStep];
    
    if (currentField.name === "review") {
      return (
        <div className="space-y-6 p-4 bg-white dark:bg-[#5b3d2e]/50 rounded-lg shadow dark:border dark:border-[#d2ac8b]/30">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Review Your Information</h3>
          {adminSteps.slice(0, -1).map((step) => (
            <div key={step.name} className="grid grid-cols-3 gap-4 py-2 border-b border-gray-200 dark:border-[#5b3d2e]">
              <div className="font-medium text-gray-800 dark:text-gray-200">{step.label}</div>
              <div className="col-span-2 text-gray-900 dark:text-white">{formData[step.name]}</div>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
          <span className="text-purple-600 dark:text-[var(--light-brown-1)]">{currentField.icon}</span>
          <span>{currentField.description}</span>
        </div>
        
        {/* Input field */}
        {currentField.multiline ? (
          <textarea
            name={currentField.name}
            placeholder={currentField.placeholder}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-[var(--light-brown-1)] dark:bg-[#3d2a20] dark:text-white"
            rows={4}
            value={formData[currentField.name] as string}
            onChange={handleChange}
          />
        ) : (
          <input
            type="text"
            name={currentField.name}
            placeholder={currentField.placeholder}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-[var(--light-brown-1)] dark:bg-[#3d2a20] dark:text-white"
            value={formData[currentField.name] as string}
            onChange={handleChange}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#3d2a20] px-4 py-10">
      <div className="max-w-xl mx-auto">
        {/* Logo and header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white dark:bg-[#5b3d2e]/50 p-4 rounded-full shadow-md dark:border dark:border-[#d2ac8b]/30">
              <ShieldCheckIcon className="h-16 w-16 text-purple-600 dark:text-[var(--light-brown-1)]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Onboarding</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Create your admin profile to manage the bursary platform</p>
        </div>
        
        {/* Progress steps */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {adminSteps.map((step, index) => (
              <div 
                key={step.name} 
                className={`w-3 h-3 rounded-full ${
                  index === currentStep ? "bg-purple-600 dark:bg-[var(--light-brown-1)]" : 
                  index < currentStep ? "bg-green-500 dark:bg-green-400" : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Current step content */}
        <div className="bg-white dark:bg-[#5b3d2e]/50 rounded-lg shadow-lg p-6 mb-6 dark:border dark:border-[#d2ac8b]/30">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
            <span className="text-purple-600 dark:text-[var(--light-brown-1)]">{adminSteps[currentStep].icon}</span>
            <span className="ml-2">{adminSteps[currentStep].label}</span>
          </h2>
          
          {renderFieldContent()}
          
          {error && (
            <div className="mt-4 p-2 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-md ${
              currentStep === 0 
                ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed" 
                : "bg-gray-600 text-white hover:bg-gray-700 dark:bg-[#5b3d2e] dark:hover:bg-[#4a3226]"
            }`}
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 dark:bg-[#5b3d2e] text-white rounded-md hover:bg-purple-700 dark:hover:bg-[#4a3226] flex items-center"
          >
            {loading ? "Processing..." : currentStep === adminSteps.length - 1 ? "Submit" : "Next"}
            {loading && (
              <svg className="animate-spin ml-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 