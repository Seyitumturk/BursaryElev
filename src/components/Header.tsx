"use client";

import { useState, useEffect } from "react";
import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { SunIcon, MoonIcon, BellIcon, PlusCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Modal component for adding bursaries
function AddBursaryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
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
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("FORM SUBMISSION ERROR:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
      console.log("======= MODAL FORM SUBMISSION COMPLETED =======");
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto p-0" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            <PlusCircleIcon className="h-6 w-6 mr-2 text-purple-600" />
            Add New Bursary
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              <strong>Success!</strong> {success}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bursary Title</label>
                  <input 
                    type="text" 
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter the title of your bursary" 
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea 
                    rows={4} 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the bursary and eligibility requirements" 
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application URL</label>
                  <input 
                    type="url" 
                    name="applicationUrl"
                    value={formData.applicationUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/apply" 
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Financial Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Financial Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Award Amount</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">$</span>
                    <input 
                      type="number" 
                      name="awardAmount"
                      value={formData.awardAmount}
                      onChange={handleChange}
                      placeholder="0.00" 
                      className="w-full pl-8 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Deadline</label>
                  <input 
                    type="date" 
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Eligibility Criteria */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Eligibility Criteria</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Eligibility Criteria</label>
                  <textarea 
                    rows={3} 
                    name="eligibilityCriteria"
                    value={formData.eligibilityCriteria}
                    onChange={handleChange}
                    placeholder="Describe who is eligible for this bursary" 
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Field of Study</label>
                  <select 
                    multiple 
                    name="fieldOfStudy"
                    value={formData.fieldOfStudy}
                    onChange={handleMultiSelectChange}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business</option>
                    <option value="Arts">Arts & Humanities</option>
                    <option value="Medicine">Medicine & Health Sciences</option>
                    <option value="Other">Other</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple fields</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Academic Level</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Undergraduate', 'Graduate', 'PhD', 'Postdoctoral'].map((level) => (
                      <label key={level} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={formData.academicLevel.includes(level)}
                          onChange={(e) => handleCheckboxChange(level, e.target.checked)}
                          className="rounded text-purple-600 focus:ring-purple-500" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Financial Need Level</label>
                  <select
                    name="financialNeedLevel"
                    value={formData.financialNeedLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
              >
                {isSubmitting ? "Submitting..." : "Submit Bursary"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const { user } = useUser();
  // Get role from Clerk metadata
  const clerkRole = user?.publicMetadata?.role as string | null;
  const [localRole, setLocalRole] = useState<string | null>(null);
  const [mongoDbRole, setMongoDbRole] = useState<string | null>(null);

  // Theme state and toggle logic
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(0);

  // Fetch user role from MongoDB
  useEffect(() => {
    async function fetchUserRole() {
      if (user) {
        try {
          const response = await fetch(`/api/users/current`);
          if (response.ok) {
            const userData = await response.json();
            setMongoDbRole(userData.role);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    }

    fetchUserRole();
  }, [user]);

  // Check multiple sources for user role
  useEffect(() => {
    // Get role from localStorage as fallback
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('userRole');
      setLocalRole(storedRole);
    }
  }, []);

  // Determine if user is organization or funder using multiple sources
  const isOrganization = (() => {
    const effectiveRole = clerkRole || mongoDbRole || localRole;
    return effectiveRole === "organization" || effectiveRole === "funder";
  })();

  // Remove the debug flag that forces showing the button
  const forceShowButton = false;

  useEffect(() => {
    // Log role to console for debugging
    console.log("--- USER ROLE DEBUG INFO ---");
    console.log("Clerk Role:", clerkRole);
    console.log("MongoDB Role:", mongoDbRole);
    console.log("Local Storage Role:", localRole);
    console.log("User Object:", user);
    console.log("Is Organization or Funder:", isOrganization);
    console.log("---------------------------");

    // Check localStorage first
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    } else {
      // If no stored preference, check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", prefersDark);
    }

    // Simulate notifications (remove in production)
    const randomNotifications = Math.floor(Math.random() * 5);
    setNotifications(randomNotifications);
  }, [clerkRole, localRole, user, isOrganization, mongoDbRole]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <>
      <header className="bg-[var(--sidebar-bg)]/80 dark:bg-[var(--sidebar-bg)] shadow-md backdrop-blur-md px-5 py-3 flex items-center justify-between rounded-xl mx-4 mt-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white font-sans flex items-center gap-2">
            {user ? (user.firstName || user.fullName) : "Welcome"}
            {(clerkRole || mongoDbRole || localRole) && (
              <span className="text-xs font-medium px-2 py-1 bg-white/30 dark:bg-[#c83c34]/80 rounded-full text-gray-600 dark:text-white">
                {clerkRole || mongoDbRole || localRole}
              </span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
          </div>
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all ${
              theme === "light" 
                ? "bg-gray-800 hover:bg-gray-700 text-white" 
                : "bg-white hover:bg-gray-100 text-gray-800"
            }`}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <MoonIcon className="h-6 w-6" />
            ) : (
              <SunIcon className="h-6 w-6" />
            )}
          </button>
          
          <SignedIn>
            <div className="border-l border-gray-200 dark:border-gray-700 h-8 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.fullName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
              <UserButton />
            </div>
          </SignedIn>
          <SignedOut>
            <Link 
              href="/sign-in" 
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              Sign In
            </Link>
            <Link 
              href="/sign-up" 
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all shadow-sm hover:shadow-md"
            >
              Register
            </Link>
          </SignedOut>
        </div>
      </header>
    </>
  );
} 