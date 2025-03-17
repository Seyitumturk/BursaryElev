"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent, useRef } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { 
  BriefcaseIcon, TagIcon, DocumentTextIcon, StarIcon,
  BuildingOffice2Icon, BookOpenIcon, AcademicCapIcon, SparklesIcon, 
  ChatBubbleLeftEllipsisIcon, GlobeAltIcon, PhoneIcon, EnvelopeIcon,
  MapPinIcon, PencilSquareIcon, CheckIcon, XMarkIcon
} from "@heroicons/react/24/outline";
import { toast } from 'react-hot-toast';

interface Profile {
  _id?: string;
  // Common fields
  user?: string;
  
  // Student profile fields
  institution?: string;
  major?: string;
  graduationYear?: string;
  interests?: string;
  bio?: string;
  
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

  // Simplified save profile handler that gets all form values at once
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
          (profileToSave as any)[key] = value as string;
        }
      });
      
      console.log("SAVING PROFILE DATA:", JSON.stringify(profileToSave, null, 2));
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileToSave),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }
      
      const data = await response.json();
      
      // Update the profile state with the saved data
      setProfile(data.profile);
      setEditableProfile(data.profile);
      setIsEditing(false);
      
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
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
      totalFields = 5; // institution, major, graduationYear, interests, bio
      if (profile.institution) completedFields++;
      if (profile.major) completedFields++;
      if (profile.graduationYear) completedFields++;
      if (profile.interests) completedFields++;
      if (profile.bio) completedFields++;
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

  // Simple field component using defaultValue instead of value for better typing performance
  const EditableField = ({ 
    label, 
    value, 
    fieldName, 
    isTextarea = false,
    readOnly = false
  }: { 
    label: string, 
    value: string | undefined, 
    fieldName: string,
    isTextarea?: boolean,
    readOnly?: boolean
  }) => {
    return (
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{label}</p>
        {isEditing && !readOnly ? (
          isTextarea ? (
            <textarea
              name={fieldName}
              defaultValue={value || ''}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-[#3d2a20] dark:text-white p-3 text-base"
              rows={5}
            />
          ) : (
            <input
              type="text"
              name={fieldName}
              defaultValue={value || ''}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-[#3d2a20] dark:text-white p-3 h-12 text-base"
            />
          )
        ) : (
          <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-line">{value || "Not specified"}</p>
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
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-[#5b3d2e] dark:to-[#3d2a20] h-60 w-full">
        <div className="absolute bottom-0 left-0 w-full transform translate-y-1/2">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-[#3d2a20]/90 rounded-xl shadow-xl p-6 sm:p-8">
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
      </div>

      {/* Profile Completion Card */}
      <div className="pt-36 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-[#3d2a20]/90 rounded-lg shadow p-6 mb-6">
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
                                  value={editableProfile.graduationYear} 
                                  fieldName="graduationYear"
                                />
                              </div>
                            </div>
                            <div className="bg-purple-50 dark:bg-[#5b3d2e]/50 rounded-lg p-6 shadow-sm border border-purple-100 dark:border-[#d2ac8b]/30">
                              <div className="flex items-center mb-4">
                                <SparklesIcon className="h-6 w-6 text-purple-600 dark:text-[var(--light-brown-1)]" />
                                <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">Interests & Bio</h3>
                              </div>
                              <div className="space-y-4">
                                <EditableField 
                                  label="Interests" 
                                  value={editableProfile.interests} 
                                  fieldName="interests"
                                />
                                <EditableField 
                                  label="Bio" 
                                  value={editableProfile.bio} 
                                  fieldName="bio"
                                  isTextarea={true}
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
                          <div className="bg-indigo-50 dark:bg-[#5b3d2e]/50 rounded-lg p-6 shadow-sm border border-indigo-100 dark:border-[#d2ac8b]/30">
                            <div className="flex items-center mb-4">
                              <DocumentTextIcon className="h-6 w-6 text-indigo-600 dark:text-[var(--light-brown-1)]" />
                              <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">Status</h3>
                            </div>
                            <div>
                              {isEditing ? (
                                <div>
                                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Status</p>
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
                                <div>
                                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Status</p>
                                  <p className="mt-1 text-gray-900 dark:text-white capitalize">
                                    {editableProfile.status || 'Active'}
                                  </p>
                                </div>
                              )}
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
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
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