import { IBursary } from '../models/Bursary';
import { IStudentProfile } from '../models/StudentProfile';
import { calculateAIMatch, AIMatchScore } from './aiMatchingEngine';

export interface MatchScore {
  total: number;
  breakdown: {
    financialNeed: number;
    academicMerit: number;
    extracurriculars: number;
    demographics: number;
  };
  reasons: string[];
  conversationalExplanation: string;
  // New AI-generated fields
  aiMatchScore?: number;
  aiMatchExplanation?: string;
  combinedScore?: number;
  studentSummary?: string;
  bursarySummary?: string;
}

/**
 * Calculates match score between a student profile and a bursary
 * @param student Student profile
 * @param bursary Bursary listing
 * @param includeAI Whether to include AI-based matching (optional, defaults to false)
 * @returns Match score (1-100) with breakdown and reasons
 */
export async function calculateMatch(
  student: IStudentProfile, 
  bursary: IBursary,
  includeAI: boolean = false
): Promise<MatchScore> {
  // Initialize scores
  const breakdown = {
    financialNeed: 0,     // 40% weight
    academicMerit: 0,     // 30% weight
    extracurriculars: 0,  // 20% weight 
    demographics: 0       // 10% weight
  };
  
  // Store match reasons
  const reasons: string[] = [];
  
  // 1. Financial Need Matching (40%)
  const financialNeedScore = calculateFinancialNeedScore(student, bursary);
  breakdown.financialNeed = financialNeedScore.score;
  if (financialNeedScore.reason) {
    reasons.push(financialNeedScore.reason);
  }
  
  // 2. Academic Merit Matching (30%)
  const academicMeritScore = calculateAcademicMeritScore(student, bursary);
  breakdown.academicMerit = academicMeritScore.score;
  if (academicMeritScore.reason) {
    reasons.push(academicMeritScore.reason);
  }
  
  // 3. Extracurricular Matching (20%)
  const extracurricularScore = calculateExtracurricularScore(student, bursary);
  breakdown.extracurriculars = extracurricularScore.score;
  if (extracurricularScore.reason) {
    reasons.push(extracurricularScore.reason);
  }
  
  // 4. Demographic Matching (10%)
  const demographicScore = calculateDemographicScore(student, bursary);
  breakdown.demographics = demographicScore.score;
  if (demographicScore.reason) {
    reasons.push(demographicScore.reason);
  }
  
  // Calculate total weighted score (1-100)
  const total = Math.round(
    (breakdown.financialNeed * 0.4) + 
    (breakdown.academicMerit * 0.3) + 
    (breakdown.extracurriculars * 0.2) + 
    (breakdown.demographics * 0.1)
  );
  
  // Generate conversational explanation
  const conversationalExplanation = generateConversationalExplanation(
    student,
    bursary,
    total,
    breakdown,
    reasons
  );
  
  // Create the base match score
  const matchScore: MatchScore = {
    total,
    breakdown,
    reasons: reasons.slice(0, 3), // Limit to top 3 reasons
    conversationalExplanation
  };
  
  // If AI matching is requested, add AI-based scores
  if (includeAI) {
    try {
      const aiMatch: AIMatchScore = await calculateAIMatch(student, bursary);
      
      // Add AI scores to the match result
      matchScore.aiMatchScore = aiMatch.score;
      matchScore.aiMatchExplanation = aiMatch.explanation;
      matchScore.studentSummary = aiMatch.studentSummary;
      matchScore.bursarySummary = aiMatch.bursarySummary;
      
      // If AI explanation is available, replace the conversational explanation with it
      if (aiMatch.explanation) {
        matchScore.conversationalExplanation = aiMatch.explanation;
      }
      
      // Calculate combined score (50% static, 50% AI)
      matchScore.combinedScore = Math.round((total + aiMatch.score) / 2);
    } catch (error) {
      console.error("Error calculating AI match:", error);
      // If AI matching fails, set default values
      matchScore.aiMatchScore = 0;
      matchScore.aiMatchExplanation = "AI matching not available at this time.";
      matchScore.combinedScore = total; // Use only static score if AI fails
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

function calculateAcademicMeritScore(student: IStudentProfile, bursary: IBursary): ScoreWithReason {
  let score = 0;
  let reason = null;
  
  // Check if field of study matches
  const fieldMatch = bursary.fieldOfStudy.some(field => 
    student.major.toLowerCase().includes(field.toLowerCase()) ||
    field.toLowerCase().includes('any') ||
    field.toLowerCase().includes('all')
  );
  
  // Check institution match (simple implementation - could be expanded)
  const institutionFactorScore = 20; // Base score for institution
  
  // Check if academic level matches (simple implementation)
  const currentYear = new Date().getFullYear();
  const yearsToGraduation = student.graduationYear - currentYear;
  let academicLevelScore = 0;
  
  // Map years to graduation to likely academic levels
  let studentAcademicLevel = '';
  if (yearsToGraduation <= 0) {
    studentAcademicLevel = 'graduate';
  } else if (yearsToGraduation === 1) {
    studentAcademicLevel = 'senior';
  } else if (yearsToGraduation === 2) {
    studentAcademicLevel = 'junior';
  } else if (yearsToGraduation === 3) {
    studentAcademicLevel = 'sophomore';
  } else {
    studentAcademicLevel = 'freshman';
  }
  
  const levelMatch = bursary.academicLevel.some(level => 
    level.toLowerCase().includes(studentAcademicLevel.toLowerCase()) ||
    level.toLowerCase().includes('any') ||
    level.toLowerCase().includes('all') ||
    level.toLowerCase() === 'undergraduate'
  );
  
  if (levelMatch) {
    academicLevelScore = 30;
  }
  
  // Field of study is the most important factor
  if (fieldMatch) {
    score += 50;
    reason = `Strong match for academic merit because your major (${student.major}) aligns with the bursary's field of study (${bursary.fieldOfStudy.join(', ')})`;
  } else {
    score += 10;
  }
  
  // Add other academic factors
  score += institutionFactorScore + academicLevelScore;
  
  // Normalize score to 100
  score = Math.min(score, 100);
  
  return { score, reason };
}

function calculateExtracurricularScore(student: IStudentProfile, bursary: IBursary): ScoreWithReason {
  let score = 0;
  let reason = null;
  
  // Check if student has relevant skills/achievements that match bursary tags or categories
  const tagsMatch = bursary.aiTags.some(tag => {
    // Check if tag appears in skills, interests, or achievements
    return (
      student.skills?.some(skill => skill.toLowerCase().includes(tag.toLowerCase())) ||
      student.interests?.some(interest => interest.toLowerCase().includes(tag.toLowerCase())) ||
      student.achievements?.some(achievement => achievement.toLowerCase().includes(tag.toLowerCase()))
    );
  });
  
  const categoriesMatch = bursary.aiCategorization.some(category => {
    // Check if category appears in skills, interests, or achievements
    return (
      student.skills?.some(skill => skill.toLowerCase().includes(category.toLowerCase())) ||
      student.interests?.some(interest => interest.toLowerCase().includes(category.toLowerCase())) ||
      student.achievements?.some(achievement => achievement.toLowerCase().includes(category.toLowerCase()))
    );
  });
  
  // Award points based on matches
  if (tagsMatch) {
    score += 50;
    
    // Find the matching tag for the reason
    const matchingTag = bursary.aiTags.find(tag => 
      student.skills?.some(skill => skill.toLowerCase().includes(tag.toLowerCase())) ||
      student.interests?.some(interest => interest.toLowerCase().includes(tag.toLowerCase())) ||
      student.achievements?.some(achievement => achievement.toLowerCase().includes(tag.toLowerCase()))
    );
    
    reason = `Strong match for extracurricular activities because your profile mentions ${matchingTag}, which aligns with this bursary's focus areas`;
  }
  
  if (categoriesMatch) {
    score += 30;
  }
  
  // Award points for having a variety of skills, interests, achievements
  const diversityScore = Math.min(
    ((student.skills?.length || 0) + 
     (student.interests?.length || 0) + 
     (student.achievements?.length || 0)) * 2, 
    20
  );
  
  score += diversityScore;
  
  // Normalize score to 100
  score = Math.min(score, 100);
  
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

/**
 * Generates a conversational explanation of why a student matches with a bursary
 */
function generateConversationalExplanation(
  student: IStudentProfile,
  bursary: IBursary,
  totalScore: number,
  breakdown: {
    financialNeed: number;
    academicMerit: number;
    extracurriculars: number;
    demographics: number;
  },
  reasons: string[]
): string {
  let explanation = "";
  
  // Start with overall match quality
  if (totalScore >= 85) {
    explanation = `This is an excellent match for you! With a match score of ${totalScore}%, the ${bursary.title} bursary aligns very well with your profile. `;
  } else if (totalScore >= 70) {
    explanation = `I've found a strong match for you! This ${bursary.title} bursary has a ${totalScore}% match with your profile. `;
  } else if (totalScore >= 50) {
    explanation = `The ${bursary.title} bursary looks like a decent match for you with a ${totalScore}% match score. `;
  } else {
    explanation = `While not a perfect fit, the ${bursary.title} bursary might still be worth considering (${totalScore}% match). `;
  }
  
  // Add details about the strongest match areas
  const strongestAreas = [];
  if (breakdown.financialNeed >= 70) strongestAreas.push("financial needs");
  if (breakdown.academicMerit >= 70) strongestAreas.push("academic background");
  if (breakdown.extracurriculars >= 70) strongestAreas.push("extracurricular activities");
  if (breakdown.demographics >= 70) strongestAreas.push("demographic criteria");
  
  if (strongestAreas.length > 0) {
    explanation += `It particularly complements your ${strongestAreas.join(" and ")}. `;
  }
  
  // Add specific details from the top matching reason
  if (reasons.length > 0) {
    // Clean up the reason text for conversational flow
    const topReason = reasons[0]
      .replace("Strong match for", "The match is especially strong in")
      .replace("Additional consideration:", "Also worth noting:");
    
    explanation += topReason + " ";
  }
  
  // Add information about the bursary amount and deadline
  explanation += `This opportunity offers ${formatCurrency(bursary.awardAmount)} `;
  
  // Add deadline information
  const deadlineDate = new Date(bursary.deadline);
  const today = new Date();
  const daysToDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  
  if (daysToDeadline < 0) {
    explanation += "though please note the deadline has passed. ";
  } else if (daysToDeadline === 0) {
    explanation += "and the application is due today! ";
  } else if (daysToDeadline <= 7) {
    explanation += `and applications are due very soon (${daysToDeadline} days left). `;
  } else if (daysToDeadline <= 30) {
    explanation += `with applications due in ${daysToDeadline} days. `;
  } else {
    explanation += `with plenty of time to apply (deadline: ${formatDate(bursary.deadline)}). `;
  }
  
  // Add a closing recommendation
  if (totalScore >= 70) {
    explanation += "I highly recommend applying for this opportunity.";
  } else if (totalScore >= 50) {
    explanation += "This could be a good opportunity to consider.";
  } else {
    explanation += "You might want to explore this alongside other better-matched opportunities.";
  }
  
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
  // Process all matches asynchronously
  const matchPromises = bursaries.map(async (bursary) => {
    const matchScore = await calculateMatch(student, bursary, includeAI);
    return {
      bursary,
      matchScore
    };
  });
  
  // Wait for all matches to be calculated
  const matches = await Promise.all(matchPromises);
  
  // Sort by match score (highest first)
  // If AI is included and we want to sort by AI score, we could change this logic
  return matches.sort((a, b) => b.matchScore.total - a.matchScore.total);
} 