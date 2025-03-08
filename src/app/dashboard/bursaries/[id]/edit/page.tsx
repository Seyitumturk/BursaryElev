"use client";

import React, { useState, useRef, FormEvent, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ChevronDownIcon, 
  DocumentPlusIcon, 
  ArrowUpTrayIcon, 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon, 
  AcademicCapIcon, 
  ClipboardDocumentCheckIcon, 
  PlusIcon,
  CheckCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

// COMPLETELY SIMPLIFIED VERSION - NO FANCY FEATURES

// Sample field of study options
const FIELD_OF_STUDY_OPTIONS = [
  "Engineering", "Computer Science", "Business", "Medicine", "Law", 
  "Arts", "Humanities", "Social Sciences", "Natural Sciences", 
  "Education", "Mathematics", "Other",
];

// Sample academic level options
const ACADEMIC_LEVEL_OPTIONS = [
  "undergraduate", "graduate", "phd", "postdoctoral",
];

// Financial need level options with icons
const FINANCIAL_NEED_OPTIONS = [
  { value: "low", label: "Low", description: "Some financial need" },
  { value: "medium", label: "Medium", description: "Moderate financial need" },
  { value: "high", label: "High", description: "Significant financial need" },
];

const EditBursaryPage = () => {
  const router = useRouter();
  const params = useParams();
  const bursaryId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eligibilityCriteria: "",
    applicationUrl: "",
    deadline: "",
    awardAmount: "",
    fieldOfStudy: [] as string[],
    academicLevel: [] as string[],
    financialNeedLevel: "medium",
    requiredDocuments: [] as string[],
  });
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{
    fileUrl: string;
    fileName: string;
    fileType: string;
    uploadDate: string;
  }[]>([]);
  
  // Auto-resize refs for textareas
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const eligibilityRef = useRef<HTMLTextAreaElement>(null);
  
  // Adjust textarea height based on content
  const autoResizeTextarea = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;
    
    // Reset height to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set the height to match the content (scrollHeight)
    const newHeight = Math.min(textarea.scrollHeight, 400); // Max height of 400px
    textarea.style.height = `${newHeight}px`;
  };
  
  // Handle textarea input to auto-resize
  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    autoResizeTextarea(e.currentTarget);
  };
  
  // Resize textareas when formData changes
  useEffect(() => {
    autoResizeTextarea(descriptionRef.current);
    autoResizeTextarea(eligibilityRef.current);
  }, [formData.description, formData.eligibilityCriteria]);
  
  // Fetch bursary data on component mount
  useEffect(() => {
    console.log("Params object:", params);
    console.log("Extracted bursaryId:", bursaryId);
    
    const fetchBursary = async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        
        const response = await fetch(`/api/bursaries/${bursaryId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch bursary details');
        }
        
        const bursaryData = await response.json();
        
        // Format the date for the form
        const deadlineDate = new Date(bursaryData.deadline);
        const formattedDeadline = deadlineDate.toISOString().split('T')[0];
        
        // Update form data with bursary details
        setFormData({
          title: bursaryData.title || "",
          description: bursaryData.description || "",
          eligibilityCriteria: bursaryData.eligibilityCriteria || "",
          applicationUrl: bursaryData.applicationUrl || "",
          deadline: formattedDeadline || "",
          awardAmount: String(bursaryData.awardAmount) || "",
          fieldOfStudy: bursaryData.fieldOfStudy || [],
          academicLevel: bursaryData.academicLevel || [],
          financialNeedLevel: bursaryData.financialNeedLevel || "medium",
          requiredDocuments: bursaryData.requiredDocuments || [],
        });
      } catch (error) {
        console.error('Error fetching bursary:', error);
        setLoadError('Failed to load bursary details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (bursaryId) {
      fetchBursary();
    }
  }, [bursaryId]);
  
  // Toggle a field of study selection
  const toggleFieldOfStudy = (field: string) => {
    setFormData(prev => {
      if (prev.fieldOfStudy.includes(field)) {
        return { ...prev, fieldOfStudy: prev.fieldOfStudy.filter(f => f !== field) };
      } else {
        return { ...prev, fieldOfStudy: [...prev.fieldOfStudy, field] };
      }
    });
  };
  
  // Toggle an academic level selection
  const toggleAcademicLevel = (level: string) => {
    setFormData(prev => {
      if (prev.academicLevel.includes(level)) {
        return { ...prev, academicLevel: prev.academicLevel.filter(l => l !== level) };
      } else {
        return { ...prev, academicLevel: [...prev.academicLevel, level] };
      }
    });
  };
  
  // Set financial need level
  const setFinancialNeedLevel = (level: string) => {
    setFormData(prev => ({ ...prev, financialNeedLevel: level }));
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // In a real app, you'd upload these files to a storage service
    // This is just a simplified simulation
    const newFiles = Array.from(files).map(file => ({
      fileUrl: URL.createObjectURL(file),
      fileName: file.name,
      fileType: file.type,
      uploadDate: new Date().toISOString()
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");
      
      // Validate form data
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }
      if (!formData.description.trim()) {
        throw new Error("Description is required");
      }
      if (!formData.deadline) {
        throw new Error("Application deadline is required");
      }
      if (!formData.awardAmount || isNaN(Number(formData.awardAmount))) {
        throw new Error("Valid award amount is required");
      }
      
      // Create request payload
      const payload = {
        ...formData,
        awardAmount: Number(formData.awardAmount),
      };
      
      // Send PUT request to update bursary
      const response = await fetch(`/api/bursaries/${bursaryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error("API error:", data);
        throw new Error(data.error || "Failed to update bursary. Please try again.");
      }
      
      // Show success message
      setSuccessMessage("Bursary updated successfully!");
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/dashboard/bursaries");
      }, 2000);
    } catch (error) {
      console.error("Error updating bursary:", error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6 max-w-md">
          <p>{loadError}</p>
        </div>
        <Link 
          href="/dashboard/bursaries"
          className="inline-flex items-center text-purple-600 hover:text-purple-800"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Bursaries
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link 
            href="/dashboard/bursaries"
            className="inline-flex items-center text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Bursaries
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Edit Bursary</h1>
        </div>
        
        {/* Update & Cancel Buttons - Moved to top */}
        <div className="flex items-center">
          <Link
            href="/dashboard/bursaries"
            className="mr-4 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors shadow-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="bursaryEditForm"
            disabled={isSubmitting}
            className="inline-flex justify-center items-center px-5 py-2.5 border border-transparent rounded-xl text-base font-medium text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              "Update Bursary"
            )}
          </button>
        </div>
        
        {/* Success/Error Messages as Floating Notifications */}
        {(errorMessage || successMessage) && (
          <div className="fixed top-4 right-4 z-50 max-w-md">
            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm mb-2 animate-fadeIn">
                {errorMessage}
              </div>
            )}
            
            {successMessage && (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm animate-fadeIn">
                {successMessage}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-white/90 dark:bg-gray-800/60 shadow-lg rounded-2xl border border-purple-100/50 dark:border-purple-900/30 p-8 backdrop-blur-md overflow-hidden">
        <form 
          id="bursaryEditForm"
          ref={formRef} 
          onSubmit={handleSubmit} 
          className="space-y-8 max-h-[75vh] overflow-y-auto modern-scrollbar pr-4"
        >
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-5 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bursary Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:text-white backdrop-blur-sm py-3 px-4 text-base"
                  placeholder="Enter the title of your bursary"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  ref={descriptionRef}
                  value={formData.description}
                  onChange={handleChange}
                  onInput={handleTextareaInput}
                  rows={3}
                  className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:text-white backdrop-blur-sm py-3 px-4 text-base transition-all duration-200 resize-none max-h-[400px] overflow-auto"
                  placeholder="Provide a detailed description of the bursary"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="eligibilityCriteria" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Eligibility Criteria
                </label>
                <textarea
                  id="eligibilityCriteria"
                  name="eligibilityCriteria"
                  ref={eligibilityRef}
                  value={formData.eligibilityCriteria}
                  onChange={handleChange}
                  onInput={handleTextareaInput}
                  rows={2}
                  className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:text-white backdrop-blur-sm py-3 px-4 text-base transition-all duration-200 resize-none max-h-[300px] overflow-auto"
                  placeholder="List all eligibility requirements for applicants"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="applicationUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Application URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  id="applicationUrl"
                  name="applicationUrl"
                  value={formData.applicationUrl}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:text-white backdrop-blur-sm py-3 px-4 text-base"
                  placeholder="https://example.com/apply"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Financial Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-5 flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
              Financial Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Application Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:text-white backdrop-blur-sm py-3 px-4 text-base"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="awardAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Award Amount ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="awardAmount"
                  name="awardAmount"
                  value={formData.awardAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:text-white backdrop-blur-sm py-3 px-4 text-base"
                  placeholder="5000"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Financial Need Level
                </label>
                <div className="flex space-x-4">
                  {FINANCIAL_NEED_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFinancialNeedLevel(option.value)}
                      className={`flex items-center px-5 py-3 rounded-xl border-2 ${
                        formData.financialNeedLevel === option.value
                          ? 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/40 dark:border-purple-700 dark:text-purple-300'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                      } transition-colors text-base border-solid`}
                    >
                      {formData.financialNeedLevel === option.value ? (
                        <CheckCircleSolidIcon className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <CheckCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
                      )}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {FINANCIAL_NEED_OPTIONS.find(o => o.value === formData.financialNeedLevel)?.description}
                </p>
              </div>
            </div>
          </div>
          
          {/* Academic Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-5 flex items-center">
              <AcademicCapIcon className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
              Academic Details
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Fields of Study
                </label>
                <div className="flex flex-wrap gap-3">
                  {FIELD_OF_STUDY_OPTIONS.map(field => (
                    <button
                      key={field}
                      type="button"
                      onClick={() => toggleFieldOfStudy(field)}
                      className={`inline-flex items-center px-4 py-2.5 rounded-full text-base border ${
                        formData.fieldOfStudy.includes(field)
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-700'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                      } transition-colors border-solid`}
                    >
                      {formData.fieldOfStudy.includes(field) ? (
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                      ) : (
                        <PlusIcon className="h-5 w-5 mr-2" />
                      )}
                      {field}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Academic Level
                </label>
                <div className="flex flex-wrap gap-3">
                  {ACADEMIC_LEVEL_OPTIONS.map(level => {
                    const displayName = level.charAt(0).toUpperCase() + level.slice(1);
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => toggleAcademicLevel(level)}
                        className={`inline-flex items-center px-4 py-2.5 rounded-full text-base border ${
                          formData.academicLevel.includes(level)
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-700'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                        } transition-colors border-solid`}
                      >
                        {formData.academicLevel.includes(level) ? (
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                        ) : (
                          <PlusIcon className="h-5 w-5 mr-2" />
                        )}
                        {displayName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Required Documents */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-5 flex items-center">
              <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
              Required Documents
            </h2>
            <div className="bg-purple-50/50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800/30">
              <div className="flex flex-wrap gap-3">
                {[
                  "Transcript", "Resume/CV", "Personal Statement", 
                  "Recommendation Letter", "Financial Documents",
                  "Proof of Enrollment", "Portfolio"
                ].map(doc => (
                  <button
                    key={doc}
                    type="button"
                    onClick={() => {
                      const updatedDocs = formData.requiredDocuments.includes(doc)
                        ? formData.requiredDocuments.filter(d => d !== doc)
                        : [...formData.requiredDocuments, doc];
                      setFormData({...formData, requiredDocuments: updatedDocs});
                    }}
                    className={`inline-flex items-center px-4 py-2.5 rounded-full text-base border-2 ${
                      formData.requiredDocuments.includes(doc)
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/30'
                        : 'bg-white/70 text-gray-700 dark:bg-gray-800/70 dark:text-gray-300 border-gray-200 dark:border-gray-700/30'
                    } transition-colors border-solid`}
                  >
                    {formData.requiredDocuments.includes(doc) ? (
                      <>
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        {doc}
                        <XMarkIcon 
                          className="h-5 w-5 ml-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData({
                              ...formData, 
                              requiredDocuments: formData.requiredDocuments.filter(d => d !== doc)
                            });
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-5 w-5 mr-2" />
                        {doc}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBursaryPage;

const customStyles = `
.modern-scrollbar::-webkit-scrollbar,
textarea::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.modern-scrollbar::-webkit-scrollbar-track,
textarea::-webkit-scrollbar-track {
  background: rgba(247, 250, 252, 0.3);
  border-radius: 10px;
}

.modern-scrollbar::-webkit-scrollbar-thumb,
textarea::-webkit-scrollbar-thumb {
  background: rgba(160, 174, 192, 0.5);
  border-radius: 10px;
}

.modern-scrollbar::-webkit-scrollbar-thumb:hover,
textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(113, 128, 150, 0.7);
}

/* For Firefox */
.modern-scrollbar,
textarea {
  scrollbar-width: thin;
  scrollbar-color: rgba(160, 174, 192, 0.5) rgba(247, 250, 252, 0.3);
}

/* Auto-expanding text area specific styles */
textarea.resize-none {
  transition: height 0.2s ease;
  min-height: 60px;
  line-height: 1.5;
  overflow-y: hidden;
}

textarea.resize-none:focus {
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
}

textarea.resize-none.overflow-auto {
  overflow-y: auto;
}

/* Fix for input borders */
input, textarea, select {
  border-width: 1px !important;
  border-style: solid !important;
}
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = customStyles;
  document.head.appendChild(style);
} 