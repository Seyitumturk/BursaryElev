"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  AcademicCapIcon, 
  BookOpenIcon, 
  CalendarIcon, 
  UserIcon, 
  PencilSquareIcon, 
  GlobeAltIcon, 
  BriefcaseIcon, 
  LanguageIcon, 
  HeartIcon,
  LightBulbIcon, 
  CheckCircleIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";

interface StudentFormData {
  institution: string;
  major: string;
  graduationYear: string;
  interests: string[];
  skills: string[];
  languages: string[];
  achievements: string[];
  financialBackground: string;
  careerGoals: string;
  locationPreferences: string[];
  bio: string;
  [key: string]: string | string[]; // Updated to handle arrays
}

export default function StudentOnboardingPage() {
  const router = useRouter();

  // Define the ordered steps for student onboarding
  const studentSteps = [
    { 
      name: "institution", 
      label: "Institution", 
      placeholder: "Enter your institution", 
      required: true,
      icon: <AcademicCapIcon className="h-6 w-6" />,
      description: "The university or college you are currently attending"
    },
    { 
      name: "major", 
      label: "Major", 
      placeholder: "Enter your major", 
      required: true,
      icon: <BookOpenIcon className="h-6 w-6" />,
      description: "Your field of study"
    },
    { 
      name: "graduationYear", 
      label: "Graduation Year", 
      placeholder: "Enter your graduation year", 
      required: true,
      icon: <CalendarIcon className="h-6 w-6" />,
      description: "Expected year of graduation"
    },
    { 
      name: "interests", 
      label: "Areas of Interest", 
      placeholder: "Select your areas of interest", 
      required: false,
      isMultiSelect: true,
      icon: <HeartIcon className="h-6 w-6" />,
      description: "Topics you're passionate about (helps match you with relevant opportunities)",
      options: [
        "Technology", "Healthcare", "Education", "Environment", 
        "Arts", "Social Justice", "Business", "Science", "Engineering",
        "Humanities", "Sports", "Community Service"
      ]
    },
    { 
      name: "skills", 
      label: "Skills", 
      placeholder: "Select your skills", 
      required: false,
      isMultiSelect: true,
      icon: <LightBulbIcon className="h-6 w-6" />,
      description: "Your strongest abilities (helps funders find candidates with specific talents)",
      options: [
        "Programming", "Research", "Writing", "Public Speaking", 
        "Leadership", "Critical Thinking", "Problem Solving", 
        "Data Analysis", "Design", "Communication", "Project Management"
      ]
    },
    { 
      name: "languages", 
      label: "Languages", 
      placeholder: "Select languages you speak", 
      required: false,
      isMultiSelect: true,
      icon: <LanguageIcon className="h-6 w-6" />,
      description: "Languages you speak (some bursaries target multilingual students)",
      options: [
        "English", "French", "Spanish", "Mandarin", "Arabic", 
        "Hindi", "Portuguese", "Russian", "Japanese", "German",
        "Zulu", "Xhosa", "Afrikaans", "Swahili", "Other"
      ]
    },
    { 
      name: "achievements", 
      label: "Achievements", 
      placeholder: "Select your achievements", 
      required: false,
      isMultiSelect: true,
      icon: <CheckCircleIcon className="h-6 w-6" />,
      description: "Academic or extracurricular accomplishments (helps highlight your strengths)",
      options: [
        "Dean's List", "Honor Society", "Published Research", 
        "Competition Winner", "Student Leadership", "Community Service Award", 
        "Scholarship Recipient", "Athletic Achievement", "Academic Excellence", 
        "Innovation Award", "Volunteering Recognition"
      ]
    },
    {
      name: "financialBackground",
      label: "Financial Need Level",
      placeholder: "Select your financial need level",
      required: false,
      icon: <CurrencyDollarIcon className="h-6 w-6" />,
      isIconSelect: true,
      description: "Many bursaries are need-based (helps match you with relevant funding)",
      options: [
        { value: "low", label: "Low", description: "Some financial assistance needed" },
        { value: "medium", label: "Medium", description: "Moderate financial assistance needed" },
        { value: "high", label: "High", description: "Significant financial assistance needed" }
      ]
    },
    { 
      name: "careerGoals", 
      label: "Career Goals", 
      placeholder: "Briefly describe your career goals", 
      required: false,
      multiline: true,
      icon: <BriefcaseIcon className="h-6 w-6" />,
      description: "Your professional aspirations (helps match with career-specific funding)"
    },
    { 
      name: "locationPreferences", 
      label: "Location Preferences", 
      placeholder: "Select preferred locations", 
      required: false,
      isMultiSelect: true,
      icon: <GlobeAltIcon className="h-6 w-6" />,
      description: "Areas where you're interested in studying or working (some bursaries are region-specific)",
      options: [
        "Urban", "Rural", "International", "Local", "Specific Province/State",
        "Capital Cities", "Remote Work", "No Preference"
      ]
    },
    { 
      name: "bio", 
      label: "Bio", 
      placeholder: "Tell us about yourself", 
      required: false, 
      multiline: true,
      icon: <UserIcon className="h-6 w-6" />,
      description: "A brief introduction that highlights your unique qualities"
    },
    { name: "review", label: "Review Your Information", icon: <PencilSquareIcon className="h-6 w-6" /> }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<StudentFormData>({
    institution: "",
    major: "",
    graduationYear: "",
    interests: [],
    skills: [],
    languages: [],
    achievements: [],
    financialBackground: "",
    careerGoals: "",
    locationPreferences: [],
    bio: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectToggle = (field: string, value: string) => {
    setFormData((prev) => {
      const currentValues = prev[field] as string[];
      if (currentValues.includes(value)) {
        return { ...prev, [field]: currentValues.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...currentValues, value] };
      }
    });
  };

  const handleIconSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    // For review step or non-required fields, don't validate
    if (studentSteps[currentStep].name === "review" || !studentSteps[currentStep].required) {
      setError("");
      if (currentStep < studentSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final step: submit the form
        await handleSubmit();
      }
      return;
    }

    // Validate required fields
    const currentField = studentSteps[currentStep].name;
    const currentValue = formData[currentField];
    
    if (Array.isArray(currentValue)) {
      if (studentSteps[currentStep].required && currentValue.length === 0) {
        setError(`Please select at least one ${studentSteps[currentStep].label}`);
        return;
      }
    } else {
      if (studentSteps[currentStep].required && (!currentValue || (typeof currentValue === 'string' && !currentValue.trim()))) {
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
      // Log form data before submitting
      console.log("Submitting form data:", JSON.stringify(formData, null, 2));
      
      // Make sure all array fields are properly handled
      const submissionData = {
        ...formData,
        // Ensure these are arrays
        interests: Array.isArray(formData.interests) ? formData.interests : [],
        skills: Array.isArray(formData.skills) ? formData.skills : [],
        languages: Array.isArray(formData.languages) ? formData.languages : [],
        achievements: Array.isArray(formData.achievements) ? formData.achievements : [],
        locationPreferences: Array.isArray(formData.locationPreferences) ? formData.locationPreferences : [],
        // Make sure numerical fields are properly formatted
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : null,
      };
      
      console.log("Sanitized form data:", JSON.stringify(submissionData, null, 2));
      
      const res = await fetch("/api/onboarding/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
      
      // Get the response data regardless of status
      const responseData = await res.json();
      console.log("Server response:", JSON.stringify(responseData, null, 2));
      
      if (!res.ok) {
        // If response not OK, throw an error with the error message from the server
        throw new Error(responseData.error || "Failed to submit profile information");
      }
      
      // If successful, redirect to dashboard
      router.push("/dashboard/bursaries");
    } catch (error: Error | unknown) {
      console.error("Onboarding error:", error);
      setError(error instanceof Error ? error.message : "An error occurred while processing your request");
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress; for review step we count it as a step
  const progress = ((currentStep + 1) / studentSteps.length) * 100;

  const renderFieldContent = () => {
    const currentField = studentSteps[currentStep];
    
    if (currentField.name === "review") {
      return (
        <div className="mb-4 text-black dark:text-white">
          <h2 className="text-xl font-medium mb-4">Review Your Information</h2>
          <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            {studentSteps.slice(0, -1).map((step, index) => {
              const value = formData[step.name];
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1 text-indigo-600 dark:text-indigo-400">{step.icon}</div>
                  <div>
                    <h3 className="font-medium">{step.label}</h3>
                    {Array.isArray(value) ? (
                      value.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {value.map((item, i) => (
                            <span key={i} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-xs">
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : <p className="text-gray-500 dark:text-gray-400 italic">Not provided</p>
                    ) : (
                      value ? <p className="dark:text-gray-300">{value}</p> : <p className="text-gray-500 dark:text-gray-400 italic">Not provided</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>}
        </div>
      );
    }

    if (currentField.isMultiSelect) {
      return (
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-indigo-600 dark:text-indigo-400">{currentField.icon}</span>
            <label htmlFor={currentField.name} className="block text-black dark:text-white font-medium">
              {currentField.label}{" "}
              {currentField.required && <span className="text-red-500 dark:text-red-400">*</span>}
            </label>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{currentField.description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {currentField.options?.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleMultiSelectToggle(currentField.name, option)}
                className={`px-3 py-2 rounded-lg border text-sm text-left transition-all ${
                  (formData[currentField.name] as string[]).includes(option)
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 dark:border-indigo-400"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300 hover:border-indigo-200 dark:hover:border-indigo-700"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>}
        </div>
      );
    }

    if (currentField.isIconSelect) {
      return (
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-indigo-600 dark:text-indigo-400">{currentField.icon}</span>
            <label htmlFor={currentField.name} className="block text-black dark:text-white font-medium">
              {currentField.label}{" "}
              {currentField.required && <span className="text-red-500 dark:text-red-400">*</span>}
            </label>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{currentField.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentField.options?.map((option: any, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleIconSelectChange(currentField.name, option.value)}
                className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                  formData[currentField.name] === option.value
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-200 dark:hover:border-indigo-700"
                }`}
              >
                <CurrencyDollarIcon className={`h-8 w-8 mb-2 ${
                  formData[currentField.name] === option.value ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"
                }`} />
                <span className="font-medium text-black dark:text-white">{option.label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">{option.description}</span>
              </button>
            ))}
          </div>
          {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>}
        </div>
      );
    }

    return (
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-indigo-600 dark:text-indigo-400">{currentField.icon}</span>
          <label
            htmlFor={currentField.name}
            className="block text-black dark:text-white font-medium"
          >
            {currentField.label}{" "}
            {currentField.required && <span className="text-red-500 dark:text-red-400">*</span>}
          </label>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{currentField.description}</p>
        {currentField.multiline ? (
          <textarea
            id={currentField.name}
            name={currentField.name}
            value={formData[currentField.name] as string}
            onChange={handleChange}
            placeholder={currentField.placeholder}
            className="w-full px-4 py-2 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            rows={4}
          ></textarea>
        ) : (
          <input
            type="text"
            id={currentField.name}
            name={currentField.name}
            value={formData[currentField.name] as string}
            onChange={handleChange}
            placeholder={currentField.placeholder}
            className="w-full px-4 py-2 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          />
        )}
        {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#5b3d2e] dark:bg-[#3d2a20]">
      {/* Logo */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <Image 
          src="/logo.png" 
          alt="Logo" 
          width={150} 
          height={150} 
          className="object-contain"
        />
      </div>

      <div className="bg-[#e8dccc] dark:bg-[#3d2a20] rounded-xl shadow-xl p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto mx-4">
        <h1 className="text-3xl font-bold mb-6 text-center text-black dark:text-white">
          Student Profile Setup
        </h1>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
            <div
              className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-black dark:text-gray-200">
              Step {currentStep + 1} of {studentSteps.length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentStep < studentSteps.length - 1 && !studentSteps[currentStep].required && 
                "Optional - Improves matching"}
            </p>
          </div>
        </div>

        {renderFieldContent()}

        <div className="flex justify-between mt-6">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-xl shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className={`px-6 py-2.5 ${currentStep === 0 ? "mx-auto" : "ml-auto"} bg-black dark:bg-indigo-600 text-white rounded-xl shadow hover:bg-gray-800 dark:hover:bg-indigo-700 transition`}
          >
            {currentStep === studentSteps.length - 1
              ? loading
                ? "Submitting..."
                : "Complete Setup"
              : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
} 