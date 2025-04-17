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
  
  // --- Create the initial matchScore object ---
  // Initialize conversationalExplanation as a placeholder
  const matchScore: MatchScore = {
    eligibilityScore,
    breakdown,
    reasons: reasons.slice(0, 3),
    conversationalExplanation: "", // Placeholder
    // ai fields will be added if includeAI is true
  };

  // --- Handle AI Matching (if requested) ---
  let aiExplanationFromAI: string | undefined = undefined;
  if (includeAI) {
    try {
      console.log(`Calculating AI match for bursary: ${bursary.title} (${bursary._id})`);
      const aiMatch: AIMatchScore = await calculateAIMatch(student, bursary);
      console.log(`AI Suitability Score calculated: ${aiMatch.score}/100`);
      
      matchScore.aiMatchScore = aiMatch.score;
      matchScore.aiMatchExplanation = aiMatch.explanation; // Store raw AI explanation
      aiExplanationFromAI = aiMatch.explanation; // Keep track of it for the final combined explanation
      matchScore.studentSummary = aiMatch.studentSummary;
      matchScore.bursarySummary = aiMatch.bursarySummary;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error calculating AI Suitability Score for bursary ${bursary._id}:`, errorMessage);
      if (error instanceof Error && error.cause) {
        console.error("Error cause:", error.cause);
      }
      
      matchScore.aiMatchScore = undefined; // Indicate AI score calculation failed
      matchScore.aiMatchExplanation = "AI suitability analysis not available due to an error.";
      aiExplanationFromAI = matchScore.aiMatchExplanation; // Use error message in final explanation
      // eligibilityScore remains as calculated
    }
  }
  
  // --- Generate the final conversational explanation ---
  // This now happens *after* AI calculation, so aiExplanationFromAI is available
  matchScore.conversationalExplanation = generateConversationalExplanation(
    student,
    bursary,
    eligibilityScore,
    breakdown,
    reasons,
    bursary.eligibilityCriteria
  );

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
  let score = 0;
  let reason = null;
  let reasons: string[] = []; // Keep track of multiple demographic reasons
  const criteriaLower = bursary.eligibilityCriteria?.toLowerCase() || "";

  // Check location match (existing logic)
  if (criteriaLower && student.locationPreferences && student.locationPreferences.length > 0) {
    const matchingLocation = student.locationPreferences.find(location =>
      criteriaLower.includes(location.toLowerCase())
    );
    if (matchingLocation) {
      score += 40; // Adjusted weight
      reasons.push(`Location preference (${matchingLocation}) matches criteria`);
    }
  }

  // Check language match (existing logic)
  if (criteriaLower && student.languages && student.languages.length > 0) {
    const matchingLanguage = student.languages.find(language =>
      criteriaLower.includes(language.toLowerCase())
    );
    if (matchingLanguage) {
      score += 20; // Adjusted weight
      reasons.push(`Language skill (${matchingLanguage}) matches criteria`);
    }
  }

  // NEW: Check gender match
  if (criteriaLower && student.gender) { 
    const genderLower = student.gender.toLowerCase();
    if (criteriaLower.includes(genderLower)) {
      // Basic check, might need refinement (e.g., avoid matching "man" in "humanities")
      // Consider adding word boundary checks or more specific keywords if needed: (\b${genderLower}\b)
      score += 20; // Assign some weight
      reasons.push(`Gender (${student.gender}) matches criteria`);
    }
  }

  // NEW: Check citizenship match
  if (criteriaLower && student.citizenship && student.citizenship.length > 0) {
    const matchingCitizenship = student.citizenship.find(citizen => 
      criteriaLower.includes(citizen.toLowerCase())
    );
    if (matchingCitizenship) {
      score += 40; // Assign significant weight if citizenship is mentioned and matches
      reasons.push(`Citizenship (${matchingCitizenship}) matches criteria`);
    }
  }

  // Normalize score to 100
  score = Math.min(score, 100);
  
  // Combine reasons, prioritizing more specific ones if possible
  if (reasons.length > 0) {
     reason = `Demographic match: ${reasons.join('; ')}`;
  } else if (score > 0) {
     // This case shouldn't happen if scoring logic is correct, but as a fallback
     reason = "Partial demographic alignment based on criteria.";
  } // else reason remains null if score is 0
  
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
// And to incorporate AI explanation and raw criteria text
function generateConversationalExplanation(
  student: IStudentProfile,
  bursary: IBursary,
  eligibilityScore: number,
  breakdown: {
    fieldOfStudy: number;
    academicLevel: number;
    financialNeed: number;
    demographics: number;
  },
  reasons: string[],
  bursaryEligibilityCriteria?: string
): string {
  let explanation = "";
  const title = bursary.title || "this bursary";

  // --- Part 1: Eligibility Score Summary ---
  if (eligibilityScore >= 95) {
    explanation += `✅ Excellent eligibility match (${eligibilityScore}%) for ${title}. `;
  } else if (eligibilityScore >= 75) {
    explanation += `👍 Strong eligibility match (${eligibilityScore}%) for ${title}. `;
  } else if (eligibilityScore >= 50) {
    explanation += `🤔 Partial eligibility match (${eligibilityScore}%) for ${title}. `;
  } else {
    explanation += `❌ Low eligibility match (${eligibilityScore}%) for ${title}. `;
  }

  // --- Part 2: Key Eligibility Reasons (Structured) ---
  const keyReasons: string[] = [];
  if (breakdown.fieldOfStudy === 0) {
    keyReasons.push(`Field of study doesn't match (${student.major} vs ${bursary.fieldOfStudy.join('/') || 'N/A'}).`);
  } else if (breakdown.fieldOfStudy === 100 && eligibilityScore >= 75) {
     keyReasons.push(`Your major (${student.major}) is a good fit.`);
  }
  
  if (breakdown.academicLevel === 0) {
    keyReasons.push(`Academic level doesn't match.`);
  } else if (breakdown.academicLevel === 100 && eligibilityScore >= 75) {
     keyReasons.push(`Your academic level is suitable.`);
  }

  const financialReason = reasons.find(r => r.toLowerCase().includes('financial need'));
  if (financialReason && (eligibilityScore < 75 || breakdown.financialNeed < 60)) {
     keyReasons.push(financialReason); // Highlight potential financial mismatch
  } else if (financialReason && eligibilityScore >= 75) {
     keyReasons.push(`Financial need profile aligns.`);
  }

  const demographicReason = reasons.find(r => r.toLowerCase().includes('demographic match'));
  if (demographicReason && (eligibilityScore < 75 || breakdown.demographics < 60)) {
     keyReasons.push(demographicReason); // Highlight potential demographic mismatch
  } else if (demographicReason && eligibilityScore >= 75) {
     keyReasons.push(`Relevant demographic criteria met.`);
  }
  
  if (keyReasons.length > 0) {
     explanation += `Key factors: ${keyReasons.slice(0, 2).join(' ')} `; // Show top 1-2 reasons concisely
  }

  // --- Part 3: Mentioning Natural Language Criteria (Simple Check) ---
  // This is a basic implementation. Could be enhanced with NLP later.
  if (bursaryEligibilityCriteria && eligibilityScore >= 50) {
      explanation += `Review the specific criteria: "${bursaryEligibilityCriteria.substring(0, 100)}${bursaryEligibilityCriteria.length > 100 ? '...' : ''}". `;
  } else if (bursaryEligibilityCriteria && eligibilityScore < 50) {
       explanation += `Please carefully check the full criteria: "${bursaryEligibilityCriteria.substring(0, 100)}${bursaryEligibilityCriteria.length > 100 ? '...' : ''}". `;
  }

  // --- Part 5: Basic Bursary Info ---
  explanation += `

💰 Award: ${formatCurrency(bursary.awardAmount)} | 📅 Deadline: ${formatDate(bursary.deadline)}.`;

  return explanation.trim(); // Trim whitespace
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