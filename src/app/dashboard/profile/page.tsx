"use client";
import React from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { BriefcaseIcon, TagIcon, DocumentTextIcon, StarIcon, 
  BuildingOffice2Icon, BookOpenIcon, AcademicCapIcon, SparklesIcon, ChatBubbleLeftEllipsisIcon 
} from "@heroicons/react/24/outline";

interface Profile {
  // Student profile fields
  institution?: string;
  major?: string;
  graduationYear?: string;
  interests?: string;
  bio?: string;
  
  // Organization profile fields
  title?: string;
  category?: string;
  about?: string;
  mission?: string;
  contact?: {
    address?: string;
    province?: string;
    city?: string;
    postalCode?: string;
    officeNumber?: string;
    alternativePhone?: string;
    email?: string;
    website?: string;
    socialMedia?: {
      twitter?: string;
      facebook?: string;
      linkedin?: string;
    };
  };
}

export default function ProfilePage() {
  // Retrieve the logged-in user from Clerk
  const { user } = useUser();
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  // New state to store the role from the API (if fetched)
  const [dbRole, setDbRole] = React.useState("");

  // Determine the effective role: API role (if available) or fallback from Clerk
  const roleFromClerk = (user && user.publicMetadata) ? user.publicMetadata.role : "student";
  const effectiveRole = dbRole || roleFromClerk;

  React.useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await res.json();
        setProfile(data.profile);
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

  if (!user) {
    return <div className="p-8 text-center">Loading user...</div>;
  }

  // Compute user's full name using firstName and lastName if available
  const fullName = (user.firstName && user.lastName) 
                    ? `${user.firstName} ${user.lastName}` 
                    : (user.firstName || user.fullName || "");
  const initials = fullName ? fullName.split(" ").map((name) => name[0]).join("").toUpperCase() : "";

  // Use user's avatar if available; otherwise fallback to a placeholder
  const avatarUrl = user.imageUrl || "";
  const email = user.primaryEmailAddress?.emailAddress || "";

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-lg shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile Picture"
                width={100}
                height={100}
                className="rounded-full border-4 border-indigo-500"
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center rounded-full bg-gray-300 text-3xl font-bold text-gray-700">
                {initials}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{fullName}</h1>
            <p className="text-gray-500 dark:text-gray-400">{email}</p>
            <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">
              {effectiveRole === "student" ? "Student" : "Funder"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">About Me</h2>
        {profileLoading ? (
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading profile data...</p>
        ) : error ? (
          <p className="mt-2 text-red-500">{error}</p>
        ) : profile ? (
          <>
            {effectiveRole === "student" ? (
              <div className="mt-2 space-y-4">
                <div className="flex items-center p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg shadow">
                  <BuildingOffice2Icon className="w-6 h-6 text-indigo-500 mr-2" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Institution</p>
                    <p className="text-sm break-words">{profile.institution || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-green-50 dark:bg-green-900 rounded-lg shadow">
                  <BookOpenIcon className="w-6 h-6 text-green-500 mr-2" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Major</p>
                    <p className="text-sm break-words">{profile.major || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg shadow">
                  <AcademicCapIcon className="w-6 h-6 text-yellow-500 mr-2" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Graduation Year</p>
                    <p className="text-sm break-words">{profile.graduationYear || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-purple-50 dark:bg-purple-900 rounded-lg shadow">
                  <SparklesIcon className="w-6 h-6 text-purple-500 mr-2" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Interests</p>
                    <p className="text-sm break-words">{profile.interests || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-red-50 dark:bg-red-900 rounded-lg shadow">
                  <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-red-500 mr-2" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Bio</p>
                    <p className="text-sm break-words">{profile.bio || "N/A"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-2 space-y-4">
                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg shadow">
                  <BriefcaseIcon className="w-6 h-6 text-blue-500 mr-2" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Title</p>
                    <p className="text-sm break-words">{profile.title || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-teal-50 dark:bg-teal-900 rounded-lg shadow">
                  <TagIcon className="w-6 h-6 text-teal-500 mr-2" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Category</p>
                    <p className="text-sm break-words">{profile.category || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-cyan-50 dark:bg-cyan-900 rounded-lg shadow">
                  <DocumentTextIcon className="w-6 h-6 text-cyan-500 mr-2" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">About</p>
                    <p className="text-sm break-words">{profile.about || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-orange-50 dark:bg-orange-900 rounded-lg shadow">
                  <StarIcon className="w-6 h-6 text-orange-500 mr-2" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Mission</p>
                    <p className="text-sm break-words">{profile.mission || "N/A"}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="mt-2 text-gray-600 dark:text-gray-300">No additional profile data available.</p>
        )}
      </div>
    </div>
  );
} 