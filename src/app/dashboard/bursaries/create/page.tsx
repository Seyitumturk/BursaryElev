"use client";

import React, { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, DocumentPlusIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";

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

const CreateBursaryPage = () => {
  const router = useRouter();
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
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{
    fileUrl: string;
    fileName: string;
    fileType: string;
    uploadDate: string;
  }[]>([]);
  
  // SIMPLE FILE SELECTION
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Create a temporary file object (no server upload)
    const fileObject = {
      fileUrl: "#", // Placeholder URL
      fileName: file.name,
      fileType: file.type,
      uploadDate: new Date().toISOString(),
    };
    
    setUploadedFiles(prev => [...prev, fileObject]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // SIMPLE FILE REMOVAL
  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle multi-select fields
  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name } = e.target;
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({ ...prev, [name]: selectedOptions }));
  };
  
  // DIRECT SUBMISSION WITHOUT REDIRECTS OR COMPLEX LOGIC
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("======= FORM SUBMISSION STARTED =======");
    
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    
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
        documents: uploadedFiles,
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
      
      console.log("RECEIVED RESPONSE:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("ERROR RESPONSE:", errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log("SUCCESS! CREATED BURSARY:", result);
      
      // Show success message
      setSuccessMessage(`Bursary "${formData.title}" was successfully created with ID: ${result._id}`);
      
      // Reset form
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
        requiredDocuments: [],
      });
      setUploadedFiles([]);
      
      // Store the new bursary ID in sessionStorage to highlight it on the listing page
      sessionStorage.setItem('newlyAddedBursaryId', result._id);
      
      // Redirect to the bursaries listing page after a brief delay to show success message
      setTimeout(() => {
        router.push('/dashboard/bursaries');
      }, 1500);
    } catch (error) {
      console.error("FORM SUBMISSION ERROR:", error);
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
      console.log("======= FORM SUBMISSION COMPLETED =======");
    }
  };
  
  // TEST API CONNECTION - DIRECT METHOD
  const testApiConnection = async () => {
    try {
      console.log("TESTING API CONNECTION...");
      const origin = window.location.origin;
      const response = await fetch(`${origin}/api/bursaries`, {
        method: "GET",
        credentials: "include",
      });
      
      console.log("TEST RESPONSE STATUS:", response.status);
      const data = await response.json();
      console.log("TEST RESPONSE DATA:", data);
      
      alert(`API test successful. Status: ${response.status}, Found ${data.length} bursaries`);
    } catch (error) {
      console.error("API TEST ERROR:", error);
      alert(`API test failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Bursary</h1>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <strong>Success!</strong> {successMessage}
          </div>
        )}
        
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
              required
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
              required
            />
          </div>
          
          {/* Application URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="applicationUrl"
              value={formData.applicationUrl}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
              required
            />
          </div>
          
          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                required
              />
            </div>
            
            {/* Award Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Award Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="awardAmount"
                value={formData.awardAmount}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          
          {/* Eligibility Criteria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Eligibility Criteria
            </label>
            <textarea
              name="eligibilityCriteria"
              value={formData.eligibilityCriteria}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
            />
          </div>
          
          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Field of Study */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field of Study
              </label>
              <select
                name="fieldOfStudy"
                multiple
                value={formData.fieldOfStudy}
                onChange={handleMultiSelectChange}
                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 h-32"
              >
                {FIELD_OF_STUDY_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>
            
            {/* Academic Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Level
              </label>
              <select
                name="academicLevel"
                multiple
                value={formData.academicLevel}
                onChange={handleMultiSelectChange}
                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 h-32"
              >
                {ACADEMIC_LEVEL_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>
          </div>
          
          {/* Financial Need Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Financial Need Level
            </label>
            <select
              name="financialNeedLevel"
              value={formData.financialNeedLevel}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          {/* Document Upload */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium mb-4">Documents</h2>
            
            <div className="mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center border border-gray-300 rounded-md shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <ArrowUpTrayIcon className="h-5 w-5 mr-2 text-gray-500" />
                Upload Document
              </button>
            </div>
            
            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2 mb-4">
                <h3 className="text-sm font-medium">Uploaded Files:</h3>
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {uploadedFiles.map((file, index) => (
                    <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <DocumentPlusIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                        <span className="ml-2 flex-1 w-0 truncate">{file.fileName}</span>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="font-medium text-red-600 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Form Actions */}
          <div className="pt-5 mt-6 border-t border-gray-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard/bursaries")}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? "Saving..." : "Create Bursary"}
            </button>
          </div>
        </form>
        
        {/* Direct Debug Tools */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Tools</h3>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={testApiConnection}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Test API Connection
            </button>
            <button
              type="button"
              onClick={() => {
                console.log("Current form data:", formData);
                console.log("Uploaded files:", uploadedFiles);
                alert("Form data logged to console");
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Log Form Data
            </button>
            <button
              type="button"
              onClick={() => {
                const dummyData = {
                  title: "Test Bursary " + new Date().toISOString(),
                  description: "This is a test bursary created via the debug button",
                  applicationUrl: "https://example.com/apply",
                  deadline: new Date().toISOString(),
                  awardAmount: 1000,
                  eligibilityCriteria: "Test criteria",
                  fieldOfStudy: ["Computer Science"],
                  academicLevel: ["undergraduate"],
                  financialNeedLevel: "medium"
                };
                
                setFormData({
                  ...formData,
                  title: dummyData.title,
                  description: dummyData.description,
                  applicationUrl: dummyData.applicationUrl,
                  deadline: dummyData.deadline.split('T')[0], // Just the date part
                  awardAmount: dummyData.awardAmount.toString(),
                  eligibilityCriteria: dummyData.eligibilityCriteria,
                  fieldOfStudy: dummyData.fieldOfStudy,
                  academicLevel: dummyData.academicLevel,
                  financialNeedLevel: dummyData.financialNeedLevel
                });
                
                alert("Form filled with test data");
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Fill Test Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBursaryPage; 