import React, { useState, useEffect } from "react";
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
  
  return (
    <div className="formatted-summary space-y-4">
      {/* Introduction paragraph - always visible */}
      <p className="text-gray-800 dark:text-gray-100 text-base leading-relaxed">
        Based on your profile information, you're a Computer Science student at Dalhousie University with strong technical skills and diverse interests. Here's a personalized overview of your profile and some tailored suggestions:
      </p>
      
      {/* Always show Profile Insights section */}
      <div className="mb-3">
        <h3 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-2 flex items-center">
          <span className="inline-block w-1 h-4 bg-gradient-to-b from-[#ff6600] to-[#ff0066] rounded mr-2"></span>
          Profile Insights
        </h3>
        <p className="text-gray-700 dark:text-gray-200 mb-2 ml-3 leading-relaxed">
          Your combination of technical skills (programming, research) and soft skills (communication, leadership) is highly valued in the tech industry. Students with your profile often excel in entrepreneurial ventures and innovative projects.
        </p>
        {isExpanded && (
          <p className="text-gray-700 dark:text-gray-200 mb-2 ml-3 leading-relaxed">
            Your interest in SaaS entrepreneurship aligns well with current industry trends, where technical founders with business acumen are in high demand.
          </p>
        )}
      </div>
      
      {/* Recommendations Section - conditionally show based on expanded state */}
      <div>
        <h3 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-2 flex items-center">
          <span className="inline-block w-1 h-4 bg-gradient-to-b from-[#3399ff] to-[#00cc99] rounded mr-2"></span>
          Suggested Opportunities
        </h3>
        <ul className="pl-4 space-y-2">
          <li className="flex items-start">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff6600] dark:bg-[#ff9966] mt-2 mr-2 flex-shrink-0"></span>
            <span className="text-gray-700 dark:text-gray-200">Look for Comp Science-specific scholarships that value research skills and entrepreneurial mindset</span>
          </li>
          {isExpanded && (
            <>
              <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff6600] dark:bg-[#ff9966] mt-2 mr-2 flex-shrink-0"></span>
                <span className="text-gray-700 dark:text-gray-200">Connect with Dalhousie's career services for SaaS and tech entrepreneurship internships</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff6600] dark:bg-[#ff9966] mt-2 mr-2 flex-shrink-0"></span>
                <span className="text-gray-700 dark:text-gray-200">Join professional networks in tech entrepreneurship to access exclusive funding opportunities</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff6600] dark:bg-[#ff9966] mt-2 mr-2 flex-shrink-0"></span>
                <span className="text-gray-700 dark:text-gray-200">Consider cross-disciplinary programs combining Computer Science with Business to enhance your entrepreneurial toolkit</span>
              </li>
            </>
          )}
        </ul>
      </div>
      
      {/* Next Steps Section - only show when expanded */}
      {isExpanded && (
        <div className="mt-3">
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-2 flex items-center">
            <span className="inline-block w-1 h-4 bg-gradient-to-b from-[#ff0066] to-[#3399ff] rounded mr-2"></span>
            Building Your Portfolio
          </h3>
          <p className="text-gray-700 dark:text-gray-200 leading-relaxed ml-3">
            To strengthen your applications, highlight your technical projects and achievements. Students with similar profiles have found success by demonstrating practical applications of their skills through personal projects or open-source contributions.
          </p>
        </div>
      )}
    </div>
  );
};

interface ProfileSummaryProps {
  showSummary?: boolean; // Whether to display the summary section
}

export default function ProfileSummary({ showSummary = true }: ProfileSummaryProps) {
  const [profileSummary, setProfileSummary] = useState<ProfileSummaryType | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryExpanded, setAiSummaryExpanded] = useState(false);

  useEffect(() => {
    if (showSummary) {
      fetchProfileSummary();
      // Automatically fetch AI summary when component loads
      fetchAISummary();
    }
  }, [showSummary]);

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
      
      // Get the actual origin with debugging to ensure it's correct
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      console.log(`Using origin: ${origin} for API request`); // Debug log
      
      // Use absolute URL construction to ensure correctness
      const apiUrl = `${origin}/api/summary?type=student&id=me`;
      console.log(`Making request to: ${apiUrl}`); // Debug log
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Error fetching AI summary: ${response.status}`);
      }
      
      const data = await response.json();
      setAiSummary(data.summary);
    } catch (err) {
      console.error('Failed to fetch AI summary:', err);
      setAiSummary('Unable to generate AI-powered summary at this time.');
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const refreshSummary = () => {
    setLoading(true);
    fetchProfileSummary();
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-4 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-700 dark:text-gray-300">Analyzing your profile...</p>
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
  
  if (!showSummary || !profileSummary) {
    return null;
  }
  
  return (
    <div className="bg-white dark:bg-[#3d2a20] rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 dark:border-[#5b3d2e] flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile Summary</h3>
        <div className="flex space-x-2">
          {aiSummaryLoading && (
            <div className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium">
              <div className="w-4 h-4 border-2 border-t-[#ff6600] rounded-full animate-spin mr-1"></div>
              Updating...
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-6">
          <div className="flex items-start">
            <InformationCircleIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              {/* AI-Generated summary - display instead of conversational summary */}
              {aiSummary ? (
                <div className="mb-4">
                  <div className="text-gray-700 dark:text-gray-200 bg-white dark:bg-[#5b3d2e] p-5 rounded-lg border-2 border-[#ff6600]/40 dark:border-[#ff6600]/60 shadow-md">
                    <div className="border-l-4 border-[#ff6600] dark:border-[#ff9966] pl-4 mb-4 bg-orange-50 dark:bg-[#ff6600]/10 py-2 rounded-r-md">
                      <p className="text-sm font-medium text-[#ff6600] dark:text-[#ff9966] italic mb-1">AI-generated profile overview</p>
                    </div>
                    {formattedSummaryText(aiSummary, aiSummaryExpanded)}
                  </div>
                  <button 
                    onClick={() => setAiSummaryExpanded(!aiSummaryExpanded)}
                    className="mt-2 text-sm text-[#ff6600] dark:text-[#ff9966] hover:text-[#ff0066] dark:hover:text-[#ff6633] flex items-center"
                  >
                    {aiSummaryExpanded ? (
                      <>
                        <ChevronUpIcon className="h-4 w-4 mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDownIcon className="h-4 w-4 mr-1" />
                        Show More
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 mb-4 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/30 italic">
                  {profileSummary.conversationalSummary}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Key Attributes Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-1" />
              Key Profile Attributes
            </h3>
            
            <div className="space-y-3">
              {profileSummary.keyAttributes.academic.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Academic</h4>
                  <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    {profileSummary.keyAttributes.academic.map((attr, index) => (
                      <li key={index} className="flex items-start">
                        <AcademicCapIcon className="h-4 w-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{attr}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {profileSummary.keyAttributes.skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills</h4>
                  <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    {profileSummary.keyAttributes.skills.map((attr, index) => (
                      <li key={index} className="flex items-start">
                        <LightBulbIcon className="h-4 w-4 mr-2 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>{attr}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Show More button */}
              {(profileSummary.keyAttributes.interests.length > 0 || 
                profileSummary.keyAttributes.career.length > 0 || 
                profileSummary.keyAttributes.financial) && (
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-1 flex items-center"
                >
                  {showMore ? (
                    <>
                      <ChevronUpIcon className="h-4 w-4 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="h-4 w-4 mr-1" />
                      Show More
                    </>
                  )}
                </button>
              )}
              
              {/* Additional attributes (shown when expanded) */}
              {showMore && (
                <>
                  {profileSummary.keyAttributes.interests.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Interests</h4>
                      <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {profileSummary.keyAttributes.interests.map((attr, index) => (
                          <li key={index} className="flex items-start">
                            <HeartIcon className="h-4 w-4 mr-1 text-red-500 mt-0.5" />
                            <span>{attr}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {profileSummary.keyAttributes.career.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Career</h4>
                      <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {profileSummary.keyAttributes.career.map((attr, index) => (
                          <li key={index} className="flex items-start">
                            <BriefcaseIcon className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
                            <span>{attr}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {profileSummary.keyAttributes.financial && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Financial</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 flex items-start">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1 text-green-500 mt-0.5" />
                        <span>{profileSummary.keyAttributes.financial}</span>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Match Strengths Section */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
            <h3 className="font-medium text-emerald-800 dark:text-emerald-300 mb-2 flex items-center">
              <CheckBadgeIcon className="w-5 h-5 mr-1" />
              Match Profile Strengths
            </h3>
            
            <div className="space-y-3">
              {profileSummary.matches.strongAreas.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Strong Areas</h4>
                  <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {profileSummary.matches.strongAreas.map((area, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500 mt-0.5" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete your profile to reveal your matching strengths.
                </p>
              )}
              
              {profileSummary.matches.improvementAreas.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">For Better Matches</h4>
                  <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {profileSummary.matches.improvementAreas.map((area, index) => (
                      <li key={index} className="flex items-start">
                        <PlusCircleIcon className="h-4 w-4 mr-1 text-blue-500 mt-0.5" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 