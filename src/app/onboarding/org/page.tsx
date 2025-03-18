"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  BuildingOffice2Icon, 
  TagIcon, 
  DocumentTextIcon, 
  FlagIcon, 
  MapPinIcon, 
  HomeIcon, 
  BuildingLibraryIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  GlobeAltIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CalendarIcon,
  PencilSquareIcon,
  PhotoIcon,
  ListBulletIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  HeartIcon
} from "@heroicons/react/24/outline";

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
  targetDemographics: string[];
  fundingAmount: string;
  applicationDeadlines: string;
  scholarshipTypes: string[];
  eligibilityCriteria: string[];
  fundingHistory: string;
  successStories: string;
  [key: string]: string | string[]; // Index signature for dynamic access
}

export default function OrgOnboardingPage() {
  const router = useRouter();

  // Define the ordered steps for organization onboarding
  const orgSteps = [
    { 
      name: "title", 
      label: "Organization Name", 
      placeholder: "Enter your organization name", 
      required: true,
      icon: <BuildingOffice2Icon className="h-6 w-6" />,
      description: "The official name of your organization"
    },
    { 
      name: "category", 
      label: "Category", 
      placeholder: "Select your organization type", 
      required: true,
      icon: <TagIcon className="h-6 w-6" />,
      isIconSelect: true,
      description: "The type of organization you represent",
      options: [
        { value: "educational", label: "Educational", description: "Universities, colleges, schools" },
        { value: "nonprofit", label: "Non-Profit", description: "Charitable organizations, NGOs" },
        { value: "corporate", label: "Corporate", description: "Businesses, companies" },
        { value: "government", label: "Government", description: "Public institutions, agencies" },
        { value: "foundation", label: "Foundation", description: "Private foundations, trusts" },
        { value: "other", label: "Other", description: "Other organization types" }
      ]
    },
    { 
      name: "about", 
      label: "About", 
      placeholder: "Tell us about your organization", 
      required: true, 
      multiline: true,
      icon: <DocumentTextIcon className="h-6 w-6" />,
      description: "A brief overview of your organization's purpose and activities"
    },
    { 
      name: "mission", 
      label: "Mission", 
      placeholder: "Describe your mission", 
      required: true, 
      multiline: true,
      icon: <FlagIcon className="h-6 w-6" />,
      description: "Your organization's mission statement and core values"
    },
    { 
      name: "targetDemographics", 
      label: "Target Demographics", 
      placeholder: "Select your target demographics", 
      required: false,
      icon: <UserGroupIcon className="h-6 w-6" />,
      isMultiSelect: true,
      description: "The groups of students your funding prioritizes (helps improve matching)",
      options: [
        "First-Generation Students", "Low-Income Students", "Minorities", 
        "Women in STEM", "International Students", "Indigenous Students", 
        "Students with Disabilities", "Mature Students", "Rural Students",
        "LGBTQ+ Students", "Returning Students", "Refugee Students"
      ]
    },
    { 
      name: "fundingAmount", 
      label: "Typical Funding Amount", 
      placeholder: "Your typical funding range", 
      required: false,
      icon: <CurrencyDollarIcon className="h-6 w-6" />,
      isIconSelect: true,
      description: "The typical amount your organization provides per student (helps with matching expectations)",
      options: [
        { value: "small", label: "< R5,000", description: "Smaller grants/partial support" },
        { value: "medium", label: "R5,000-R20,000", description: "Moderate financial support" },
        { value: "large", label: "R20,000-R50,000", description: "Major financial support" },
        { value: "comprehensive", label: "> R50,000", description: "Comprehensive funding" }
      ]
    },
    { 
      name: "applicationDeadlines", 
      label: "Application Deadlines", 
      placeholder: "Typical application deadlines", 
      required: false,
      icon: <CalendarIcon className="h-6 w-6" />,
      description: "Your typical application deadlines (e.g., 'March 31st, September 30th')"
    },
    { 
      name: "scholarshipTypes", 
      label: "Funding Types Offered", 
      placeholder: "Select the types of funding you offer", 
      required: false,
      icon: <ListBulletIcon className="h-6 w-6" />,
      isMultiSelect: true,
      description: "Types of financial support your organization provides (helps with accurate matching)",
      options: [
        "Merit-Based Scholarships", "Need-Based Bursaries", "Research Grants", 
        "Athletic Scholarships", "Community Service Awards", "International Study Support", 
        "Graduate Studies Funding", "Professional Development", "Emergency Financial Aid",
        "Full-Ride Scholarships", "Partial Tuition Support", "Book and Material Stipends"
      ]
    },
    { 
      name: "eligibilityCriteria", 
      label: "Eligibility Criteria", 
      placeholder: "Select typical eligibility requirements", 
      required: false,
      icon: <CheckCircleIcon className="h-6 w-6" />,
      isMultiSelect: true,
      description: "Common requirements for your funding (improves matching accuracy)",
      options: [
        "Academic Excellence", "Financial Need", "Specific Field of Study", 
        "Geographic Location", "Leadership Experience", "Community Involvement", 
        "Research Experience", "Entrepreneurship", "Artistic Achievement",
        "Athletic Achievement", "Volunteer Work", "Essay Quality"
      ]
    },
    { 
      name: "fundingHistory", 
      label: "Funding History", 
      placeholder: "Briefly describe your funding history", 
      required: false,
      multiline: true,
      icon: <AcademicCapIcon className="h-6 w-6" />,
      description: "Background on your organization's history of providing educational funding"
    },
    { 
      name: "successStories", 
      label: "Success Stories", 
      placeholder: "Share success stories (if any)", 
      required: false,
      multiline: true,
      icon: <BriefcaseIcon className="h-6 w-6" />,
      description: "Examples of students who have benefited from your funding (builds trust with applicants)"
    },
    { 
      name: "address", 
      label: "Address", 
      placeholder: "Enter your address", 
      required: true,
      icon: <MapPinIcon className="h-6 w-6" />,
      description: "Your organization's physical address"
    },
    { 
      name: "province", 
      label: "Province", 
      placeholder: "Enter your province", 
      required: true,
      icon: <HomeIcon className="h-6 w-6" />,
      description: "Province where your organization is located"
    },
    { 
      name: "city", 
      label: "City", 
      placeholder: "Enter your city", 
      required: true,
      icon: <BuildingLibraryIcon className="h-6 w-6" />,
      description: "City where your organization is located"
    },
    { 
      name: "postalCode", 
      label: "Postal Code", 
      placeholder: "Enter postal code", 
      required: true,
      icon: <MapPinIcon className="h-6 w-6" />,
      description: "Postal code for your organization's address"
    },
    { 
      name: "officeNumber", 
      label: "Office Number", 
      placeholder: "Enter office number", 
      required: true,
      icon: <PhoneIcon className="h-6 w-6" />,
      description: "Main contact phone number for your organization"
    },
    { 
      name: "alternativePhone", 
      label: "Alternative Phone", 
      placeholder: "Enter alternative phone (optional)", 
      required: false,
      icon: <PhoneIcon className="h-6 w-6" />,
      description: "Secondary contact phone number"
    },
    { 
      name: "email", 
      label: "Contact Email", 
      placeholder: "Enter contact email", 
      required: true, 
      type: "email",
      icon: <EnvelopeIcon className="h-6 w-6" />,
      description: "Email address for inquiries about your funding opportunities"
    },
    { 
      name: "website", 
      label: "Website", 
      placeholder: "Enter website URL (optional)", 
      required: false, 
      type: "url",
      icon: <GlobeAltIcon className="h-6 w-6" />,
      description: "Your organization's website URL"
    },
    { 
      name: "twitter", 
      label: "Twitter", 
      placeholder: "Twitter handle (optional)", 
      required: false,
      icon: <GlobeAltIcon className="h-6 w-6" />,
      description: "Your organization's Twitter handle"
    },
    { 
      name: "facebook", 
      label: "Facebook", 
      placeholder: "Facebook page (optional)", 
      required: false,
      icon: <GlobeAltIcon className="h-6 w-6" />,
      description: "Your organization's Facebook page URL"
    },
    { 
      name: "linkedin", 
      label: "LinkedIn", 
      placeholder: "LinkedIn profile (optional)", 
      required: false,
      icon: <GlobeAltIcon className="h-6 w-6" />,
      description: "Your organization's LinkedIn profile URL"
    },
    { 
      name: "review", 
      label: "Review Your Information", 
      icon: <PencilSquareIcon className="h-6 w-6" /> 
    }
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
    targetDemographics: [],
    fundingAmount: "",
    applicationDeadlines: "",
    scholarshipTypes: [],
    eligibilityCriteria: [],
    fundingHistory: "",
    successStories: "",
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
    if (orgSteps[currentStep].name === "review" || !orgSteps[currentStep].required) {
      setError("");
      if (currentStep < orgSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final step: submit the form
        await handleSubmit();
      }
      return;
    }

    // Validate required fields
    const currentField = orgSteps[currentStep].name;
    const currentValue = formData[currentField];
    
    if (Array.isArray(currentValue)) {
      if (orgSteps[currentStep].required && currentValue.length === 0) {
        setError(`Please select at least one ${orgSteps[currentStep].label}`);
        return;
      }
    } else {
      if (orgSteps[currentStep].required && (!currentValue || (typeof currentValue === 'string' && !currentValue.trim()))) {
        setError(`Please enter ${orgSteps[currentStep].label}`);
        return;
      }
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

  const renderFieldContent = () => {
    const currentField = orgSteps[currentStep];
    
    if (currentField.name === "review") {
      return (
        <div className="mb-4 text-black dark:text-white">
          <h2 className="text-xl font-medium mb-4">Review Your Information</h2>
          <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            {orgSteps.slice(0, -1).map((step, index) => {
              const value = formData[step.name];
              // Skip displaying empty optional fields
              if ((!value || (Array.isArray(value) && value.length === 0)) && !step.required) {
                return null;
              }
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
                <div className={`h-8 w-8 mb-2 flex items-center justify-center ${
                  formData[currentField.name] === option.value ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"
                }`}>
                  {currentField.name === "category" ? (
                    option.value === "educational" ? <AcademicCapIcon className="h-8 w-8" /> :
                    option.value === "nonprofit" ? <HeartIcon className="h-8 w-8" /> :
                    option.value === "corporate" ? <BuildingOffice2Icon className="h-8 w-8" /> :
                    option.value === "government" ? <BuildingLibraryIcon className="h-8 w-8" /> :
                    option.value === "foundation" ? <CurrencyDollarIcon className="h-8 w-8" /> :
                    <TagIcon className="h-8 w-8" />
                  ) : <CurrencyDollarIcon className="h-8 w-8" />}
                </div>
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
            type={currentField.type || "text"}
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
          Organization Profile Setup
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
              Step {currentStep + 1} of {orgSteps.length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentStep < orgSteps.length - 1 && !orgSteps[currentStep].required && 
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
            {currentStep === orgSteps.length - 1 ? (loading ? "Submitting..." : "Complete Setup") : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
} 