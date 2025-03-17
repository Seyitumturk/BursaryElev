"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  BuildingOffice2Icon, 
  EnvelopeIcon, 
  PhoneIcon, 
  GlobeAltIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

interface Organization {
  _id: string;
  name: string;
  title: string;
  description: string;
  about?: string;
  mission?: string;
  category?: string;
  contact: {
    email: string;
    phone?: string;
    website?: string;
    officeNumber?: string;
    alternativePhone?: string;
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
    province?: string;
    zipCode?: string;
    postalCode?: string;
    country?: string;
  };
  images?: {
    logo?: string;
    banner?: string;
  };
}

export default function OrganizationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        console.log("Fetching organization with ID:", id);
        const response = await fetch(`/api/organizations/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          throw new Error(errorData.error || "Failed to fetch organization");
        }
        
        const data = await response.json();
        console.log("Organization data received:", data);
        setOrganization(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("Failed to load organization:", errorMessage);
        setError(`Failed to load organization information: ${errorMessage}`);
        
        // Optionally redirect after a delay if needed
        // setTimeout(() => router.push('/dashboard/bursaries'), 3000);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrganization();
    } else {
      console.error("No organization ID provided");
      setError("No organization ID provided");
      setLoading(false);
      // Redirect if no ID
      router.push('/dashboard/bursaries');
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-red-500 mb-4">Error</h2>
          <p className="text-gray-600 dark:text-gray-300">{error || "Organization not found"}</p>
          <Link href="/dashboard/bursaries" className="mt-6 inline-flex items-center text-purple-600 hover:text-purple-800">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Bursaries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Banner section */}
      <div className="h-60 bg-gradient-to-r from-purple-500 to-indigo-600 relative">
        {organization.images?.banner ? (
          <img 
            src={organization.images.banner} 
            alt={`${organization.title} banner`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-3xl font-bold opacity-30">
              {organization.title || organization.name}
            </div>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 w-full transform translate-y-1/2 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto flex items-end">
            <div className="h-32 w-32 rounded-xl bg-white dark:bg-gray-800 p-2 shadow-lg flex items-center justify-center overflow-hidden">
              {organization.images?.logo ? (
                <img 
                  src={organization.images.logo} 
                  alt={`${organization.title} logo`} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <BuildingOffice2Icon className="h-16 w-16 text-purple-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {organization.title || organization.name}
            </h1>
            {organization.category && (
              <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mt-1 block">
                {organization.category}
              </span>
            )}
          </div>
          <Link 
            href="/dashboard/bursaries" 
            className="flex items-center text-purple-600 hover:text-purple-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Bursaries
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About</h2>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                {organization.about || organization.description || "No information available."}
              </p>
            </div>

            {/* Mission */}
            {organization.mission && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Our Mission</h2>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {organization.mission}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
              <div className="space-y-4">
                {organization.contact?.email && (
                  <div className="flex items-start">
                    <EnvelopeIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                      <a href={`mailto:${organization.contact.email}`} className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300">
                        {organization.contact.email}
                      </a>
                    </div>
                  </div>
                )}

                {(organization.contact?.phone || organization.contact?.officeNumber) && (
                  <div className="flex items-start">
                    <PhoneIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</h3>
                      <p className="text-gray-900 dark:text-white">
                        {organization.contact?.phone || organization.contact?.officeNumber}
                      </p>
                    </div>
                  </div>
                )}

                {organization.contact?.website && (
                  <div className="flex items-start">
                    <GlobeAltIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</h3>
                      <a 
                        href={organization.contact.website.startsWith('http') ? organization.contact.website : `https://${organization.contact.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                      >
                        {organization.contact.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media Links */}
              {(organization.contact?.socialMedia?.twitter || 
                organization.contact?.socialMedia?.facebook || 
                organization.contact?.socialMedia?.linkedin) && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Social Media</h3>
                  <div className="flex space-x-4">
                    {organization.contact.socialMedia?.twitter && (
                      <a 
                        href={`https://twitter.com/${organization.contact.socialMedia.twitter.replace('@', '')}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-purple-600"
                      >
                        <span className="sr-only">Twitter</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                    )}

                    {organization.contact.socialMedia?.facebook && (
                      <a 
                        href={organization.contact.socialMedia.facebook}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-purple-600"
                      >
                        <span className="sr-only">Facebook</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.75 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}

                    {organization.contact.socialMedia?.linkedin && (
                      <a 
                        href={organization.contact.socialMedia.linkedin}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-purple-600"
                      >
                        <span className="sr-only">LinkedIn</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Address */}
            {(organization.address?.street || organization.address?.city || organization.address?.province || organization.address?.state) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Address</h2>
                <address className="not-italic text-gray-600 dark:text-gray-300">
                  {organization.address.street && <div>{organization.address.street}</div>}
                  {(organization.address.city || organization.address.province || organization.address.state) && (
                    <div>
                      {organization.address.city && <span>{organization.address.city}</span>}
                      {(organization.address.province || organization.address.state) && (
                        <span>, {organization.address.province || organization.address.state}</span>
                      )}
                      {(organization.address.postalCode || organization.address.zipCode) && (
                        <span> {organization.address.postalCode || organization.address.zipCode}</span>
                      )}
                    </div>
                  )}
                  {organization.address.country && <div>{organization.address.country}</div>}
                </address>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 