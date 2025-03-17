"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon, 
  Squares2X2Icon, 
  Bars3Icon, 
  FunnelIcon, 
  PlusCircleIcon, 
  XMarkIcon, 
  ArrowLeftIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  CreditCardIcon,
  ListBulletIcon,
  BuildingOffice2Icon,
  ArrowLongRightIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  BookOpenIcon,
  LinkIcon,
  BanknotesIcon,
  AcademicCapIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkOutlineIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface Bursary {
  _id: string;
  title: string;
  description: string;
  applicationUrl: string;
  deadline: string;
  awardAmount: number;
  fieldOfStudy: string[];
  academicLevel: string[];
  financialNeedLevel: string;
  requiredDocuments: string[];
  aiTags: string[];
  aiCategorization: string[];
  competitionLevel: string;
  applicationComplexity: string;
  organization: {
    _id: string;
    title: string;
    name?: string;
    images: {
      logo?: string;
    };
    contact: {
      email: string;
      website?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

// Modal component for adding bursaries
function AddBursaryModal({ 
  isOpen, 
  onClose,
  setBursaries,
  setFilteredBursaries,
  setNewlyAddedBursaryId
}: { 
  isOpen: boolean; 
  onClose: () => void;
  setBursaries: React.Dispatch<React.SetStateAction<Bursary[]>>;
  setFilteredBursaries: React.Dispatch<React.SetStateAction<Bursary[]>>;
  setNewlyAddedBursaryId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    applicationUrl: "",
    deadline: "",
    awardAmount: "",
    eligibilityCriteria: "",
    fieldOfStudy: [] as string[],
    academicLevel: [] as string[],
    financialNeedLevel: "medium",
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle multi-select changes
  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name } = e.target;
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    
    setFormData(prev => ({
      ...prev,
      [name]: selectedOptions
    }));
  };
  
  // Handle field of study selection (replacing dropdown)
  const toggleFieldOfStudy = (field: string) => {
    setFormData(prev => {
      if (prev.fieldOfStudy.includes(field)) {
        return {
          ...prev,
          fieldOfStudy: prev.fieldOfStudy.filter(f => f !== field)
        };
      } else {
        return {
          ...prev,
          fieldOfStudy: [...prev.fieldOfStudy, field]
        };
      }
    });
  };
  
  // Handle checkbox changes for academic levels
  const handleCheckboxChange = (level: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        academicLevel: [...prev.academicLevel, level]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        academicLevel: prev.academicLevel.filter(l => l !== level)
      }));
    }
  };
  
  // Handle navigation between steps
  const goToNextStep = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any form submission
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPrevStep = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any form submission
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("======= MODAL FORM SUBMISSION STARTED =======");
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Basic validation
      if (!formData.title) throw new Error("Title is required");
      if (!formData.description) throw new Error("Description is required");
      if (!formData.applicationUrl) throw new Error("Application URL is required");
      if (!formData.deadline) throw new Error("Deadline is required");
      if (!formData.awardAmount) throw new Error("Award amount is required");
      
      // Format data
      const bursaryData = {
        title: formData.title,
        description: formData.description,
        eligibilityCriteria: formData.eligibilityCriteria || "None specified",
        applicationUrl: formData.applicationUrl,
        deadline: new Date(formData.deadline).toISOString(),
        awardAmount: parseFloat(formData.awardAmount) || 0,
        fieldOfStudy: formData.fieldOfStudy.length > 0 ? formData.fieldOfStudy : ["Other"],
        academicLevel: formData.academicLevel.length > 0 ? formData.academicLevel : ["undergraduate"],
        financialNeedLevel: formData.financialNeedLevel,
        documents: [],
      };
      
      console.log("SENDING BURSARY DATA:", JSON.stringify(bursaryData));
      
      // Get current URL base
      const urlBase = window.location.origin;
      const url = `${urlBase}/api/bursaries`;
      
      console.log("SENDING POST REQUEST TO:", url);
      
      // Direct POST request 
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bursaryData),
        credentials: "include",
      });
      
      console.log("RECEIVED RESPONSE STATUS:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("ERROR RESPONSE:", errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log("SUCCESS! CREATED BURSARY:", result);
      
      // Add the newly created bursary to the bursaries list
      const newBursary = result;
      
      // Update the bursaries state with the new bursary
      setBursaries(prevBursaries => [newBursary, ...prevBursaries]);
      setFilteredBursaries(prevFiltered => [newBursary, ...prevFiltered]);
      
      // Set the newly added bursary ID to trigger highlighting
      setNewlyAddedBursaryId(newBursary._id);
      
      // Reset the highlight after animation (6 seconds now)
      setTimeout(() => {
        setNewlyAddedBursaryId(null);
      }, 6000);
      
      // Show success message
      setSuccess(`Bursary "${formData.title}" was successfully created!`);
      
      // Reset form on success
      setFormData({
        title: "",
        description: "",
        eligibilityCriteria: "",
        applicationUrl: "",
        deadline: "",
        awardAmount: "",
        fieldOfStudy: [],
        academicLevel: [],
        financialNeedLevel: "medium",
      });
      
      // Start the fade-out animation
      setIsFadingOut(true);
      
      // Close modal after a short animation delay
      setTimeout(() => {
        onClose();
        // Reset fade state after closing
        setTimeout(() => setIsFadingOut(false), 100);
      }, 1000);
    } catch (error) {
      console.error("FORM SUBMISSION ERROR:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
      console.log("======= MODAL FORM SUBMISSION COMPLETED =======");
    }
  };
  
  // Icons for the modal
  const StepIcon = ({ step, currentStep }: { step: number; currentStep: number }) => (
    <div className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors ${
      step === currentStep 
        ? 'bg-gradient-to-r from-[#c33c33] to-[#5b3d2e] text-white' 
        : step < currentStep 
          ? 'bg-[#d2ac8b] text-white' 
          : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
    }`}>
      {step < currentStep ? (
        <CheckIcon className="h-5 w-5" />
      ) : (
        <span>{step}</span>
      )}
    </div>
  );
  
  if (!isOpen) return null;

  // Calculate progress percentage
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all ${isFadingOut ? 'bg-black/0 backdrop-blur-none' : 'bg-black/50 backdrop-blur-sm'}`} onClick={onClose}>
      <div 
        className={`bg-[#e3dacc] dark:bg-[#5b3d2e] rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto p-0 ${isFadingOut ? 'modal-fade-out' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#e3dacc] dark:bg-[#5b3d2e] p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            <PlusCircleIcon className="h-6 w-6 mr-2 text-[#c33c33] dark:text-[#d2ac8b]" />
            Add New Bursary
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700">
          <div 
            className="h-full bg-gradient-to-r from-[#c33c33] to-[#d2ac8b] transition-all duration-300 ease-in-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {/* Step indicators */}
        <div className="flex justify-between px-6 py-4 bg-[#e3dacc] dark:bg-[#5b3d2e]">
          <div className="flex items-center gap-2">
            <StepIcon step={1} currentStep={currentStep} />
            <span className={`text-sm font-medium ${currentStep === 1 ? 'text-[#c33c33] dark:text-[#d2ac8b]' : ''}`}>Basic Info</span>
          </div>
          <div className="flex-1 mx-4 border-t border-dashed border-gray-300 dark:border-gray-600 self-center"></div>
          <div className="flex items-center gap-2">
            <StepIcon step={2} currentStep={currentStep} />
            <span className={`text-sm font-medium ${currentStep === 2 ? 'text-[#c33c33] dark:text-[#d2ac8b]' : ''}`}>Financial</span>
          </div>
          <div className="flex-1 mx-4 border-t border-dashed border-gray-300 dark:border-gray-600 self-center"></div>
          <div className="flex items-center gap-2">
            <StepIcon step={3} currentStep={currentStep} />
            <span className={`text-sm font-medium ${currentStep === 3 ? 'text-[#c33c33] dark:text-[#d2ac8b]' : ''}`}>Academic</span>
          </div>
        </div>
        
        <div className="p-6 bg-[#e3dacc] dark:bg-[#5b3d2e]">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl mb-6">
              <strong>Success!</strong> {success}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={(e) => currentStep === totalSteps ? handleSubmit(e) : e.preventDefault()}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-5 min-h-[300px] bg-[#f4ece4] dark:bg-[#a68973] p-5 rounded-xl shadow-sm">
                <div className="flex items-center mb-6">
                  <DocumentTextIcon className="h-6 w-6 mr-2 text-[#c33c33] dark:text-[#d2ac8b]" />
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">Basic Information</h3>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bursary Title</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">
                        <BookOpenIcon className="h-5 w-5" />
                      </span>
                      <input 
                        type="text" 
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter the title of your bursary" 
                        className="w-full pl-10 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c33c33] dark:focus:ring-[#d2ac8b] text-gray-800 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <div className="relative">
                      <textarea 
                        rows={4} 
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the bursary and eligibility requirements" 
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c33c33] dark:focus:ring-[#d2ac8b] text-gray-800 dark:text-white"
                        required
                      ></textarea>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application URL</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">
                        <LinkIcon className="h-5 w-5" />
                      </span>
                      <input 
                        type="url" 
                        name="applicationUrl"
                        value={formData.applicationUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/apply" 
                        className="w-full pl-10 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c33c33] dark:focus:ring-[#d2ac8b] text-gray-800 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Financial Details */}
            {currentStep === 2 && (
              <div className="space-y-5 min-h-[300px] bg-[#f4ece4] dark:bg-[#a68973] p-5 rounded-xl shadow-sm">
                <div className="flex items-center mb-6">
                  <BanknotesIcon className="h-6 w-6 mr-2 text-[#c33c33] dark:text-[#d2ac8b]" />
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">Financial Details</h3>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Award Amount</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">
                        <CurrencyDollarIcon className="h-5 w-5" />
                      </span>
                      <input 
                        type="number" 
                        name="awardAmount"
                        value={formData.awardAmount}
                        onChange={handleChange}
                        placeholder="0.00" 
                        className="w-full pl-10 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c33c33] dark:focus:ring-[#d2ac8b] text-gray-800 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">
                        <CalendarIcon className="h-5 w-5" />
                      </span>
                      <input 
                        type="date" 
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        className="w-full pl-10 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c33c33] dark:focus:ring-[#d2ac8b] text-gray-800 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Financial Need Level</label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, financialNeedLevel: 'low' })}
                        className={`flex flex-col items-center p-3 rounded-xl border ${
                          formData.financialNeedLevel === 'low'
                            ? 'bg-[#e3dacc] dark:bg-[#5b3d2e] border-[#c33c33] dark:border-[#d2ac8b]'
                            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <CreditCardIcon className={`h-6 w-6 mb-1 ${formData.financialNeedLevel === 'low' ? 'text-[#c33c33] dark:text-[#d2ac8b]' : 'text-gray-500 dark:text-gray-400'}`} />
                        <span className="text-sm font-medium">Low</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Not a primary criterion</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, financialNeedLevel: 'medium' })}
                        className={`flex flex-col items-center p-3 rounded-xl border ${
                          formData.financialNeedLevel === 'medium'
                            ? 'bg-[#e3dacc] dark:bg-[#5b3d2e] border-[#c33c33] dark:border-[#d2ac8b]'
                            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <CreditCardIcon className={`h-6 w-6 mb-1 ${formData.financialNeedLevel === 'medium' ? 'text-[#c33c33] dark:text-[#d2ac8b]' : 'text-gray-500 dark:text-gray-400'}`} />
                        <span className="text-sm font-medium">Medium</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Considered but not required</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, financialNeedLevel: 'high' })}
                        className={`flex flex-col items-center p-3 rounded-xl border ${
                          formData.financialNeedLevel === 'high'
                            ? 'bg-[#e3dacc] dark:bg-[#5b3d2e] border-[#c33c33] dark:border-[#d2ac8b]'
                            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <CreditCardIcon className={`h-6 w-6 mb-1 ${formData.financialNeedLevel === 'high' ? 'text-[#c33c33] dark:text-[#d2ac8b]' : 'text-gray-500 dark:text-gray-400'}`} />
                        <span className="text-sm font-medium">High</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Significant need required</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Academic Information */}
            {currentStep === 3 && (
              <div className="space-y-5 min-h-[300px] bg-[#f4ece4] dark:bg-[#a68973] p-5 rounded-xl shadow-sm">
                <div className="flex items-center mb-6">
                  <AcademicCapIcon className="h-6 w-6 mr-2 text-[#c33c33] dark:text-[#d2ac8b]" />
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">Academic Information</h3>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Field of Study</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {[
                        "Engineering", "Computer Science", "Business", "Medicine", "Law", 
                        "Arts", "Humanities", "Social Sciences", "Natural Sciences", "Education",
                        "Mathematics", "Other"
                      ].map(field => (
                        <button
                          key={field}
                          type="button"
                          onClick={() => toggleFieldOfStudy(field)}
                          className={`flex items-center p-2 rounded-lg border ${
                            formData.fieldOfStudy.includes(field)
                              ? 'bg-[#e3dacc] dark:bg-[#5b3d2e] border-[#c33c33] dark:border-[#d2ac8b] text-[#c33c33] dark:text-[#d2ac8b]'
                              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {formData.fieldOfStudy.includes(field) ? 
                            <CheckCircleIcon className="h-5 w-5 mr-1.5" /> : 
                            <div className="h-5 w-5 mr-1.5 rounded-full border-2 border-gray-400 dark:border-gray-500"></div>
                          }
                          <span className="text-sm">{field}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Academic Level</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "undergraduate", label: "Undergraduate" },
                        { id: "graduate", label: "Graduate" },
                        { id: "phd", label: "PhD" },
                        { id: "postdoctoral", label: "Postdoctoral" }
                      ].map(level => (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => handleCheckboxChange(level.id, !formData.academicLevel.includes(level.id))}
                          className={`flex items-center p-3 rounded-lg border ${
                            formData.academicLevel.includes(level.id)
                              ? 'bg-[#e3dacc] dark:bg-[#5b3d2e] border-[#c33c33] dark:border-[#d2ac8b] text-[#c33c33] dark:text-[#d2ac8b]'
                              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {formData.academicLevel.includes(level.id) ? 
                            <CheckCircleIcon className="h-5 w-5 mr-2" /> : 
                            <div className="h-5 w-5 mr-2 rounded-full border-2 border-gray-400 dark:border-gray-500"></div>
                          }
                          <span>{level.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Eligibility Criteria</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">
                        <ClipboardDocumentCheckIcon className="h-5 w-5" />
                      </span>
                      <textarea 
                        rows={3} 
                        name="eligibilityCriteria"
                        value={formData.eligibilityCriteria}
                        onChange={handleChange}
                        placeholder="Any additional eligibility criteria..." 
                        className="w-full pl-10 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c33c33] dark:focus:ring-[#d2ac8b] text-gray-800 dark:text-white"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation buttons */}
            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Back
                </button>
              ) : (
                <div></div>
              )}
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="flex items-center px-6 py-2 bg-gradient-to-r from-[#c33c33] to-[#5b3d2e] text-white rounded-xl shadow-md hover:from-[#b33730] hover:to-[#4b3326] transition-all focus:outline-none"
                >
                  Next
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-2 bg-gradient-to-r from-[#c33c33] to-[#5b3d2e] text-white rounded-xl shadow-md hover:from-[#b33730] hover:to-[#4b3326] transition-all focus:outline-none"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Create Bursary
                      <CheckIcon className="h-4 w-4 ml-1" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Add this at the beginning of the file, after other imports
// for the custom scrollbar styling
const globalStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.7);
  }
  
  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(75, 85, 99, 0.5);
  }
  
  .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(75, 85, 99, 0.7);
  }
  
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }
  
  .dark .custom-scrollbar {
    scrollbar-color: rgba(75, 85, 99, 0.5) transparent;
  }
  
  .text-xxs {
    font-size: 0.6rem;
    line-height: 0.9rem;
    white-space: nowrap;
  }
`;

export default function BursariesPage() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [viewMode, setViewMode] = useState("card");
  const [loading, setLoading] = useState(true);
  const [bursaries, setBursaries] = useState<Bursary[]>([]);
  const [filteredBursaries, setFilteredBursaries] = useState<Bursary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedBursary, setSelectedBursary] = useState<Bursary | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [bookmarkedBursaries, setBookmarkedBursaries] = useState<string[]>([]);
  const [filterOption, setFilterOption] = useState("all");
  const [userOrgId, setUserOrgId] = useState<string | null>(null);
  const [isAddBursaryModalOpen, setIsAddBursaryModalOpen] = useState(false);
  const [newlyAddedBursaryId, setNewlyAddedBursaryId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Get user role and org ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('userRole');
      setUserRole(storedRole);
      
      // Get bookmarked bursaries from localStorage
      const bookmarks = localStorage.getItem('bookmarkedBursaries');
      if (bookmarks) {
        setBookmarkedBursaries(JSON.parse(bookmarks));
      }

      // Get organization ID if user is an organization/funder
      if (storedRole === 'organization' || storedRole === 'funder') {
        const orgId = localStorage.getItem('userOrgId');
        setUserOrgId(orgId);
      }
      
      // Check for newly added bursary ID in sessionStorage (from create page)
      const newBursaryId = sessionStorage.getItem('newlyAddedBursaryId');
      if (newBursaryId) {
        setNewlyAddedBursaryId(newBursaryId);
        // Clear the session storage item
        sessionStorage.removeItem('newlyAddedBursaryId');
        // Reset the highlight after animation (6 seconds now)
        setTimeout(() => {
          setNewlyAddedBursaryId(null);
        }, 6000);
      }
    }
  }, []);

  // Fetch bursaries from API
  useEffect(() => {
    const fetchBursaries = async () => {
      try {
        setLoading(true);
        
        // Use the filter option to determine if we should fetch only user's bursaries
        const url = filterOption === 'my-bursaries' 
          ? "/api/bursaries?myBursariesOnly=true" 
          : "/api/bursaries";
        
        console.log("Fetching bursaries from:", url);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error("Failed to fetch bursaries");
        }
        
        const data = await response.json();
        console.log(`Fetched ${data.length} bursaries`);
        setBursaries(data);
        setFilteredBursaries(data);
      } catch (error) {
        console.error("Error fetching bursaries:", error);
        setError("Failed to load bursaries. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBursaries();
  }, [filterOption]); // Add filterOption as a dependency to refetch when it changes

  // Toggle bookmark for a bursary
  const toggleBookmark = (e: React.MouseEvent, bursaryId: string) => {
    e.stopPropagation(); // Prevent card click event

    let updatedBookmarks;
    if (bookmarkedBursaries.includes(bursaryId)) {
      updatedBookmarks = bookmarkedBursaries.filter(id => id !== bursaryId);
    } else {
      updatedBookmarks = [...bookmarkedBursaries, bursaryId];
    }
    
    setBookmarkedBursaries(updatedBookmarks);
    localStorage.setItem('bookmarkedBursaries', JSON.stringify(updatedBookmarks));
    
    // Re-apply filtering if currently in bookmarks view
    if (filterOption === 'bookmarked') {
      handleFilterChange('bookmarked');
    }
  };

  // Filter bursaries based on search, category, and filter option
  useEffect(() => {
    if (!bursaries.length) return;
    
    let filtered = [...bursaries];
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        b => 
          (b.title?.toLowerCase() || '').includes(searchLower) ||
          (b.description?.toLowerCase() || '').includes(searchLower) ||
          (b.organization?.title?.toLowerCase() || '').includes(searchLower) ||
          b.aiTags?.some(tag => tag && tag.toLowerCase().includes(searchLower)) ||
          b.aiCategorization?.some(cat => cat && cat.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by category
    if (category && category !== "all") {
      filtered = filtered.filter(b => {
        const fieldMatch = b.fieldOfStudy?.some(field => 
          field && field.toLowerCase().includes(category.toLowerCase())
        );
        
        const tagMatch = b.aiTags?.some(tag => 
          tag && tag.toLowerCase().includes(category.toLowerCase())
        );
        
        const catMatch = b.aiCategorization?.some(cat => 
          cat && cat.toLowerCase().includes(category.toLowerCase())
        );
        
        const levelMatch = category === "undergraduate" || category === "graduate" 
          ? b.academicLevel?.some(level => 
              level && level.toLowerCase().includes(category.toLowerCase())
            )
          : false;
          
        return fieldMatch || tagMatch || catMatch || levelMatch;
      });
    }

    // Apply filter option (all, bookmarked, or my bursaries)
    if (filterOption === 'bookmarked') {
      filtered = filtered.filter(b => bookmarkedBursaries.includes(b._id));
    } 
    // For 'my-bursaries', the API already filters for organizations/funders
    // This client-side filtering is a fallback in case the API filtering doesn't work
    else if (filterOption === 'my-bursaries') {
      // Only show bursaries created by the current user's organization
      if (userOrgId) {
        filtered = filtered.filter(b => b.organization._id === userOrgId);
      }
    }
    
    setFilteredBursaries(filtered);
  }, [search, category, bursaries, filterOption, bookmarkedBursaries, userRole, userOrgId]);

  // Handle filter change
  const handleFilterChange = (option: string) => {
    console.log("Changing filter to:", option);
    setFilterOption(option);
    // No need to manually filter here as the useEffect will handle refetching
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date as "time ago" (e.g., "2 days ago")
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    // Define time intervals in seconds
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;
    
    if (diffInSeconds < minute) {
      return 'just now';
    } else if (diffInSeconds < hour) {
      const mins = Math.floor(diffInSeconds / minute);
      return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < day) {
      const hrs = Math.floor(diffInSeconds / hour);
      return `${hrs} ${hrs === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < week) {
      const days = Math.floor(diffInSeconds / day);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else if (diffInSeconds < month) {
      const weeks = Math.floor(diffInSeconds / week);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffInSeconds < year) {
      const months = Math.floor(diffInSeconds / month);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      const years = Math.floor(diffInSeconds / year);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
  };
  
  // Format full date for tooltip/hover
  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-CA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle click on a bursary card
  const handleBursaryClick = (bursary: Bursary) => {
    setSelectedBursary(bursary);
    setIsDetailOpen(true);
  };

  // Close detail panel
  const closeDetailPanel = () => {
    setIsDetailOpen(false);
  };

  // Check if a bursary is bookmarked
  const isBookmarked = (bursaryId: string) => {
    return bookmarkedBursaries.includes(bursaryId);
  };

  // Check if user can apply (non-funders only)
  const canApply = () => {
    return userRole !== 'funder' && userRole !== 'organization';
  };

  // Check if user owns a bursary
  const isOwnBursary = (bursary: Bursary): boolean => {
    if (!userOrgId || !bursary.organization || !bursary.organization._id) {
      return false;
    }
    return userOrgId === bursary.organization._id;
  };

  // Add useEffect to remove padding from parent container
  useEffect(() => {
    // Target the main element which is causing scrolling
    const mainElement = document.querySelector('main');
    if (mainElement) {
      // Save original padding
      const originalPadding = mainElement.style.padding;
      
      // Remove padding bottom
      mainElement.style.paddingBottom = '0';
      
      // Cleanup function to restore original padding
      return () => {
        mainElement.style.padding = originalPadding;
      };
    }
  }, []);

  // Add a helper function to get organization type to avoid duplication
  const getOrganizationType = (bursary: Bursary): string => {
    if (!bursary.organization) {
      return "Education Partner";
    }
    
    const orgName = bursary.organization.title || bursary.organization.name || "";
    
    if (!orgName) {
      return "Education Partner";
    }
    
    if (orgName === "University of Toronto") {
      return "Top University";
    } else if (orgName.includes("Foundation")) {
      return "Foundation";
    } else if (orgName.includes("Scholarship")) {
      return "Scholarship Provider";
    } else {
      return "Education Partner";
    }
  };

  // Handle edit bursary - redirect to edit page or form
  const handleEditBursary = (e: React.MouseEvent, bursaryId: string) => {
    e.stopPropagation();
    // Use router.push instead of window.location for better Next.js integration
    // The route format should follow your app's structure
    router.push(`/dashboard/bursaries/${bursaryId}/edit`);
  };

  // Handle delete bursary
  const handleDeleteBursary = async (e: React.MouseEvent, bursaryId: string) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this bursary? This action cannot be undone.")) {
      return;
    }
    
    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      const response = await fetch(`/api/bursaries/${bursaryId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete bursary');
      }
      
      // On successful deletion
      setDeleteSuccess('Bursary deleted successfully');
      
      // Remove the deleted bursary from the state
      const updatedBursaries = bursaries.filter(b => b._id !== bursaryId);
      setBursaries(updatedBursaries);
      setFilteredBursaries(filteredBursaries.filter(b => b._id !== bursaryId));
      
      // Close the detail panel
      setIsDetailOpen(false);
      setSelectedBursary(null);
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting bursary:', error);
      setDeleteError(error instanceof Error ? error.message : 'An error occurred while deleting the bursary');
      
      // Clear the error message after 3 seconds
      setTimeout(() => {
        setDeleteError(null);
      }, 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] overflow-hidden gap-6 w-full">
      {/* Custom scrollbar styles */}
      <style jsx global>{`
        ${globalStyles}
        
        /* Style for the main container */
        main {
          padding-bottom: 0 !important;
        }
        
        main > div {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        /* Animation for newly added bursary */
        @keyframes highlightFade {
          0% { background-color: rgba(126, 58, 242, 0.3); }
          15% { background-color: rgba(126, 58, 242, 0.3); }
          70% { background-color: rgba(126, 58, 242, 0.2); }
          100% { background-color: transparent; }
        }
        
        @keyframes borderPulse {
          0% { border-color: rgba(126, 58, 242, 0.8); box-shadow: 0 0 0 4px rgba(126, 58, 242, 0.1); }
          20% { border-color: rgba(126, 58, 242, 0.8); box-shadow: 0 0 0 4px rgba(126, 58, 242, 0.1); }
          70% { border-color: rgba(126, 58, 242, 0.5); box-shadow: 0 0 0 2px rgba(126, 58, 242, 0.05); }
          100% { border-color: rgba(126, 58, 242, 0); box-shadow: 0 0 0 0 rgba(126, 58, 242, 0); }
        }
        
        @keyframes badgePulse {
          0% { opacity: 1; transform: scale(1); }
          15% { opacity: 1; transform: scale(1.05); }
          30% { opacity: 1; transform: scale(1); }
          45% { opacity: 1; transform: scale(1.05); }
          60% { opacity: 1; transform: scale(1); }
          80% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.9); }
        }
        
        .highlight-new-bursary {
          border: 2px solid rgba(126, 58, 242, 0.8) !important;
          animation: borderPulse 6s ease-out forwards, highlightFade 6s ease-out forwards !important;
        }
        
        .new-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(to right, #9333ea, #6366f1);
          color: white;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          animation: badgePulse 6s ease-out forwards;
        }
        
        /* Modal transition animations */
        @keyframes modalFadeOut {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.95); }
        }
        
        .modal-fade-out {
          animation: modalFadeOut 0.4s ease-in-out forwards;
        }
      `}</style>
      
      {/* Header section with title and search */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-950/40 backdrop-blur-md p-6 rounded-2xl shadow-md border border-purple-100 dark:border-purple-900/30 flex-shrink-0 mx-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {filterOption === 'my-bursaries' ? 'Bursaries I Created' : 'Bursary Opportunities'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {filterOption === 'my-bursaries' 
                ? 'Bursaries created by your account'
                : 'Discover and apply for bursaries that match your profile'}
            </p>
            {filterOption === 'my-bursaries' && (
              <div className="mt-2">
                <button 
                  className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                  onClick={() => handleFilterChange('all')}
                >
                  <ArrowLongRightIcon className="h-4 w-4 mr-1" />
                  View all bursaries
                </button>
              </div>
            )}
          </div>
          
          {/* Move buttons here to the upper right */}
          {(userRole === 'organization' || userRole === 'funder') && (
            <div className="flex gap-3">
              {/* Add Bursary button */}
              <button 
                onClick={() => setIsAddBursaryModalOpen(true)}
                className="px-4 py-2 bg-[#c83c34] text-white rounded-xl hover:bg-[#c83c34]/90 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <PlusCircleIcon className="h-5 w-5" />
                Add Bursary
              </button>
              
              {/* My Listings button */}
              <button
                onClick={() => handleFilterChange(filterOption === 'my-bursaries' ? 'all' : 'my-bursaries')}
                className={`px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-2 ${
                  filterOption === 'my-bursaries' 
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <BuildingOffice2Icon className="h-5 w-5" />
                My Listings
              </button>
            </div>
          )}
        </div>
        
        {/* Search and filter tools */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search bursaries by title, description, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3">
            {/* Bookmark filter button */}
            <button
              onClick={() => handleFilterChange(filterOption === 'bookmarked' ? 'all' : 'bookmarked')}
              className={`p-2.5 rounded-xl shadow-sm border transition-all flex items-center justify-center ${
                filterOption === 'bookmarked' 
                  ? 'bg-[#c83c34] border-[#c83c34] text-white' 
                  : 'bg-white dark:bg-gray-700 border-purple-200 dark:border-purple-800/40 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-700'
              }`}
              aria-label={filterOption === 'bookmarked' ? "Show all bursaries" : "Show bookmarked bursaries"}
            >
              {filterOption === 'bookmarked' ? (
                <BookmarkSolidIcon className="h-5 w-5" />
              ) : (
                <BookmarkOutlineIcon className="h-5 w-5" />
              )}
            </button>
            
            {/* View mode toggle with icons */}
            <div className="flex bg-white dark:bg-gray-700 p-1 rounded-xl shadow-sm border border-purple-200 dark:border-purple-800/40">
              <button
                onClick={() => setViewMode("card")}
                className={`p-1.5 rounded-lg ${viewMode === "card" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"}`}
                aria-label="Card View"
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg ${viewMode === "list" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"}`}
                aria-label="List View"
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Category filter tags */}
        <div className="flex flex-wrap gap-2 mt-4 mb-6">
          <button
            onClick={() => setCategory('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              category === 'all' 
                ? 'bg-[#c83c34] text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            All Categories
          </button>
          <button
            onClick={() => setCategory('stem')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              category === 'stem' 
                ? 'bg-blue-500 text-white' 
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50'
            }`}
          >
            STEM
          </button>
          <button
            onClick={() => setCategory('arts')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              category === 'arts' 
                ? 'bg-purple-500 text-white' 
                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/50'
            }`}
          >
            Arts & Humanities
          </button>
          <button
            onClick={() => setCategory('leadership')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              category === 'leadership' 
                ? 'bg-green-500 text-white' 
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50'
            }`}
          >
            Leadership & Community
          </button>
          <button
            onClick={() => setCategory('research')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              category === 'research' 
                ? 'bg-amber-500 text-white' 
                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/50'
            }`}
          >
            Research & Academia
          </button>
          <button
            onClick={() => setCategory('indigenous')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              category === 'indigenous' 
                ? 'bg-teal-500 text-white' 
                : 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800/50'
            }`}
          >
            Indigenous Focused
          </button>
          <button
            onClick={() => setCategory('undergraduate')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              category === 'undergraduate' 
                ? 'bg-indigo-500 text-white' 
                : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/50'
            }`}
          >
            Undergraduate
          </button>
          <button
            onClick={() => setCategory('graduate')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              category === 'graduate' 
                ? 'bg-rose-500 text-white' 
                : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800/50'
            }`}
          >
            Graduate & Above
          </button>
        </div>
        
        {/* Remove buttons from here */}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative flex-shrink-0" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Main content area with optional sidebar layout - make it strictly contained */}
      <div className={`flex ${isDetailOpen ? 'gap-6' : ''} flex-1 min-h-0 overflow-hidden`}>
        {/* Bursary listings */}
        <div className={`${isDetailOpen ? 'w-3/5' : 'w-full'} transition-all duration-300 overflow-hidden flex flex-col`}>
          {/* Conditional Rendering: Show skeletons while loading */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
              {[1, 2, 3, 4].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white/70 dark:bg-gray-800/30 rounded-2xl shadow-lg p-6 backdrop-blur-md animate-pulse"
                >
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="mt-4 flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBursaries.length === 0 ? (
            // No bursaries found
            <div className="flex flex-col items-center justify-center py-12 text-center flex-1">
              <div className="bg-white/80 dark:bg-gray-800/60 rounded-2xl p-8 backdrop-blur-md shadow-lg max-w-md mx-auto">
                <div className="text-purple-600 dark:text-purple-400 mb-4">
                  <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Bursaries Found</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {search || category !== "all" || filterOption !== "all" ? 
                    "Try adjusting your filters or search criteria to find more opportunities." : 
                    "There are no bursaries available at the moment. Please check back later."}
                </p>
                {(search || category !== "all" || filterOption !== "all") && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setCategory("all");
                      setFilterOption("all");
                    }}
                    className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 flex items-center justify-center gap-1 mx-auto"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Show bursary cards or list
            <div className={`${
              viewMode === "card" 
                ? "grid grid-cols-1 md:grid-cols-2 gap-6" 
                : "flex flex-col space-y-4"
            } overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 h-full`}>
              {filteredBursaries.map((bursary) => (
                viewMode === "card" ? (
                  // Card View
                  <div 
                    key={bursary._id}
                    onClick={() => handleBursaryClick(bursary)}
                    className={`${
                      selectedBursary && selectedBursary._id === bursary._id
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700'
                        : 'bg-white/90 dark:bg-gray-800/60 border border-purple-100/50 dark:border-purple-900/30'
                    } rounded-2xl shadow-lg p-6 hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-800/40 transition-all cursor-pointer relative ${newlyAddedBursaryId === bursary._id ? 'highlight-new-bursary' : ''}`}
                  >
                    {newlyAddedBursaryId === bursary._id && (
                      <div className="new-badge">NEW</div>
                    )}
                    
                    {/* Your Listing badge as a stamp */}
                    {isOwnBursary(bursary) && (
                      <div className="absolute -top-2 -left-2 z-10">
                        <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/60 rounded-full text-[9px] leading-tight text-purple-800 dark:text-purple-300 font-medium border border-purple-200 dark:border-purple-800/50 whitespace-nowrap shadow-sm">
                          Your Listing
                        </span>
                      </div>
                    )}
                    
                    {/* Card header with organization logo */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                          {bursary.organization && bursary.organization.images && bursary.organization.images.logo ? (
                            <img src={bursary.organization.images.logo} alt={`${bursary.organization?.title || 'Organization'} logo`} className="w-full h-full object-cover" />
                          ) : (
                            <BuildingOffice2Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          )}
                        </div>
                        <div>
                          {/* Organization title */}
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block">
                            <Link 
                              href={bursary.organization?._id ? `/organizations/${bursary.organization._id}` : '#'}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!bursary.organization?._id) {
                                  e.preventDefault();
                                  console.error('No organization ID available');
                                }
                              }}
                              className="hover:text-purple-600 dark:hover:text-purple-400 hover:underline"
                            >
                              {bursary.organization?.title || bursary.organization?.name || 'Organization'}
                            </Link>
                          </span>
                          
                          {/* Organization type - properly placed UNDER the title */}
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium block mt-1">
                            {getOrganizationType(bursary)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Move bookmark button to top-left corner */}
                      <div className="flex items-center gap-2">
                        {/* Added date - modern time ago with tooltip */}
                        <div className="z-10" onClick={(e) => e.stopPropagation()}>
                          <div className="relative">
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-white/90 dark:bg-gray-800/90 px-2 py-0.5 rounded-full shadow-sm border border-gray-100/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-colors group">
                              <ClockIcon className="h-3 w-3" />
                              <span className="truncate max-w-[80px] sm:max-w-none">{formatTimeAgo(bursary.createdAt)}</span>
                            
                              {/* Tooltip */}
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 w-max pointer-events-none mt-1">
                                <div className="bg-gray-900/95 dark:bg-black/95 text-white text-xs rounded-lg py-2 px-3 shadow-lg whitespace-nowrap">
                                  <span className="font-medium">Added:</span> {formatFullDate(bursary.createdAt)}
                                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-900/95 dark:bg-black/95"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      
                        {/* Bookmark button */}
                        <button 
                          onClick={(e) => toggleBookmark(e, bursary._id)} 
                          className="text-gray-400 hover:text-purple-600 dark:text-gray-500 dark:hover:text-purple-400 transition-colors flex-shrink-0 ml-2 self-start mt-1"
                          aria-label={isBookmarked(bursary._id) ? "Remove from bookmarks" : "Add to bookmarks"}
                        >
                          {isBookmarked(bursary._id) ? (
                            <BookmarkSolidIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <BookmarkOutlineIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Bursary title and description */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                      {bursary.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {bursary.description}
                    </p>
                    
                    {/* Tags and categories */}
                    {(bursary.fieldOfStudy?.length > 0 || bursary.aiTags?.length > 0) && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {bursary.fieldOfStudy?.slice(0, 2).map((field) => (
                          <span 
                            key={field} 
                            className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-xs text-purple-800 dark:text-purple-300 rounded-full"
                          >
                            {field}
                          </span>
                        ))}
                        
                        {bursary.aiTags?.slice(0, 1).map((tag) => (
                          <span 
                            key={tag} 
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-xs text-blue-800 dark:text-blue-300 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        
                        {(bursary.fieldOfStudy?.length > 2 || bursary.aiTags?.length > 1) && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 rounded-full">
                            +{(bursary.fieldOfStudy?.length - 2 > 0 ? bursary.fieldOfStudy.length - 2 : 0) + 
                               (bursary.aiTags?.length - 1 > 0 ? bursary.aiTags.length - 1 : 0)} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Card footer with award amount and deadline */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-emerald-700 dark:text-emerald-400 font-medium">
                        <CurrencyDollarIcon className="h-5 w-5 mr-1" />
                        {formatCurrency(bursary.awardAmount)}
                      </div>
                      
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>Deadline: {formatDate(bursary.deadline)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // List View
                  <div 
                    key={bursary._id}
                    onClick={() => handleBursaryClick(bursary)}
                    className={`${
                      selectedBursary && selectedBursary._id === bursary._id
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700'
                        : 'bg-white/90 dark:bg-gray-800/60 border border-purple-100/50 dark:border-purple-900/30'
                    } rounded-xl shadow p-4 hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-800/40 transition-all cursor-pointer flex gap-4 relative ${newlyAddedBursaryId === bursary._id ? 'highlight-new-bursary' : ''}`}
                  >
                    {newlyAddedBursaryId === bursary._id && (
                      <div className="new-badge">NEW</div>
                    )}
                    
                    {/* Your Listing badge as a stamp */}
                    {isOwnBursary(bursary) && (
                      <div className="absolute -top-2 -left-2 z-10">
                        <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/60 rounded-full text-[9px] leading-tight text-purple-800 dark:text-purple-300 font-medium border border-purple-200 dark:border-purple-800/50 whitespace-nowrap shadow-sm">
                          Your Listing
                        </span>
                      </div>
                    )}
                    
                    {/* Organization logo */}
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                      {bursary.organization && bursary.organization.images && bursary.organization.images.logo ? (
                        <img src={bursary.organization.images.logo} alt={`${bursary.organization?.title || 'Organization'} logo`} className="w-full h-full object-cover" />
                      ) : (
                        <BuildingOffice2Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          {/* Organization title */}
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block">
                            <Link 
                              href={bursary.organization?._id ? `/organizations/${bursary.organization._id}` : '#'}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!bursary.organization?._id) {
                                  e.preventDefault();
                                  console.error('No organization ID available');
                                }
                              }}
                              className="hover:text-purple-600 dark:hover:text-purple-400 hover:underline"
                            >
                              {bursary.organization?.title || bursary.organization?.name || 'Organization'}
                            </Link>
                          </span>
                          
                          {/* Organization type - properly placed UNDER the title */}
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium block mt-1">
                            {getOrganizationType(bursary)}
                          </span>
                          
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                            {bursary.title}
                          </h3>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
                            {bursary.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <div className="flex items-center text-emerald-700 dark:text-emerald-400 font-medium">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          {formatCurrency(bursary.awardAmount)}
                        </div>
                        
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>Deadline: {formatDate(bursary.deadline)}</span>
                        </div>
                        
                        {/* Added date with tooltip - list view */}
                        <div className="flex items-center text-gray-500 dark:text-gray-400 relative" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center hover:text-purple-500 dark:hover:text-purple-400 transition-colors cursor-pointer relative">
                            <ClockIcon className="h-3.5 w-3.5 mr-1" />
                            <span className="truncate max-w-[80px] sm:max-w-none text-xs">{formatTimeAgo(bursary.createdAt)}</span>
                            
                            {/* Tooltip - Only visible when parent is hovered */}
                            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 opacity-0 invisible transition-opacity duration-200 group-hover:opacity-0 hover:opacity-100 hover:visible z-20 w-max">
                              <div className="bg-gray-900/95 dark:bg-black/95 text-white text-xs rounded-lg py-2 px-3 shadow-lg whitespace-nowrap">
                                <span className="font-medium">Added:</span> {formatFullDate(bursary.createdAt)}
                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-900/95 dark:bg-black/95"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bookmark button */}
                    <button 
                      onClick={(e) => toggleBookmark(e, bursary._id)} 
                      className="text-gray-400 hover:text-purple-600 dark:text-gray-500 dark:hover:text-purple-400 transition-colors flex-shrink-0 ml-2 self-start mt-1"
                      aria-label={isBookmarked(bursary._id) ? "Remove from bookmarks" : "Add to bookmarks"}
                    >
                      {isBookmarked(bursary._id) ? (
                        <BookmarkSolidIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <BookmarkOutlineIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
        
        {/* Detail Panel (Sidebar) */}
        {isDetailOpen && selectedBursary && (
          <div className="w-2/5 bg-purple-50/90 dark:bg-purple-900/10 shadow-xl rounded-2xl border-[3px] border-purple-400 dark:border-purple-600 p-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
            {/* Close button */}
            <div className="flex justify-end mb-4">
              <button 
                onClick={closeDetailPanel}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Organization info */}
            <div className="flex items-center gap-3 mb-6 p-4 bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-purple-100/50 dark:border-purple-800/20">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-full flex items-center justify-center overflow-hidden">
                {selectedBursary.organization.images?.logo ? (
                  <img src={selectedBursary.organization.images.logo} alt={`${selectedBursary.organization.title} logo`} className="w-full h-full object-cover" />
                ) : (
                  <BuildingOffice2Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  <Link 
                    href={selectedBursary.organization?._id ? `/organizations/${selectedBursary.organization._id}` : '#'}
                    onClick={(e) => {
                      if (!selectedBursary.organization?._id) {
                        e.preventDefault();
                        console.error('No organization ID available');
                      }
                    }}
                    className="hover:text-purple-600 dark:hover:text-purple-400 hover:underline"
                  >
                    {selectedBursary.organization.title || selectedBursary.organization.name || 'Organization'}
                  </Link>
                </h3>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {selectedBursary.organization.contact?.website && (
                    <a 
                      href={selectedBursary.organization.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 flex items-center"
                    >
                      <GlobeAltIcon className="h-3.5 w-3.5 mr-1" />
                      Visit Website
                    </a>
                  )}
                  <Link 
                    href={selectedBursary.organization?._id ? `/organizations/${selectedBursary.organization._id}` : '#'}
                    onClick={(e) => {
                      if (!selectedBursary.organization?._id) {
                        e.preventDefault();
                        console.error('No organization ID available');
                      }
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
                  >
                    <BuildingOffice2Icon className="h-3.5 w-3.5 mr-1" />
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Bursary title and bookmark */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-purple-200/50 dark:border-purple-800/20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white pr-8">
                {selectedBursary.title}
              </h2>
              <div className="flex items-center space-x-2">
                {/* Show edit and delete buttons only if user owns the bursary */}
                {isOwnBursary(selectedBursary) && userRole === 'funder' && (
                  <>
                    <button 
                      onClick={(e) => handleEditBursary(e, selectedBursary._id)} 
                      className="p-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/40 text-indigo-700 dark:text-indigo-300 rounded transition-colors"
                      aria-label="Edit bursary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={(e) => handleDeleteBursary(e, selectedBursary._id)} 
                      className="p-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 text-red-700 dark:text-red-300 rounded transition-colors"
                      aria-label="Delete bursary"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </>
                )}
                <button 
                  onClick={(e) => toggleBookmark(e, selectedBursary._id)} 
                  className="text-gray-400 hover:text-purple-600 dark:text-gray-500 dark:hover:text-purple-400 transition-colors"
                  aria-label={isBookmarked(selectedBursary._id) ? "Remove from bookmarks" : "Add to bookmarks"}
                >
                  {isBookmarked(selectedBursary._id) ? (
                    <BookmarkSolidIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <BookmarkOutlineIcon className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Display success or error messages */}
            {deleteSuccess && (
              <div className="mb-4 p-2 bg-green-100 border border-green-300 text-green-800 rounded-md">
                {deleteSuccess}
              </div>
            )}
            
            {deleteError && (
              <div className="mb-4 p-2 bg-red-100 border border-red-300 text-red-800 rounded-md">
                {deleteError}
              </div>
            )}
            
            {/* Key details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/50 dark:bg-white/5 rounded-xl p-3 shadow-sm border border-purple-100/50 dark:border-purple-800/20">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Award Amount</p>
                <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(selectedBursary.awardAmount)}
                </p>
              </div>
              <div className="bg-white/50 dark:bg-white/5 rounded-xl p-3 shadow-sm border border-purple-100/50 dark:border-purple-800/20">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Application Deadline</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatDate(selectedBursary.deadline)}
                </p>
              </div>
            </div>
            
            {/* Description */}
            <div className="mb-6 p-4 bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-purple-100/50 dark:border-purple-800/20">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Description</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {selectedBursary.description}
              </p>
            </div>
            
            {/* Eligibility */}
            <div className="mb-6 p-4 bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-purple-100/50 dark:border-purple-800/20">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Eligibility</h3>
              <div className="space-y-3">
                {selectedBursary.academicLevel?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Academic Level:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedBursary.academicLevel.map((level) => (
                        <span 
                          key={level}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-xs text-blue-800 dark:text-blue-300 rounded-full capitalize"
                        >
                          {level}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedBursary.fieldOfStudy?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Field of Study:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedBursary.fieldOfStudy.map((field) => (
                        <span 
                          key={field}
                          className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-xs text-purple-800 dark:text-purple-300 rounded-full"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedBursary.eligibilityCriteria && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Additional Criteria:</p>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">
                      {selectedBursary.eligibilityCriteria}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Tags and metadata */}
            <div className="space-y-4 p-4 bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-purple-100/50 dark:border-purple-800/20">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Additional Information</h3>
              
              {/* AI Tags */}
              {selectedBursary.aiTags && selectedBursary.aiTags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">AI-Generated Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBursary.aiTags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-xs text-indigo-800 dark:text-indigo-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Financial Need Level */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Financial Need Level</h4>
                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-xs text-emerald-800 dark:text-emerald-300 rounded-full capitalize">
                  {selectedBursary.financialNeedLevel || 'Medium'}
                </span>
              </div>
            </div>
            
            {/* Apply button */}
            {canApply() && (
              <div className="mt-6">
                <a
                  href={selectedBursary.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block text-center px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white font-medium rounded-lg shadow-sm transition-colors"
                >
                  Apply Now
                </a>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Add Bursary Modal */}
      <AddBursaryModal 
        isOpen={isAddBursaryModalOpen}
        onClose={() => setIsAddBursaryModalOpen(false)}
        setBursaries={setBursaries}
        setFilteredBursaries={setFilteredBursaries}
        setNewlyAddedBursaryId={setNewlyAddedBursaryId}
      />
    </div>
  );
} 