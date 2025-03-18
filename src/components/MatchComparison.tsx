import React, { useState } from 'react';
import { SparklesIcon, QuestionMarkCircleIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { MatchScore } from '@/lib/matchingEngine';

interface MatchComparisonProps {
  matchScore: MatchScore;
  showAIMatch: boolean;
}

export default function MatchComparison({ matchScore, showAIMatch }: MatchComparisonProps) {
  const [studentSummaryExpanded, setStudentSummaryExpanded] = useState(false);
  const [bursarySummaryExpanded, setBursarySummaryExpanded] = useState(false);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-gray-600 dark:text-gray-400";
  };
  
  const hasAIMatch = showAIMatch && matchScore.aiMatchScore !== undefined;
  
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Match Analysis
      </h3>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Traditional Match */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/30">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
            <QuestionMarkCircleIcon className="w-5 h-5 mr-1" />
            Traditional Match Score
          </h4>
          
          <div className="flex items-center mb-4">
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full mr-3 overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${matchScore.total}%` }}
              />
            </div>
            <span className={`text-lg font-medium ${getScoreColor(matchScore.total)}`}>
              {matchScore.total}%
            </span>
          </div>
          
          <div className="text-gray-700 dark:text-gray-300 italic mb-4">
            {matchScore.conversationalExplanation}
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Financial Need (40%)</div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${matchScore.breakdown.financialNeed}%` }} />
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Academic Merit (30%)</div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${matchScore.breakdown.academicMerit}%` }} />
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Extracurriculars (20%)</div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${matchScore.breakdown.extracurriculars}%` }} />
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Demographics (10%)</div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${matchScore.breakdown.demographics}%` }} />
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Match */}
        {hasAIMatch && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800/30">
            <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2 flex items-center">
              <SparklesIcon className="w-5 h-5 mr-1" />
              Claude 3.7 Match Analysis
            </h4>
            
            <div className="flex items-center mb-4">
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full mr-3 overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full" 
                  style={{ width: `${matchScore.aiMatchScore}%` }}
                />
              </div>
              <span className={`text-lg font-medium ${getScoreColor(matchScore.aiMatchScore || 0)}`}>
                {matchScore.aiMatchScore}%
              </span>
            </div>
            
            <div className="text-gray-700 dark:text-gray-300 italic mb-4">
              {matchScore.aiMatchExplanation}
            </div>
            
            {matchScore.studentSummary && matchScore.bursarySummary && (
              <div className="space-y-4 mt-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Profile Summary</h5>
                  <div className={`text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 ${!studentSummaryExpanded && 'line-clamp-3'}`}>
                    {matchScore.studentSummary}
                  </div>
                  <button 
                    onClick={() => setStudentSummaryExpanded(!studentSummaryExpanded)}
                    className="mt-1 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center"
                  >
                    {studentSummaryExpanded ? (
                      <>
                        <ChevronUpIcon className="h-3 w-3 mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDownIcon className="h-3 w-3 mr-1" />
                        Show More
                      </>
                    )}
                  </button>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bursary Summary</h5>
                  <div className={`text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 ${!bursarySummaryExpanded && 'line-clamp-3'}`}>
                    {matchScore.bursarySummary}
                  </div>
                  <button 
                    onClick={() => setBursarySummaryExpanded(!bursarySummaryExpanded)}
                    className="mt-1 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center"
                  >
                    {bursarySummaryExpanded ? (
                      <>
                        <ChevronUpIcon className="h-3 w-3 mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDownIcon className="h-3 w-3 mr-1" />
                        Show More
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Combined Score */}
        {hasAIMatch && matchScore.combinedScore !== undefined && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800/30">
            <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
              Combined Match Score
            </h4>
            
            <div className="flex items-center">
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full mr-3 overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${matchScore.combinedScore}%` }}
                />
              </div>
              <span className={`text-lg font-medium ${getScoreColor(matchScore.combinedScore)}`}>
                {matchScore.combinedScore}%
              </span>
            </div>
            
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-between mb-1">
                <span>Traditional Match: {matchScore.total}%</span>
                <span>AI Match: {matchScore.aiMatchScore}%</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: '50%' }}></div>
                <div className="bg-purple-500 h-full" style={{ width: '50%' }}></div>
              </div>
              <div className="text-center mt-1">
                <span className="text-xs">50/50 weighted average</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 