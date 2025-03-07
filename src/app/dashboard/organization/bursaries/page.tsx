"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlusIcon, PencilIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
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
  contentModerationStatus: string;
  competitionLevel: string;
  applicationComplexity: string;
  organization: {
    _id: string;
    title: string;
    images: {
      logo?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export default function OrganizationBursariesPage() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [bursaries, setBursaries] = useState<Bursary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingBursaryId, setProcessingBursaryId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  // Get user role and organization ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('userRole');
      const storedOrgId = localStorage.getItem('organizationId');
      setUserRole(storedRole);
      setOrganizationId(storedOrgId);
    }
  }, []);

  // Check if user is an organization or funder
  useEffect(() => {
    if (isLoaded) {
      if (!userId) {
        router.push("/sign-in");
      } else if (userRole !== "organization" && userRole !== "funder") {
        router.push("/dashboard");
      }
    }
  }, [isLoaded, userId, userRole, router]);

  // Fetch organization's bursaries
  useEffect(() => {
    const fetchBursaries = async () => {
      if (!isLoaded || !userId || !organizationId) return;
      
      try {
        setLoading(true);
        
        const response = await fetch(`/api/bursaries?organization=${organizationId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch bursaries");
        }
        
        const data = await response.json();
        setBursaries(data);
      } catch (error) {
        console.error("Error fetching bursaries:", error);
        setError("Failed to load bursaries. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBursaries();
  }, [isLoaded, userId, organizationId]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format status with appropriate color
  const getStatusDisplay = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      flagged: "bg-orange-100 text-orange-800",
      rejected: "bg-red-100 text-red-800",
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Trigger AI processing for a bursary
  const handleProcessWithAI = async (bursaryId: string) => {
    try {
      setProcessingBursaryId(bursaryId);
      
      const response = await fetch("/api/bursaries/ai-process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bursaryId }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to process bursary with AI");
      }
      
      // Refresh bursaries list to show updated AI data
      const bursariesResponse = await fetch(`/api/bursaries?organization=${organizationId}`);
      
      if (!bursariesResponse.ok) {
        throw new Error("Failed to refresh bursaries");
      }
      
      const updatedBursaries = await bursariesResponse.json();
      setBursaries(updatedBursaries);
      
      alert("Bursary processed successfully with AI!");
    } catch (error) {
      console.error("Error processing bursary with AI:", error);
      alert("Failed to process bursary with AI. Please try again.");
    } finally {
      setProcessingBursaryId(null);
    }
  };

  // Loading state
  if (!isLoaded || loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Your Bursaries</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg shadow">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Your Bursaries</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Bursaries</h1>
        <Link 
          href="/dashboard/bursaries/create" 
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg shadow-sm hover:bg-purple-700 transition"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Bursary
        </Link>
      </div>
      
      {bursaries.length === 0 ? (
        <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-lg shadow-sm">
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">No bursaries created yet</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Create your first bursary to start attracting qualified applicants.
          </p>
          <Link 
            href="/dashboard/bursaries/create" 
            className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg shadow-sm hover:bg-purple-700 transition"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Bursary
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bursaries.map((bursary) => (
            <div 
              key={bursary._id} 
              className="bg-white/70 dark:bg-gray-800/50 rounded-lg shadow-md hover:shadow-lg transition p-4"
            >
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{bursary.title}</h2>
                  <div className="mt-2 flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-500">
                      Created: {formatDate(bursary.createdAt)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Deadline: {formatDate(bursary.deadline)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Award: ${bursary.awardAmount.toLocaleString()}
                    </span>
                    <div className="ml-2">
                      {getStatusDisplay(bursary.contentModerationStatus)}
                    </div>
                  </div>
                  <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-2">{bursary.description}</p>
                  
                  {/* AI-related information */}
                  {bursary.aiTags && bursary.aiTags.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">AI Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
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
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">Categories:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
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
                </div>
                
                <div className="flex flex-row md:flex-col justify-end gap-2">
                  <button 
                    onClick={() => handleProcessWithAI(bursary._id)}
                    disabled={processingBursaryId === bursary._id}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {processingBursaryId === bursary._id ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-1.5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                        Process with AI
                      </>
                    )}
                  </button>
                  
                  <Link
                    href={`/dashboard/bursaries/${bursary._id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50"
                  >
                    View Public Page
                  </Link>
                  
                  <Link
                    href={`/dashboard/bursaries/edit/${bursary._id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PencilIcon className="h-4 w-4 mr-1.5" />
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Understanding AI Processing</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          When you click "Process with AI", our system will:
        </p>
        <ul className="mt-2 list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
          <li>Generate relevant tags based on your bursary description</li>
          <li>Categorize your bursary to help students find it</li>
          <li>Estimate competition level based on award amount and criteria</li>
          <li>Assess application complexity to inform students</li>
        </ul>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          These AI-generated insights help match your bursary with the most relevant students.
        </p>
      </div>
    </div>
  );
} 