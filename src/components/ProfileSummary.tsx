import React, { useState, useEffect, memo } from "react";
import {
  SparklesIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ChartBarIcon,
  LightBulbIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  HeartIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  PlusCircleIcon,
  CheckBadgeIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline";
import { ProfileSummary as ProfileSummaryType } from "@/lib/profileSummary";

// Format the AI summary text with proper bullet points
const formattedSummaryText = (text: string, isExpanded: boolean) => {
  if (!text) return null;
  
  // This is the raw text from Claude API - display it directly without special formatting
  return (
    <div className="formatted-summary space-y-4">
      {/* Display the full Claude-generated text directly */}
      <p className="text-gray-800 dark:text-gray-100 text-base leading-relaxed whitespace-pre-wrap">
        {text}
      </p>
    </div>
  );
};

interface ProfileSummaryProps {
  showSummary?: boolean; // Whether to display the summary section
}

// Wrap component in React.memo to prevent unnecessary re-renders
export default memo(function ProfileSummary({ showSummary = true }: ProfileSummaryProps) {
  const [profileSummary, setProfileSummary] = useState<ProfileSummaryType | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryExpanded, setAiSummaryExpanded] = useState(false);
  
  // Check for globally stored summary on initial render
  useEffect(() => {
    // @ts-ignore - Access window global cache
    if (typeof window !== 'undefined' && window.__AI_SUMMARY__) {
      // @ts-ignore - Access window global cache
      setAiSummary(window.__AI_SUMMARY__);
      console.log("Loaded summary from window cache");
    }
  }, []);
  
  // Run on component init just once to ensure we get data
  // This will run only on the first render
  useEffect(() => {
    console.log("INIT: Component mounted, immediately fetching AI summary");
    if (showSummary) {
      // Force an immediate fetch when component first mounts
      fetchAISummary();
    }
  }, []); // Empty dependency array = run once on mount

  // Main effect for fetching data
  useEffect(() => {
    if (showSummary) {
      // Always fetch both summaries on mount
      fetchProfileSummary();
      fetchAISummary();
    }
  }, [showSummary]); // Only re-run if showSummary changes

  const fetchProfileSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile/summary');
      
      if (!response.ok) {
        throw new Error(`Error fetching profile summary: ${response.status}`);
      }
      
      const data = await response.json();
      setProfileSummary(data.summary);
    } catch (err) {
      console.error('Failed to fetch profile summary:', err);
      setError('Failed to load your profile summary');
    } finally {
      setLoading(false);
    }
  };

  const fetchAISummary = async () => {
    try {
      setAiSummaryLoading(true);
      console.log("Fetching AI Summary...");
      
      // Get the actual origin with debugging to ensure it's correct
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const apiUrl = `${origin}/api/summary?type=student&id=me&_t=${timestamp}`;
      console.log(`Making request to: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching AI summary: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received AI summary response:', data);
      
      if (data && data.summary) {
        console.log("Setting AI summary...");
        
        // Set in React state
        setAiSummary(data.summary);
        
        // Also store it on window for global persistence
        if (typeof window !== 'undefined') {
          // @ts-ignore - Set window global cache
          window.__AI_SUMMARY__ = data.summary;
          console.log("Saved summary to window cache");
        }
      } else {
        console.error('Received empty AI summary');
      }
    } catch (err) {
      console.error('Failed to fetch AI summary:', err);
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const refreshSummary = () => {
    setLoading(true);
    fetchProfileSummary();
  };

  // Restore a modified version of the loading indicator
  if (loading && !profileSummary && !aiSummary) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-4 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading profile information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  // Still show if we have either a profile summary or an AI summary
  if (!showSummary || (!profileSummary && !aiSummary)) {
    return null;
  }

  // Debug logging
  console.log("Rendering profile summary. AI summary:", aiSummary ? "present" : "not present", 
              "Profile summary:", profileSummary ? "present" : "not present");

  return (
    <div className="bg-white dark:bg-[#3d2a20] rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 dark:border-[#5b3d2e] flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile Summary</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => fetchAISummary()}
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Refresh AI summary"
            disabled={aiSummaryLoading}
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Refresh
          </button>
          {aiSummaryLoading && (
            <div className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium">
              <div className="w-4 h-4 border-2 border-t-[#ff6600] rounded-full animate-spin mr-1"></div>
              Updating...
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-start">
            <InformationCircleIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
            <div className="w-full">
              {aiSummaryLoading && !aiSummary ? (
                <div className="mb-4 bg-white dark:bg-[#5b3d2e] p-5 rounded-lg border-2 border-[#ff6600]/40 dark:border-[#ff6600]/60 shadow-md">
                  <div className="flex justify-center items-center py-6">
                    <div className="w-6 h-6 border-4 border-t-[#ff6600] rounded-full animate-spin mr-2"></div>
                    <p className="text-gray-700 dark:text-gray-300">Generating AI summary...</p>
                  </div>
                </div>
              ) : aiSummary ? (
                <div className="mb-4">
                  <div className="text-gray-700 dark:text-gray-200 bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-lg border-2 border-indigo-200 dark:border-indigo-800/40 shadow-md">
                    <div className="border-l-4 border-indigo-500 dark:border-indigo-400 pl-4 mb-4 bg-indigo-100 dark:bg-indigo-900/30 py-2 rounded-r-md">
                      <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 italic mb-1">AI-powered personal profile analysis</p>
                    </div>
                    {formattedSummaryText(aiSummary, aiSummaryExpanded)}
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 mb-4 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/30 italic">
                  Click the "Refresh" button to generate an AI analysis of your profile.
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* The Key Profile Attributes and Match Profile Strengths sections have been removed */}
      </div>
    </div>
  );
}); 