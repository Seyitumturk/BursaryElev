"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent, useRef } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { 
  BriefcaseIcon, TagIcon, DocumentTextIcon, StarIcon,
  BuildingOffice2Icon, BookOpenIcon, AcademicCapIcon, SparklesIcon, 
  ChatBubbleLeftEllipsisIcon, GlobeAltIcon, PhoneIcon, EnvelopeIcon,
  MapPinIcon, PencilSquareIcon, CheckIcon, XMarkIcon, CurrencyDollarIcon
} from "@heroicons/react/24/outline";
import { toast } from 'react-hot-toast';
import ProfileSummary from "@/components/ProfileSummary";

// Format the AI summary text with proper bullet points
const formattedSummaryText = (text: string) => {
  if (!text) return '';
  
  // Split by double newlines to get paragraphs
  const paragraphs = text.split('\n\n');
  
  return (
    <div className="formatted-summary">
      {paragraphs.map((paragraph, idx) => {
        // Check if it's a section heading (ends with colon)
        if (paragraph.trim().endsWith(':')) {
          return (
            <h3 key={idx} className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
              {paragraph}
            </h3>
          );
        }
        
        // Check if it's a list (contains items that start with -)
        if (paragraph.includes('\n- ')) {
          const listItems = paragraph.split('\n- ');
          const title = listItems.shift(); // First part before the list
          
          return (
            <div key={idx} className="mb-3">
              {title && <p className="mb-2">{title}</p>}
              <ul className="space-y-1 pl-1">
                {listItems.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 dark:bg-[var(--light-brown-1)] mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>{item.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        
        // Regular paragraph
        return <p key={idx} className="mb-3">{paragraph}</p>;
      })}
    </div>
  );
};

// Add CSS keyframes for the gradient animation
const gradientAnimation = `
  @keyframes gradient-x {
    0% {
      background-position: 0% 50%;
    }
    25% {
      background-position: 50% 100%;
    }
    50% {
      background-position: 100% 50%;
    }
    75% {
      background-position: 50% 0%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  .animate-gradient-x {
    background-size: 300% 300%;
    animation: gradient-x 12s ease infinite;
    background-image: linear-gradient(
      -45deg,
      rgba(238, 119, 82, 0.8),
      rgba(231, 60, 126, 0.8),
      rgba(35, 166, 213, 0.8),
      rgba(35, 213, 171, 0.8)
    );
  }
`;

interface Profile {
  _id?: string;
  // Common fields
  user?: string;
  
  // Student profile fields
  institution?: string;
  major?: string;
  graduationYear?: string;
  interests?: string[];
  bio?: string;
  skills?: string[];
  languages?: string[];
  achievements?: string[];
  financialBackground?: string;
  careerGoals?: string;
  locationPreferences?: string[];
  
  // Organization profile fields
  name?: string;
  title?: string;
  description?: string;
  about?: string;
  category?: string;
  mission?: string;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
    province?: string;
    city?: string;
    postalCode?: string;
    officeNumber?: string;
    alternativePhone?: string;
    website?: string;
    socialMedia?: {
      twitter?: string;
      facebook?: string;
      linkedin?: string;
    };
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  // New funding fields
  targetDemographics?: string[];
  fundingAmount?: string;
  applicationDeadlines?: string;
  scholarshipTypes?: string[];
  eligibilityCriteria?: string[];
  fundingHistory?: string;
  successStories?: string;
  status?: "pending" | "active";
}

export default function ProfilePage() {
  // Retrieve the logged-in user from Clerk
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editableProfile, setEditableProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("about");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State to store the role from the API (if fetched)
  const [dbRole, setDbRole] = useState("");

  // Determine the effective role: API role (if available) or fallback from Clerk
  const roleFromClerk = (user && user.publicMetadata) ? user.publicMetadata.role : "student";
  const effectiveRole = dbRole || roleFromClerk;

  // Create a form reference for the entire profile form
  const formRef = useRef<HTMLFormElement>(null);

  // Add gradient animation styles to the document
  useEffect(() => {
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.innerHTML = gradientAnimation;
    document.head.appendChild(styleElement);
    
    // Cleanup on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await res.json();
        setProfile(data.profile);
        setEditableProfile(data.profile ? {...data.profile} : null);
        if(data.role) {
          setDbRole(data.role);
          // Store role in localStorage for other components to use
          localStorage.setItem('userRole', data.role);
        }

        // Store organization ID in localStorage if user is org/funder
        if (data.profile && (data.role === 'organization' || data.role === 'funder') && data.profile._id) {
          localStorage.setItem('userOrgId', data.profile._id);
        }
      } catch (err: Error | unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setProfileLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing, revert to original data
      setEditableProfile(profile ? {...profile} : null);
      setIsEditing(false);
    } else {
      // Enter edit mode with a fresh copy of profile data
      setEditableProfile(profile ? {...profile} : null);
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }
    
    if (!formRef.current || !editableProfile) return;
    
    setIsSaving(true);

    try {
      // Get the current form data directly from the form fields
      const formData = new FormData(formRef.current);
      
      // Create a profile object that matches the schema structure
      const profileToSave = {...editableProfile};
      
      // Clear the contact object to start fresh with form data
      if (activeTab === "contact") {
        profileToSave.contact = {};
      }
      
      // Process all form fields
      formData.forEach((value, key) => {
        if (key.startsWith('contact.socialMedia.')) {
          const platform = key.split('.')[2];
          if (!profileToSave.contact) profileToSave.contact = {};
          if (!profileToSave.contact.socialMedia) profileToSave.contact.socialMedia = {};
          // Type-safe way to set social media fields
          if (platform === 'twitter' || platform === 'facebook' || platform === 'linkedin') {
            profileToSave.contact.socialMedia[platform] = value as string;
          }
        }
        else if (key.startsWith('contact.')) {
          const field = key.split('.')[1];
          if (!profileToSave.contact) profileToSave.contact = {};
          // Set the contact field in a type-safe way
          profileToSave.contact = {
            ...profileToSave.contact,
            [field]: value as string
          };
        }
        else {
          // For regular fields, use a type assertion
          let fieldValue = value as string;
          
          // Handle array fields (comma-separated strings)
          if (effectiveRole === "student" && 
              (key === "interests" || key === "skills" || key === "languages" || 
               key === "achievements" || key === "locationPreferences")) {
            // Convert comma-separated string to array and trim whitespace
            if (fieldValue && fieldValue.trim()) {
              (profileToSave as any)[key] = fieldValue.split(',').map(item => item.trim()).filter(item => item);
            } else {
              (profileToSave as any)[key] = [];
            }
          } 
          // Handle organization array fields
          else if (effectiveRole === "funder" && 
                  (key === "targetDemographics" || key === "scholarshipTypes" || 
                   key === "eligibilityCriteria")) {
            // Convert comma-separated string to array and trim whitespace
            if (fieldValue && fieldValue.trim()) {
              (profileToSave as any)[key] = fieldValue.split(',').map(item => item.trim()).filter(item => item);
            } else {
              (profileToSave as any)[key] = [];
            }
          }
          else {
            (profileToSave as any)[key] = fieldValue;
          }
        }
      });
      
      console.log("SAVING PROFILE DATA:", JSON.stringify(profileToSave, null, 2));
      
      // Ensure all required array fields are present for student profiles
      if (effectiveRole === "student") {
        profileToSave.interests = profileToSave.interests || [];
        profileToSave.skills = profileToSave.skills || [];
        profileToSave.languages = profileToSave.languages || [];
        profileToSave.achievements = profileToSave.achievements || [];
        profileToSave.locationPreferences = profileToSave.locationPreferences || [];
      }
      
      // Ensure all required array fields are present for organization profiles
      if (effectiveRole === "funder") {
        profileToSave.targetDemographics = profileToSave.targetDemographics || [];
        profileToSave.scholarshipTypes = profileToSave.scholarshipTypes || [];
        profileToSave.eligibilityCriteria = profileToSave.eligibilityCriteria || [];
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileToSave),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      const data = await response.json();
      console.log("PROFILE UPDATE RESPONSE:", JSON.stringify(data, null, 2));
      
      // Update the profile state with the saved data
      setProfile(data.profile);
      setEditableProfile(data.profile);
      setIsEditing(false);
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
      setActiveTab("profile");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-gray-200 h-24 w-24 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  // Compute user's full name using firstName and lastName if available
  const fullName = (user.firstName && user.lastName) 
                    ? `${user.firstName} ${user.lastName}` 
                    : (user.firstName || user.fullName || "");
  const initials = fullName ? fullName.split(" ").map((name) => name[0]).join("").toUpperCase() : "";

  // Use user's avatar if available; otherwise fallback to a placeholder
  const avatarUrl = user.imageUrl || "";
  const email = user.primaryEmailAddress?.emailAddress || "";

  const profileCompletion = () => {
    if (!profile) return 0;
    
    let totalFields = 0;
    let completedFields = 0;
    
    if (effectiveRole === "student") {
      totalFields = 11; // Updated total field count for student profile
      if (profile.institution) completedFields++;
      if (profile.major) completedFields++;
      if (profile.graduationYear) completedFields++;
      if (profile.interests && profile.interests.length > 0) completedFields++;
      if (profile.bio) completedFields++;
      // Added missing student fields
      if (profile.skills && profile.skills.length > 0) completedFields++;
      if (profile.languages && profile.languages.length > 0) completedFields++;
      if (profile.achievements && profile.achievements.length > 0) completedFields++;
      if (profile.financialBackground) completedFields++;
      if (profile.careerGoals) completedFields++;
      if (profile.locationPreferences && profile.locationPreferences.length > 0) completedFields++;
    } else {
      // Organization profile basic fields
      totalFields = 5; // name, title, category, about, mission
      if (profile.name) completedFields++;
      if (profile.title) completedFields++;
      if (profile.category) completedFields++;
      if (profile.about) completedFields++;
      if (profile.mission) completedFields++;
      
      // Contact fields
      if (profile.contact) {
        totalFields += 5; // Basic contact fields
        if (profile.contact.email) completedFields++;
        if (profile.contact.officeNumber) completedFields++;
        if (profile.contact.address) completedFields++;
        if (profile.contact.city) completedFields++;
        if (profile.contact.website) completedFields++;
      }
    }
    
    return Math.round((completedFields / totalFields) * 100);
  };

  // A function to display array values in the profile
  const displayArrayValue = (array?: string[]) => {
    if (!array || array.length === 0) return "Not specified";
    return array.join(', ');
  };

  // Updated function to display array values in a modern format with bullets
  const displayArrayValueModern = (array?: string[]) => {
    if (!array || array.length === 0) return "Not specified";
    return (
      <ul className="mt-2 space-y-1">
        {array.map((item, index) => (
          <li key={index} className="flex items-start">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 dark:bg-[var(--light-brown-1)] mt-1.5 mr-2 flex-shrink-0"></span>
            <span className="text-gray-700 dark:text-gray-300">{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  // Simple field component using defaultValue instead of value for better typing performance
  const EditableField = ({ 
    label, 
    value, 
    fieldName, 
    isTextarea = false,
    readOnly = false,
    isArray = false
  }: { 
    label: string, 
    value: string | undefined, 
    fieldName: string,
    isTextarea?: boolean,
    readOnly?: boolean,
    isArray?: boolean
  }) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        {isEditing ? (
          isTextarea ? (
            <textarea
              name={fieldName}
              defaultValue={value || ''}
              readOnly={readOnly}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-[#3d2a20] dark:text-white p-3 text-base"
            />
          ) : (
            isArray ? (
              displayArrayValueModern(value?.split(', '))
            ) : (
              <input
                type="text"
                name={fieldName}
                defaultValue={value || ''}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-[#3d2a20] dark:text-white p-3 h-12 text-base"
              />
            )
          )
        ) : (
          isArray ? (
            displayArrayValueModern(value?.split(', '))
          ) : (
            <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-line">{value || "Not specified"}</p>
          )
        )}
      </div>
    );
  };

  // Simple SocialMediaInput component using defaultValue
  const SocialMediaInput = ({
    platform,
    value,
    placeholder,
    isEditing
  }: {
    platform: string;
    value: string | undefined;
    placeholder: string;
    isEditing: boolean;
  }) => {
    return isEditing ? (
      <input
        type="text"
        name={`contact.socialMedia.${platform}`}
        defaultValue={value || ''}
        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-[#3d2a20] dark:text-white p-3 h-12 text-base"
        placeholder={placeholder}
      />
    ) : (
      <p className="mt-1 text-gray-900 dark:text-white">{value || "Not specified"}</p>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-[#3d2a20] h-full overflow-y-auto">
      {/* Animated Gradient Cover */}
      <div className="relative w-full h-48 overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(-45deg, #ff6600, #ff0066, #3399ff, #00cc99)',
          backgroundSize: '300% 300%',
          animation: 'gradient-x 8s ease infinite'
        }}></div>
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h20v20H0z" fill="%23ffffff" fill-opacity="0.5"/%3E%3Cpath d="M10 10l10 10H0z" fill="%23ffffff" fill-opacity="0.7"/%3E%3C/svg%3E")', backgroundSize: '20px 20px' }}></div>
        
        {/* Additional grid patterns */}
        <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" xmlns="http://www.w3.org/2000/svg"%3E%3Crect x="5" y="5" width="10" height="10" fill="%23ffffff" fill-opacity="0.15"/%3E%3Crect x="25" y="25" width="10" height="10" fill="%23ffffff" fill-opacity="0.15"/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }}></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Crect x="15" y="15" width="5" height="5" fill="%23ffffff" fill-opacity="0.25"/%3E%3Crect x="45" y="15" width="5" height="5" fill="%23ffffff" fill-opacity="0.25"/%3E%3Crect x="15" y="45" width="5" height="5" fill="%23ffffff" fill-opacity="0.25"/%3E%3Crect x="45" y="45" width="5" height="5" fill="%23ffffff" fill-opacity="0.25"/%3E%3C/svg%3E")', backgroundSize: '60px 60px' }}></div>
      </div>
      
      {/* Profile Information */}
      <div className="pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-[#3d2a20]/95 rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-[#5b3d2e]/50">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="relative">
                {avatarUrl ? (
                  <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
                    <Image
                      src={avatarUrl}
                      alt="Profile Picture"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-32 w-32 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-3xl font-bold text-white border-4 border-white dark:border-gray-700 shadow-lg">
                    {initials}
                  </div>
                )}
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{fullName}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{email}</p>
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {effectiveRole === "student" ? "Student" : "Funder/Organization"}
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex space-x-2">
                    {isEditing ? (
                      <>
                        <button 
                          onClick={() => {
                            if (formRef.current) {
                              // Simulate a form submission
                              const submitEvent = new Event('submit', {bubbles: true, cancelable: true});
                              formRef.current.dispatchEvent(submitEvent);
                              handleSaveProfile();
                            }
                          }}
                          disabled={isSaving}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-[#5b3d2e] dark:hover:bg-[#4a3226] dark:focus:ring-[var(--light-brown-1)] transition-colors duration-200"
                        >
                          <CheckIcon className="h-5 w-5 mr-2" />
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button 
                          onClick={handleEditToggle}
                          disabled={isSaving}
                          className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-[#3d2a20] dark:text-[var(--light-brown-2)] dark:border-[#5b3d2e] dark:hover:bg-[#4a3226] transition-colors duration-200"
                        >
                          <XMarkIcon className="h-5 w-5 mr-2" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button onClick={handleEditToggle} className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-[#5b3d2e] dark:hover:bg-[#4a3226] dark:focus:ring-[var(--light-brown-1)] transition-colors duration-200">
                        <PencilSquareIcon className="h-5 w-5 mr-2" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion Card */}
      <div className="pt-6 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-[#5b3d2e]/30 rounded-lg shadow p-6 mb-6 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Profile Completion</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Complete your profile to improve matching accuracy</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-blue-600 dark:text-[var(--light-brown-1)]">{profileCompletion()}%</span>
                  <div className="ml-4 w-48 h-2 bg-gray-200 dark:bg-[#3d2a20] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 dark:bg-[var(--light-brown-1)] rounded-full" 
                      style={{ width: `${profileCompletion()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-[#3d2a20]/90 rounded-lg shadow overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-[#5b3d2e] border-opacity-30">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("about")}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === "about"
                      ? "border-b-2 border-blue-500 text-blue-600 dark:border-[var(--light-brown-1)] dark:text-[var(--light-brown-1)]"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-[var(--light-brown-2)]"
                  }`}
                >
                  About
                </button>
                {effectiveRole !== "student" && (
                  <button
                    onClick={() => setActiveTab("contact")}
                    className={`py-4 px-6 text-sm font-medium ${
                      activeTab === "contact"
                        ? "border-b-2 border-blue-500 text-blue-600 dark:border-[var(--light-brown-1)] dark:text-[var(--light-brown-1)]"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-[var(--light-brown-2)]"
                    }`}
                  >
                    Contact Information
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("activity")}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === "activity"
                      ? "border-b-2 border-blue-500 text-blue-600 dark:border-[var(--light-brown-1)] dark:text-[var(--light-brown-1)]"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-[var(--light-brown-2)]"
                  }`}
                >
                  Activity
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {profileLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
              ) : !editableProfile ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No profile information available</p>
                  <Link 
                    href={effectiveRole === "student" ? "/onboarding/student" : "/onboarding/org"} 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-[#5b3d2e] dark:hover:bg-[#4a3226]"
                  >
                    Complete Your Profile
                  </Link>
                </div>
              ) : (
                <>
                  {/* About Tab */}
                  {activeTab === "about" && (
                    <>
                      {effectiveRole === "student" && !isEditing && (
                        <div className="mb-8 p-6">
                          <ProfileSummary />
                        </div>
                      )}
                      
                      <form 
                        ref={formRef} 
                        className="space-y-8" 
                        onSubmit={handleSaveProfile}
                      >
                        {effectiveRole === "student" ? (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-blue-50 dark:bg-[#5b3d2e]/50 rounded-lg p-6 shadow-sm border border-blue-100 dark:border-[#d2ac8b]/30">
                                <div className="flex items-center mb-4">
                                  <BuildingOffice2Icon className="h-6 w-6 text-blue-600 dark:text-[var(--light-brown-1)]" />
                                  <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">Academic Information</h3>
                                </div>
                                <div className="space-y-4">
                                  <EditableField 
                                    label="Institution" 
                                    value={editableProfile.institution} 
                                    fieldName="institution"
                                  />
                                  <EditableField 
                                    label="Major" 
                                    value={editableProfile.major} 
                                    fieldName="major"
                                  />
                                  <EditableField 
                                    label="Graduation Year" 
                                    value={editableProfile.graduationYear?.toString()} 
                                    fieldName="graduationYear"
                                  />
                                  <EditableField 
                                    label="Interests" 
                                    value={editableProfile.interests?.join(', ')} 
                                    fieldName="interests"
                                    isArray={true}
                                  />
                                </div>
                              </div>
                              
                              <div className="bg-blue-50 dark:bg-[#5b3d2e]/50 rounded-lg p-6 shadow-sm border border-blue-100 dark:border-[#d2ac8b]/30">
                                <div className="flex items-center mb-4">
                                  <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-blue-600 dark:text-[var(--light-brown-1)]" />
                                  <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">Bio</h3>
                                </div>
                                <div className="space-y-4">
                                  <EditableField 
                                    label="Bio" 
                                    value={editableProfile.bio} 
                                    fieldName="bio"
                                    isTextarea={true}
                                  />
                                </div>
                              </div>
                              
                              {/* New section for Skills and Languages */}
                              <div className="bg-blue-50 dark:bg-[#5b3d2e]/50 rounded-lg p-6 shadow-sm border border-blue-100 dark:border-[#d2ac8b]/30">
                                <div className="flex items-center mb-4">
                                  <SparklesIcon className="h-6 w-6 text-blue-600 dark:text-[var(--light-brown-1)]" />
                                  <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">Skills & Languages</h3>
                                </div>
                                <div className="space-y-4">
                                  <EditableField 
                                    label="Skills" 
                                    value={editableProfile.skills?.join(', ')} 
                                    fieldName="skills"
                                    isArray={true}
                                  />
                                  <EditableField 
                                    label="Languages" 
                                    value={editableProfile.languages?.join(', ')} 
                                    fieldName="languages"
                                    isArray={true}
                                  />
                                  <EditableField 
                                    label="Achievements" 
                                    value={editableProfile.achievements?.join(', ')} 
                                    fieldName="achievements"
                                    isArray={true}
                                  />
                                </div>
                              </div>
                              
                              {/* New section for Career and Finance */}
                              <div className="bg-blue-50 dark:bg-[#5b3d2e]/50 rounded-lg p-6 shadow-sm border border-blue-100 dark:border-[#d2ac8b]/30">
                                <div className="flex items-center mb-4">
                                  <BriefcaseIcon className="h-6 w-6 text-blue-600 dark:text-[var(--light-brown-1)]" />
                                  <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">Career & Financials</h3>
                                </div>
                                <div className="space-y-4">
                                  <EditableField 
                                    label="Career Goals" 
                                    value={editableProfile.careerGoals} 
                                    fieldName="careerGoals"
                                    isTextarea={true}
                                  />
                                  <EditableField 
                                    label="Financial Background" 
                                    value={editableProfile.financialBackground} 
                                    fieldName="financialBackground"
                                  />
                                  <EditableField 
                                    label="Location Preferences" 
                                    value={editableProfile.locationPreferences?.join(', ')} 
                                    fieldName="locationPreferences"
                                    isArray={true}
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-green-50 dark:bg-[#5b3d2e]/50 rounded-lg p-6 shadow-sm border border-green-100 dark:border-[#d2ac8b]/30">
                                <div className="flex items-center mb-4">
                                  <BriefcaseIcon className="h-6 w-6 text-green-600 dark:text-[var(--light-brown-1)]" />
                                  <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">Organization Information</h3>
                                </div>
                                <div className="space-y-4">
                                  <EditableField 
                                    label="Organization Name" 
                                    value={editableProfile.name} 
                                    fieldName="name"
                                  />
                                  <EditableField 
                                    label="Title" 
                                    value={editableProfile.title} 
                                    fieldName="title"
                                  />
                                  <EditableField 
                                    label="Category" 
                                    value={editableProfile.category} 
                                    fieldName="category"
                                  />
                                </div>
                              </div>
                              <div className="bg-amber-50 dark:bg-[#5b3d2e]/50 rounded-lg p-6 shadow-sm border border-amber-100 dark:border-[#d2ac8b]/30">
                                <div className="flex items-center mb-4">
                                  <StarIcon className="h-6 w-6 text-amber-600 dark:text-[var(--light-brown-1)]" />
                                  <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">Description & Mission</h3>
                                </div>
                                <div className="space-y-4">
                                  <EditableField 
                                    label="About" 
                                    value={editableProfile.about} 
                                    fieldName="about"
                                    isTextarea={true}
                                  />
                                  <EditableField 
                                    label="Mission" 
                                    value={editableProfile.mission} 
                                    fieldName="mission"
                                    isTextarea={true}
                                  />
                                </div>
                              </div>
                            </div>
                            {/* Funding Information Section */}
                            <div className="bg-purple-50 dark:bg-[#5b3d2e]/50 rounded-lg p-6 shadow-sm border border-purple-100 dark:border-[#d2ac8b]/30">
                              <div className="flex items-center mb-4">
                                <CurrencyDollarIcon className="h-6 w-6 text-purple-600 dark:text-[var(--light-brown-1)]" />
                                <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">Funding Information</h3>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <EditableField 
                                    label="Target Demographics" 
                                    value={editableProfile.targetDemographics?.join(', ')} 
                                    fieldName="targetDemographics"
                                    isArray={true}
                                  />
                                  <EditableField 
                                    label="Funding Amount" 
                                    value={editableProfile.fundingAmount} 
                                    fieldName="fundingAmount"
                                  />
                                  <EditableField 
                                    label="Application Deadlines" 
                                    value={editableProfile.applicationDeadlines} 
                                    fieldName="applicationDeadlines"
                                  />
                                </div>
                                <div className="space-y-4">
                                  <EditableField 
                                    label="Scholarship Types" 
                                    value={editableProfile.scholarshipTypes?.join(', ')} 
                                    fieldName="scholarshipTypes"
                                    isArray={true}
                                  />
                                  <EditableField 
                                    label="Eligibility Criteria" 
                                    value={editableProfile.eligibilityCriteria?.join(', ')} 
                                    fieldName="eligibilityCriteria"
                                    isArray={true}
                                  />
                                  <EditableField 
                                    label="Funding History" 
                                    value={editableProfile.fundingHistory} 
                                    fieldName="fundingHistory"
                                    isTextarea={true}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {/* Status and Success Stories Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                              <div className="bg-indigo-50 dark:bg-[#5b3d2e]/50 rounded-lg p-6 shadow-sm border border-indigo-100 dark:border-[#d2ac8b]/30">
                                <div className="flex items-center mb-4">
                                  <DocumentTextIcon className="h-6 w-6 text-indigo-600 dark:text-[var(--light-brown-1)]" />
                                  <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">Status</h3>
                                </div>
                                <div>
                                  {isEditing ? (
                                    <div className="space-y-4">
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                      <select
                                        name="status"
                                        defaultValue={editableProfile.status || 'active'}
                                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-[#3d2a20] dark:text-white p-3 h-12 text-base"
                                      >
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                      </select>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                      <div className="flex items-center">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                          editableProfile.status === 'active' 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                        }`}>
                                          {editableProfile.status === 'active' ? (
                                            <CheckIcon className="h-4 w-4 mr-1" />
                                          ) : (
                                            <XMarkIcon className="h-4 w-4 mr-1" />
                                          )}
                                          {editableProfile.status || 'Active'}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="bg-amber-50 dark:bg-[#5b3d2e]/50 rounded-lg p-6 shadow-sm border border-amber-100 dark:border-[#d2ac8b]/30">
                                <div className="flex items-center mb-4">
                                  <SparklesIcon className="h-6 w-6 text-amber-600 dark:text-[var(--light-brown-1)]" />
                                  <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">Success Stories</h3>
                                </div>
                                <div className="space-y-4">
                                  <EditableField 
                                    label="Success Stories" 
                                    value={editableProfile.successStories} 
                                    fieldName="successStories"
                                    isTextarea={true}
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                        
                        {isEditing && (
                          <div className="flex justify-end space-x-3 mt-6">
                            <button 
                              type="button"
                              onClick={handleEditToggle}
                              disabled={isSaving}
                              className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-[#3d2a20] dark:text-[var(--light-brown-2)] dark:border-[#5b3d2e] dark:hover:bg-[#4a3226] transition-colors duration-200"
                            >
                              <XMarkIcon className="h-5 w-5 mr-2" />
                              Cancel
                            </button>
                            <button 
                              type="submit"
                              disabled={isSaving}
                              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-[#5b3d2e] dark:hover:bg-[#4a3226] dark:focus:ring-[var(--light-brown-1)] transition-colors duration-200"
                            >
                              <CheckIcon className="h-5 w-5 mr-2" />
                              {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        )}
                      </form>
                    </>
                  )}

                  {/* Contact Information Tab */}
                  {activeTab === "contact" && effectiveRole !== "student" && (
                    <form 
                      ref={formRef} 
                      className="space-y-8"
                      onSubmit={handleSaveProfile}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-teal-50 dark:bg-[#5b3d2e]/50 rounded-lg p-6 shadow-sm border border-teal-100 dark:border-[#d2ac8b]/30">
                          <div className="flex items-center mb-4">
                            <MapPinIcon className="h-6 w-6 text-teal-600 dark:text-[var(--light-brown-1)]" />
                            <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">Location</h3>
                          </div>
                          <div className="space-y-4">
                            <EditableField 
                              label="Address" 
                              value={editableProfile.contact?.address} 
                              fieldName="contact.address"
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <EditableField 
                                label="City" 
                                value={editableProfile.contact?.city} 
                                fieldName="contact.city"
                              />
                              <EditableField 
                                label="Province" 
                                value={editableProfile.contact?.province} 
                                fieldName="contact.province"
                              />
                            </div>
                            <EditableField 
                              label="Postal Code" 
                              value={editableProfile.contact?.postalCode} 
                              fieldName="contact.postalCode"
                            />
                          </div>
                        </div>
                        <div className="bg-rose-50 dark:bg-[#5b3d2e]/50 rounded-lg p-6 shadow-sm border border-rose-100 dark:border-[#d2ac8b]/30">
                          <div className="flex items-center mb-4">
                            <PhoneIcon className="h-6 w-6 text-rose-600 dark:text-[var(--light-brown-1)]" />
                            <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">Contact Details</h3>
                          </div>
                          <div className="space-y-4">
                            <EditableField 
                              label="Email" 
                              value={editableProfile.contact?.email} 
                              fieldName="contact.email"
                            />
                            <EditableField 
                              label="Office Number" 
                              value={editableProfile.contact?.officeNumber} 
                              fieldName="contact.officeNumber"
                            />
                            <EditableField 
                              label="Alternative Phone" 
                              value={editableProfile.contact?.alternativePhone} 
                              fieldName="contact.alternativePhone"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="bg-cyan-50 dark:bg-[#5b3d2e]/50 rounded-lg p-6 shadow-sm border border-cyan-100 dark:border-[#d2ac8b]/30">
                        <div className="flex items-center mb-4">
                          <GlobeAltIcon className="h-6 w-6 text-cyan-600 dark:text-[var(--light-brown-1)]" />
                          <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">Online Presence</h3>
                        </div>
                        <div className="space-y-4">
                          <EditableField 
                            label="Website" 
                            value={editableProfile.contact?.website} 
                            fieldName="contact.website"
                          />
                          <div className="space-y-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Social Media</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                              <div>
                                <div className="flex items-center mb-2">
                                  <svg className="h-4 w-4 mr-2 text-[#1DA1F2] dark:text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                                  </svg>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Twitter</p>
                                </div>
                                <SocialMediaInput
                                  platform="twitter"
                                  value={editableProfile.contact?.socialMedia?.twitter}
                                  placeholder="username"
                                  isEditing={isEditing}
                                />
                              </div>
                              <div>
                                <div className="flex items-center mb-2">
                                  <svg className="h-4 w-4 mr-2 text-[#4267B2] dark:text-[#4267B2]" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                                  </svg>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Facebook</p>
                                </div>
                                <SocialMediaInput
                                  platform="facebook"
                                  value={editableProfile.contact?.socialMedia?.facebook}
                                  placeholder="username or page"
                                  isEditing={isEditing}
                                />
                              </div>
                              <div>
                                <div className="flex items-center mb-2">
                                  <svg className="h-4 w-4 mr-2 text-[#0A66C2] dark:text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                  </svg>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn</p>
                                </div>
                                <SocialMediaInput
                                  platform="linkedin"
                                  value={editableProfile.contact?.socialMedia?.linkedin}
                                  placeholder="username"
                                  isEditing={isEditing}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {isEditing && (
                        <div className="flex justify-end space-x-3 mt-6">
                          <button 
                            type="button"
                            onClick={handleEditToggle}
                            disabled={isSaving}
                            className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-[#3d2a20] dark:text-[var(--light-brown-2)] dark:border-[#5b3d2e] dark:hover:bg-[#4a3226] transition-colors duration-200"
                          >
                            <XMarkIcon className="h-5 w-5 mr-2" />
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-[#5b3d2e] dark:hover:bg-[#4a3226] dark:focus:ring-[var(--light-brown-1)] transition-colors duration-200"
                          >
                            <CheckIcon className="h-5 w-5 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      )}
                    </form>
                  )}

                  {/* Activity Tab */}
                  {activeTab === "activity" && (
                    <div className="py-4">
                      <div className="text-center py-10">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 dark:bg-[#5b3d2e]/50 dark:text-[var(--light-brown-1)] mb-4">
                          <ChatBubbleLeftEllipsisIcon className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Activity Coming Soon</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                          {effectiveRole === "student" 
                            ? "Track your bursary applications and matching activity here." 
                            : "Track your bursary listings and applicant activity here."}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 