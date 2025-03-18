import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  QuestionMarkCircleIcon,
  ArrowRightIcon,
  ClockIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  TagIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { MatchScore } from "@/lib/matchingEngine";

interface BursaryMatch {
  bursary: {
    _id: string;
    title: string;
    description: string;
    deadline: string;
    awardAmount: number;
    fieldOfStudy: string[];
    academicLevel: string[];
    financialNeedLevel: string;
    aiTags: string[];
    organization: {
      _id: string;
      title: string;
      name?: string;
      images: {
        logo?: string;
      };
    };
  };
  matchScore: MatchScore;
}

interface BursaryMatchesProps {
  showMatches?: boolean; // Whether to display matches at all
  limit?: number; // Number of matches to display
}

export default function BursaryMatches({ showMatches = true, limit = 3 }: BursaryMatchesProps) {
  const [matches, setMatches] = useState<BursaryMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMatches, setExpandedMatches] = useState<string[]>([]);
  const [useAIMatching, setUseAIMatching] = useState(false);

  useEffect(() => {
    if (showMatches) {
      fetchMatches();
    }
  }, [showMatches, useAIMatching]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      // Append query parameter for AI matching
      const url = useAIMatching 
        ? '/api/bursaries/matches?includeAI=true' 
        : '/api/bursaries/matches';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error fetching matches: ${response.status}`);
      }
      
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (err) {
      console.error('Failed to fetch matches:', err);
      setError('Failed to load your bursary matches');
    } finally {
      setLoading(false);
    }
  };

  const toggleMatchDetails = (matchId: string) => {
    setExpandedMatches(prev => 
      prev.includes(matchId) 
        ? prev.filter(id => id !== matchId) 
        : [...prev, matchId]
    );
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-gray-600";
  };
  
  const getScoreWidth = (score: number) => {
    return `${score}%`;
  };
  
  if (loading) {
    return (
      <div className="shadow-md rounded-lg overflow-hidden bg-white dark:bg-gray-800 p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Finding your best matches...
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="shadow-md rounded-lg overflow-hidden bg-white dark:bg-gray-800 p-4">
        <div className="text-red-500 dark:text-red-400">{error}</div>
      </div>
    );
  }
  
  if (!showMatches || matches.length === 0) {
    return (
      <div className="shadow-md rounded-lg overflow-hidden bg-white dark:bg-gray-800 p-4">
        <div className="text-center text-gray-500 dark:text-gray-400">
          {matches.length === 0 ? 'No matches found for your profile yet.' : null}
        </div>
      </div>
    );
  }
  
  // Get top matches up to the limit
  const topMatches = matches.slice(0, limit);
  
  return (
    <div className="shadow-md rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-lg">Top Matches For You</h2>
        <div className="flex items-center">
          <label className="inline-flex items-center cursor-pointer mr-2">
            <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">AI Matching:</span>
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={useAIMatching} 
                onChange={() => setUseAIMatching(!useAIMatching)}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </div>
          </label>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {topMatches.map((match) => (
          <div key={match.bursary._id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                  {match.bursary.organization.images?.logo ? (
                    <Image 
                      src={match.bursary.organization.images.logo}
                      alt={match.bursary.organization.title}
                      width={48} 
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-lg font-semibold">
                      {match.bursary.organization.title.charAt(0)}
                    </span>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {match.bursary.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {match.bursary.organization.title}
                  </p>
                  
                  {/* Show both traditional and AI match scores if AI available */}
                  <div className="mt-3 space-y-2">
                    {/* Traditional match score */}
                    <div className="flex items-center">
                      <div className="text-xs text-gray-500 w-28">Traditional Match:</div>
                      <div className="w-28 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: getScoreWidth(match.matchScore.total) }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${getScoreColor(match.matchScore.total)}`}>
                        {match.matchScore.total}%
                      </span>
                    </div>
                    
                    {/* AI-based match score (only show if available) */}
                    {useAIMatching && match.matchScore.aiMatchScore !== undefined && (
                      <div className="flex items-center">
                        <div className="text-xs text-gray-500 w-28">AI Match:</div>
                        <div className="w-28 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full" 
                            style={{ width: getScoreWidth(match.matchScore.aiMatchScore) }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${getScoreColor(match.matchScore.aiMatchScore)}`}>
                          {match.matchScore.aiMatchScore}%
                        </span>
                      </div>
                    )}
                    
                    {/* Combined score (only show if both scores available) */}
                    {useAIMatching && match.matchScore.combinedScore !== undefined && (
                      <div className="flex items-center">
                        <div className="text-xs text-gray-500 w-28">Combined Score:</div>
                        <div className="w-28 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full" 
                            style={{ width: getScoreWidth(match.matchScore.combinedScore) }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${getScoreColor(match.matchScore.combinedScore)}`}>
                          {match.matchScore.combinedScore}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="flex space-x-2">
                  <a
                    href={match.bursary.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Apply
                  </a>
                  <button
                    onClick={() => toggleMatchDetails(match.bursary._id)}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {expandedMatches.includes(match.bursary._id) ? 'Less Info' : 'More Info'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Deadline: {formatDate(match.bursary.deadline)}
                </p>
              </div>
            </div>
            
            {expandedMatches.includes(match.bursary._id) && (
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                {/* Basic info */}
                <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Amount:</span>
                    <p className="text-sm font-medium">{formatCurrency(match.bursary.awardAmount)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Field of Study:</span>
                    <p className="text-sm">{match.bursary.fieldOfStudy.join(", ")}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Academic Level:</span>
                    <p className="text-sm">{match.bursary.academicLevel.join(", ")}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Financial Need:</span>
                    <p className="text-sm capitalize">{match.bursary.financialNeedLevel}</p>
                  </div>
                </div>
                
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                  <QuestionMarkCircleIcon className="w-5 h-5 mr-1" />
                  Why We Matched You
                </h4>
                
                {/* Conversational explanation */}
                <div className="mb-4 p-3 bg-white dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800/30">
                  <p className="text-gray-700 dark:text-gray-200 italic">
                    {match.matchScore.conversationalExplanation}
                  </p>
                </div>
                
                {/* Show AI explanation if available */}
                {useAIMatching && match.matchScore.aiMatchExplanation && (
                  <div className="mb-4">
                    <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2 flex items-center">
                      <SparklesIcon className="w-5 h-5 mr-1" />
                      AI Match Reasoning
                    </h4>
                    <div className="p-3 bg-white dark:bg-purple-900/30 rounded-lg border border-purple-100 dark:border-purple-800/30">
                      <p className="text-gray-700 dark:text-gray-200 italic">
                        {match.matchScore.aiMatchExplanation}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Score breakdown */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-500">Financial Need (40%)</div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: getScoreWidth(match.matchScore.breakdown.financialNeed) }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500">Academic Merit (30%)</div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: getScoreWidth(match.matchScore.breakdown.academicMerit) }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500">Extracurriculars (20%)</div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: getScoreWidth(match.matchScore.breakdown.extracurriculars) }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500">Demographics (10%)</div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: getScoreWidth(match.matchScore.breakdown.demographics) }} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Match reasons */}
                  <div className="space-y-2">
                    {match.matchScore.reasons.length > 0 ? (
                      match.matchScore.reasons.map((reason, i) => (
                        <div key={i} className="text-sm">
                          {reason}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm">
                        This bursary appears to be a potential match based on your profile information.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 