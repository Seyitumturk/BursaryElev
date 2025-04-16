import { IBursary } from '../models/Bursary';
import { IStudentProfile } from '../models/StudentProfile';
import { calculateAIMatch, AIMatchScore } from './aiMatchingEngine';

// Updated interface reflecting Eligibility and AI Suitability scores
export interface MatchScore {
  eligibilityScore: number; // Renamed from 'total'
  breakdown: {
    fieldOfStudy: number;    // New breakdown field
    academicLevel: number;   // New breakdown field
    financialNeed: number;
    demographics: number;
    // Removed 'academicMerit' and 'extracurriculars' as distinct weighted categories
  };
  reasons: string[];
  conversationalExplanation: string; 
  // AI-generated fields remain
  aiMatchScore?: number; // Represents AI Suitability Score
  aiMatchExplanation?: string;
  studentSummary?: string;
  bursarySummary?: string;
  // Removed 'combinedScore'
}

/**
 * Calculates match scores between a student profile and a bursary.
 * Focuses on an objective Eligibility Score and an AI-driven Suitability Score.
 * @param student Student profile
 * @param bursary Bursary listing
 * @param includeAI Whether to include AI-based suitability matching
 * @returns MatchScore object with eligibility and potentially AI scores
 */
export async function calculateMatch(
  student: IStudentProfile, 
  bursary: IBursary,
  includeAI: boolean = false
): Promise<MatchScore> {
  // Initialize scores for Eligibility breakdown
  const breakdown = {
    fieldOfStudy: 0,      // 40% weight
    academicLevel: 0,    // 25% weight
    financialNeed: 0,     // 20% weight
    demographics: 0       // 15% weight
  };
  
  const reasons: string[] = [];
  
  // 1. Field of Study Match (40%)
  const fieldOfStudyScore = calculateFieldOfStudyScore(student, bursary);
  breakdown.fieldOfStudy = fieldOfStudyScore.score;
  if (fieldOfStudyScore.reason) {
    reasons.push(fieldOfStudyScore.reason);
  }

  // 2. Academic Level Match (25%)
  const academicLevelScore = calculateAcademicLevelScore(student, bursary);
  breakdown.academicLevel = academicLevelScore.score;
  if (academicLevelScore.reason) {
    reasons.push(academicLevelScore.reason);
  }

  // 3. Financial Need Match (20%)
  const financialNeedScore = calculateFinancialNeedScore(student, bursary);
  breakdown.financialNeed = financialNeedScore.score;
  if (financialNeedScore.reason) {
    reasons.push(financialNeedScore.reason);
  }

  // 4. Demographic/Location Match (15%)
  const demographicScore = calculateDemographicScore(student, bursary);
  breakdown.demographics = demographicScore.score;
  if (demographicScore.reason) {
    reasons.push(demographicScore.reason);
  }
  
  // Calculate final Eligibility Score (weighted average)
  const eligibilityScore = Math.round(
    (breakdown.fieldOfStudy * 0.40) +
    (breakdown.academicLevel * 0.25) +
    (breakdown.financialNeed * 0.20) +
    (breakdown.demographics * 0.15)
  );
  
  // Generate conversational explanation based on eligibility
  // We might adjust this later if the AI explanation should always take precedence
  const conversationalExplanation = generateConversationalExplanation(
    student,
    bursary,
    eligibilityScore, // Use eligibility score here
    breakdown,
    reasons
  );
  
  // Create the base match score object
  const matchScore: MatchScore = {
    eligibilityScore, // Use the new name
    breakdown, // Contains the new breakdown fields
    reasons: reasons.slice(0, 3), 
    conversationalExplanation
    // aiMatchScore and others added below if includeAI is true
  };
  
  // If AI matching is requested, calculate and add AI Suitability Score
  if (includeAI) {
    try {
      console.log(`Calculating AI match for bursary: ${bursary.title} (${bursary._id})`);
      const aiMatch: AIMatchScore = await calculateAIMatch(student, bursary);
      console.log(`AI Suitability Score calculated: ${aiMatch.score}/100`);
      
      matchScore.aiMatchScore = aiMatch.score;
      matchScore.aiMatchExplanation = aiMatch.explanation;
      matchScore.studentSummary = aiMatch.studentSummary;
      matchScore.bursarySummary = aiMatch.bursarySummary;
      
      // Optionally: Always prefer AI explanation if available
      if (aiMatch.explanation) {
        matchScore.conversationalExplanation = aiMatch.explanation;
      }
      
      // REMOVED combinedScore calculation

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error calculating AI Suitability Score for bursary ${bursary._id}:`, errorMessage);
      if (error instanceof Error && error.cause) {
        console.error("Error cause:", error.cause);
      }
      
      // Set default AI values on failure
      matchScore.aiMatchScore = undefined; // Indicate AI score calculation failed
      matchScore.aiMatchExplanation = "AI suitability analysis not available due to an error.";
      // eligibilityScore remains as calculated
    }
  }
  
  return matchScore;
}

interface ScoreWithReason {
  score: number;
  reason: string | null;
}

function calculateFinancialNeedScore(student: IStudentProfile, bursary: IBursary): ScoreWithReason {
  let score = 0;
  let reason = null;
  
  // Default medium match if no financial background provided
  if (!student.financialBackground) {
    return { score: 50, reason: null };
  }
  
  // Parse financial need level from bursary
  const bursaryNeedLevel = bursary.financialNeedLevel || 'medium';
  
  // Simple keyword matching for financial background
  const lowNeedKeywords = ['wealthy', 'comfortable', 'stable', 'good financial standing'];
  const mediumNeedKeywords = ['average', 'middle-class', 'moderate', 'some support'];
  const highNeedKeywords = ['struggling', 'limited', 'difficult', 'financial hardship', 'low income', 'unemployed', 'poverty'];
  
  let studentNeedLevel = 'medium';
  const lowerCaseBackground = student.financialBackground.toLowerCase();
  
  if (highNeedKeywords.some(keyword => lowerCaseBackground.includes(keyword.toLowerCase()))) {
    studentNeedLevel = 'high';
  } else if (lowNeedKeywords.some(keyword => lowerCaseBackground.includes(keyword.toLowerCase()))) {
    studentNeedLevel = 'low';
  }
  
  // Match score based on alignment between student need and bursary requirements
  if (bursaryNeedLevel === 'high') {
    if (studentNeedLevel === 'high') {
      score = 100;
      reason = "Strong match for financial need because your background indicates high financial need, which aligns perfectly with this bursary's requirements";
    } else if (studentNeedLevel === 'medium') {
      score = 60;
      reason = "Partial match for financial need because your background indicates moderate financial need, while this bursary prioritizes high financial need";
    } else {
      score = 20;
    }
  } else if (bursaryNeedLevel === 'medium') {
    if (studentNeedLevel === 'medium') {
      score = 80;
      reason = "Good match for financial need because your background indicates moderate financial need, which aligns well with this bursary's requirements";
    } else {
      score = 50;
    }
  } else { // low need level bursary
    if (studentNeedLevel === 'low') {
      score = 70;
      reason = "Match for financial criteria as this bursary does not emphasize financial need";
    } else {
      score = 60;
    }
  }
  
  return { score, reason };
}

// NEW: calculateFieldOfStudyScore (replaces part of academicMerit)
function calculateFieldOfStudyScore(student: IStudentProfile, bursary: IBursary): ScoreWithReason {
  let score = 0;
  let reason = null;
  const studentMajorLower = student.major.toLowerCase();
  const requiredFieldsLower = bursary.fieldOfStudy.map(f => f.toLowerCase());

  const isMatch = requiredFieldsLower.some(field => 
    studentMajorLower.includes(field) || 
    field.includes(studentMajorLower) || // Handle cases where major is more specific than required field
    field.includes('any') || 
    field.includes('all')
  );

  if (isMatch) {
    score = 100;
    reason = `Your major (${student.major}) aligns with the required field(s) of study (${bursary.fieldOfStudy.join(', ')}).`;
  } else {
    score = 0; // Hard mismatch for eligibility
    reason = `Your major (${student.major}) does not match the required field(s) of study (${bursary.fieldOfStudy.join(', ')}).`;
  }
  
  return { score, reason };
}

// NEW: calculateAcademicLevelScore (replaces part of academicMerit)
function calculateAcademicLevelScore(student: IStudentProfile, bursary: IBursary): ScoreWithReason {
  let score = 0;
  let reason = null;
  const requiredLevelsLower = bursary.academicLevel.map(l => l.toLowerCase());

  if (requiredLevelsLower.length === 0 || requiredLevelsLower.includes('any') || requiredLevelsLower.includes('all')) {
    score = 100; // No specific level required
    reason = "This bursary is open to students at any academic level.";
    return { score, reason };
  }

  const currentYear = new Date().getFullYear();
  const yearsToGraduation = student.graduationYear - currentYear;
  let studentLevel = '';
  
  // Determine student level more robustly
  if (yearsToGraduation <= 0) studentLevel = 'graduate'; // Or Post-Graduate, PhD etc.
  else if (yearsToGraduation === 1) studentLevel = 'final year undergraduate'; // More specific
  else if (yearsToGraduation === 2) studentLevel = '3rd year undergraduate'; // Assuming 4-year degree
  else if (yearsToGraduation === 3) studentLevel = '2nd year undergraduate';
  else if (yearsToGraduation >= 4) studentLevel = '1st year undergraduate';
  else studentLevel = 'undergraduate'; // Fallback

  const studentLevelLower = studentLevel.toLowerCase();

  const isMatch = requiredLevelsLower.some(level => {
    if (studentLevelLower.includes(level)) return true;
    if (level === 'undergraduate' && studentLevelLower.includes('undergraduate')) return true;
    if (level === 'graduate' && studentLevelLower.includes('graduate')) return true;
    // Add more specific checks if needed (e.g., 'masters', 'phd')
    return false;
  });

  if (isMatch) {
    score = 100;
    reason = `Your academic level (${studentLevel}) matches the requirements (${bursary.academicLevel.join(', ')}).`;
  } else {
    score = 0; // Hard mismatch for eligibility
    reason = `Your academic level (${studentLevel}) does not meet the requirements (${bursary.academicLevel.join(', ')}).`;
  }

  return { score, reason };
}

function calculateDemographicScore(student: IStudentProfile, bursary: IBursary): ScoreWithReason {
  // This is a simplified implementation - in a real system, this would involve
  // more sophisticated demographic matching based on eligibility criteria
  
  let score = 0;
  let reason = null;
  
  // Simple matching based on eligibility criteria text
  if (bursary.eligibilityCriteria && student.locationPreferences) {
    // Check if any of the student's location preferences appear in the eligibility criteria
    const locationMatch = student.locationPreferences.some(location =>
      bursary.eligibilityCriteria.toLowerCase().includes(location.toLowerCase())
    );
    
    if (locationMatch) {
      score += 60;
      
      // Find the matching location for the reason
      const matchingLocation = student.locationPreferences.find(location =>
        bursary.eligibilityCriteria.toLowerCase().includes(location.toLowerCase())
      );
      
      reason = `Additional consideration: Your location preference (${matchingLocation}) matches with this bursary's eligibility criteria`;
    }
  }
  
  // If eligibility criteria mentions languages and student has matching languages
  if (bursary.eligibilityCriteria && student.languages && student.languages.length > 0) {
    const languageMatch = student.languages.some(language =>
      bursary.eligibilityCriteria.toLowerCase().includes(language.toLowerCase())
    );
    
    if (languageMatch) {
      score += 40;
      
      if (!reason) {
        // Find the matching language for the reason
        const matchingLanguage = student.languages.find(language =>
          bursary.eligibilityCriteria.toLowerCase().includes(language.toLowerCase())
        );
        
        reason = `Additional consideration: Your language skills (${matchingLanguage}) are mentioned in this bursary's eligibility criteria`;
      }
    }
  }
  
  // Normalize score to 100
  score = Math.min(score, 100);
  
  return { score, reason };
}

/**
 * Generates explanation text for why a bursary matches a student profile
 * @param matchScore The match score object with breakdown and reasons
 * @returns String explanation of the match
 */
export function generateMatchExplanation(matchScore: MatchScore): string {
  if (matchScore.reasons.length === 0) {
    return "This bursary appears to be a potential match based on your profile information.";
  }
  
  return matchScore.reasons.join("\n\n");
}

// Updated: generateConversationalExplanation to reflect new breakdown and score name
function generateConversationalExplanation(
  student: IStudentProfile,
  bursary: IBursary,
  eligibilityScore: number, // Changed parameter name
  breakdown: {
    fieldOfStudy: number;
    academicLevel: number;
    financialNeed: number;
    demographics: number;
  },
  reasons: string[]
): string {
  let explanation = "";
  
  // Base explanation on Eligibility Score
  if (eligibilityScore >= 95) {
    explanation = `Based on the core requirements, this looks like an excellent eligibility match (${eligibilityScore}%). `;
  } else if (eligibilityScore >= 75) {
    explanation = `You meet most of the core eligibility requirements for the ${bursary.title} bursary (${eligibilityScore}%). `;
  } else if (eligibilityScore >= 50) {
    explanation = `You meet some eligibility requirements for the ${bursary.title} (${eligibilityScore}% match), but there may be gaps. `;
  } else {
    explanation = `Based on the core requirements, you may not be eligible for the ${bursary.title} bursary (${eligibilityScore}% match). `;
  }
  
  // Highlight key reasons (especially mismatches if score is low)
  if (eligibilityScore < 75 && reasons.length > 0) {
    const mismatchReasons = reasons.filter(r => 
        breakdown.fieldOfStudy === 0 || 
        breakdown.academicLevel === 0 || 
        breakdown.demographics < 50 || // Example threshold
        breakdown.financialNeed < 50
    );
    if (mismatchReasons.length > 0) {
        explanation += `Key areas to check: ${mismatchReasons.join('. ')}. `;
    } else if (reasons.length > 0) {
        // If score is low but no hard mismatches, mention the top reason
        explanation += reasons[0].replace(/^Strong match for|^Good match for|^Partial match for|^Match for/i, 'Specifically, concerning') + '. ';
    }
  } else if (reasons.length > 0) {
      // If score is high, mention the top positive reason
      explanation += reasons[0].replace(/^Your /i, 'Your ') + '. ';
  }

  explanation += `Award amount: ${formatCurrency(bursary.awardAmount)}. Deadline: ${formatDate(bursary.deadline)}.`;

  return explanation;
}

// Helper formatting functions for the conversational explanation
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Gets recommended bursaries for a student with match explanations
 * @param student Student profile
 * @param bursaries All available bursaries
 * @param includeAI Whether to include AI-based matching (default: false)
 * @returns Bursaries sorted by match score with explanations
 */
export async function getRecommendedBursaries(
  student: IStudentProfile, 
  bursaries: IBursary[],
  includeAI: boolean = false
) {
  const matchPromises = bursaries.map(async (bursary) => {
    try {
      const matchScore = await calculateMatch(student, bursary, includeAI);
      return {
        bursary,
        matchScore
      };
    } catch (error) {
      console.error(`Error calculating match for bursary ${bursary._id}:`, error);
      const fallbackScore: MatchScore = {
        eligibilityScore: 0, // Default to 0 eligibility on error
        breakdown: { fieldOfStudy: 0, academicLevel: 0, financialNeed: 0, demographics: 0 },
        reasons: ["Match calculation failed."],
        conversationalExplanation: `Could not calculate match for ${bursary.title}. Please review manually.`
      };
      return {
        bursary,
        matchScore: fallbackScore
      };
    }
  });
  
  const matches = await Promise.all(matchPromises);
  
  // Sort primarily by eligibility, then potentially by AI score if available?
  // Or maybe keep sorting by eligibility only for a clear baseline?
  // Let's stick to sorting by eligibilityScore for now.
  return matches.sort((a, b) => b.matchScore.eligibilityScore - a.matchScore.eligibilityScore);
} 