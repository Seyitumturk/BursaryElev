"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon, CalendarIcon, DocumentIcon, TagIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CurrencyDollarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BuildingOffice2Icon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ArrowLongRightIcon,
  BookmarkIcon as BookmarkOutlineIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";

// Bursary interface
interface Bursary {
  _id: string;
  title: string;
  description: string;
  applicationUrl: string;
  deadline: string;
  awardAmount: number;
  eligibilityCriteria: string;
  fieldOfStudy: string[];
  academicLevel: string[];
  financialNeedLevel: string;
  requiredDocuments: string[];
  aiTags: string[];
  aiCategorization: string[];
  competitionLevel: string;
  applicationComplexity: string;
  documents: {
    fileUrl: string;
    fileName: string;
    fileType: string;
    uploadDate: string;
  }[];
  organization: {
    _id: string;
    title: string;
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

export default function BursaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [bursary, setBursary] = useState<Bursary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Unwrap the params Promise using React.use
  const { id } = React.use(params);
  
  // Fetch bursary details
  useEffect(() => {
    const fetchBursaryDetails = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          throw new Error("Bursary ID is required");
        }
        
        const response = await fetch(`/api/bursaries/${id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch bursary details");
        }
        
        const data = await response.json();
        setBursary(data);
      } catch (error) {
        console.error("Error fetching bursary details:", error);
        setError("Failed to load bursary details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBursaryDetails();
  }, [id]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  // Check if user is the organization owner of this bursary
  const isOwner = bursary && session?.user && 
    (session.user as any).organizationId === bursary.organization._id;

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !bursary) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error || "Bursary not found"}</span>
        </div>
        <div className="mt-4">
          <Link 
            href="/dashboard/bursaries" 
            className="inline-flex items-center text-purple-600 hover:text-purple-800"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Back to Bursaries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* Back button and owner controls */}
      <div className="flex justify-between items-center">
        <Link 
          href="/dashboard/bursaries" 
          className="inline-flex items-center text-purple-600 hover:text-purple-800"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Back to Bursaries
        </Link>
        
        {isOwner && (
          <div className="flex space-x-3">
            <Link
              href={`/dashboard/bursaries/edit?id=${bursary._id}`}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
            >
              Edit Bursary
            </Link>
          </div>
        )}
      </div>

      {/* Bursary header */}
      <div className="flex items-center space-x-4">
        <Image
          src={bursary.organization.images?.logo || "/logo.png"}
          alt={`${bursary.organization.title} Logo`}
          width={80}
          height={80}
          className="rounded-full object-cover"
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {bursary.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Offered by {bursary.organization.title}
          </p>
        </div>
      </div>

      {/* Main bursary info with a glass-like card effect */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - Main details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-6 shadow-md backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {bursary.description}
            </p>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-6 shadow-md backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Eligibility Criteria
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {bursary.eligibilityCriteria}
            </p>
          </div>
          
          {bursary.documents && bursary.documents.length > 0 && (
            <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-6 shadow-md backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Supporting Documents
              </h2>
              <ul className="space-y-2">
                {bursary.documents.map((doc, index) => (
                  <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                    <DocumentIcon className="h-5 w-5 mr-2 text-purple-600" />
                    <a 
                      href={doc.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-purple-600 hover:underline"
                    >
                      {doc.fileName}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right column - Additional info */}
        <div className="space-y-6">
          {/* Key details card */}
          <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-6 shadow-md backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Key Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <CalendarIcon className="h-5 w-5 text-purple-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Deadline</p>
                  <p className="text-gray-800 dark:text-gray-200">{formatDate(bursary.deadline)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <svg className="h-5 w-5 text-purple-600 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Award Amount</p>
                  <p className="text-gray-800 dark:text-gray-200">${bursary.awardAmount.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <TagIcon className="h-5 w-5 text-purple-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fields of Study</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {bursary.fieldOfStudy.map((field, idx) => (
                      <span 
                        key={idx} 
                        className="inline-block px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs rounded-full"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <svg className="h-5 w-5 text-purple-600 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Academic Level</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {bursary.academicLevel.map((level, idx) => (
                      <span 
                        key={idx} 
                        className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full capitalize"
                      >
                        {level}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <DocumentTextIcon className="h-5 w-5 text-purple-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Required Documents</p>
                  <ul className="list-disc list-inside text-gray-800 dark:text-gray-200 text-sm">
                    {bursary.requiredDocuments.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <a 
                href={bursary.applicationUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full block text-center px-4 py-2 bg-[var(--header-bg)] text-white rounded-md hover:bg-[var(--header-bg)]/90 transition"
              >
                Apply Now
              </a>
            </div>
          </div>
          
          {/* AI insights card */}
          {(bursary.aiTags?.length > 0 || bursary.aiCategorization?.length > 0) && (
            <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-6 shadow-md backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                AI Insights
              </h2>
              
              {bursary.aiTags && bursary.aiTags.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {bursary.aiTags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="inline-block px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {bursary.aiCategorization && bursary.aiCategorization.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Categories</p>
                  <div className="flex flex-wrap gap-1">
                    {bursary.aiCategorization.map((category, idx) => (
                      <span 
                        key={idx} 
                        className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Competition Level</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">{bursary.competitionLevel}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Application Complexity</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">{bursary.applicationComplexity}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Organization contact info */}
          <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-6 shadow-md backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Contact Information
            </h2>
            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Email:</span>{" "}
                <a 
                  href={`mailto:${bursary.organization.contact.email}`} 
                  className="text-purple-600 hover:underline"
                >
                  {bursary.organization.contact.email}
                </a>
              </p>
              
              {bursary.organization.contact.website && (
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Website:</span>{" "}
                  <a 
                    href={bursary.organization.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline"
                  >
                    {bursary.organization.contact.website}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 