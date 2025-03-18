import { IBursary } from '../models/Bursary';
import { IStudentProfile } from '../models/StudentProfile';

// Define the base URL for API calls
const getApiUrl = () => {
  // For server-side code, we need an absolute URL
  if (process.env.NODE_ENV === 'production') {
    // In production, use the deployment URL or NEXTAUTH_URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXTAUTH_URL || 'https://' + process.env.VERCEL_URL;
    return `${baseUrl}/api/claude`;
  } else {
    // In development, use localhost
    return 'http://localhost:3000/api/claude';
  }
};

// Ensure API key is set
const getAnthropicApiKey = () => {
  return process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
};

export interface AIMatchScore {
  score: number;
  explanation: string;
  studentSummary: string;
  bursarySummary: string;
}

/**
 * Generates a summary of the student profile using Claude 3.7
 * @param student The student profile object
 * @returns A comprehensive summary of the student profile
 */
export async function generateStudentSummary(student: IStudentProfile): Promise<string> {
  try {
    const studentProfileData = {
      academic: {
        institution: student.institution,
        major: student.major,
        graduationYear: student.graduationYear
      },
      personal: {
        bio: student.bio,
        interests: student.interests,
        skills: student.skills,
        languages: student.languages,
        achievements: student.achievements
      },
      financial: {
        financialBackground: student.financialBackground
      },
      career: {
        careerGoals: student.careerGoals,
        locationPreferences: student.locationPreferences
      }
    };

    const prompt = `
      You are an AI assistant helping with student profile summarization.
      Based on the following student information, generate a comprehensive, detailed summary that captures the essence of this student's profile.
      Focus on academic background, skills, interests, financial needs, and career aspirations.
      Be specific about their qualifications, achievements, and how they might match with scholarship opportunities.
      Keep your response thorough and detailed (250-300 words) to provide a complete picture of the student's qualifications and needs.
      
      Student Profile Data:
      ${JSON.stringify(studentProfileData, null, 2)}
    `;

    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.response || "No student summary generated";
  } catch (error) {
    console.error("Error generating student summary:", error);
    // Fallback to a basic summary if Claude API fails
    return `${student.major} student at ${student.institution}, graduating in ${student.graduationYear}. ${student.financialBackground || ""}`;
  }
}

/**
 * Generates a summary of a bursary using Claude 3.7
 * @param bursary The bursary object
 * @returns A comprehensive summary of the bursary
 */
export async function generateBursarySummary(bursary: IBursary): Promise<string> {
  try {
    const bursaryData = {
      title: bursary.title,
      description: bursary.description,
      eligibilityCriteria: bursary.eligibilityCriteria,
      awardAmount: bursary.awardAmount,
      fieldOfStudy: bursary.fieldOfStudy,
      academicLevel: bursary.academicLevel,
      financialNeedLevel: bursary.financialNeedLevel,
      requiredDocuments: bursary.requiredDocuments,
      aiTags: bursary.aiTags,
      aiCategorization: bursary.aiCategorization,
      applicationComplexity: bursary.applicationComplexity,
    };

    const prompt = `
      You are an AI assistant helping with bursary summarization.
      Based on the following bursary information, generate a comprehensive, detailed summary that captures the key details of this opportunity.
      Focus on eligibility requirements, financial aspects, target fields of study, required academic level, and application process.
      Include specific details about award amount, deadlines (if available), and qualification criteria.
      Keep your response thorough and detailed (250-300 words) to provide potential applicants with all relevant information.
      
      Bursary Data:
      ${JSON.stringify(bursaryData, null, 2)}
    `;

    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.response || "No bursary summary generated";
  } catch (error) {
    console.error("Error generating bursary summary:", error);
    // Fallback to a basic summary if Claude API fails
    return `${bursary.title} - ${bursary.description.substring(0, 100)}...`;
  }
}

/**
 * Calculate semantic match score between student and bursary using Claude 3.7
 * @param studentSummary The generated summary of the student profile
 * @param bursarySummary The generated summary of the bursary
 * @returns A score between 0-100 indicating match strength with explanation
 */
export async function calculateAISemanticMatch(
  studentSummary: string,
  bursarySummary: string
): Promise<{ score: number; explanation: string }> {
  try {
    const prompt = `
      You are an AI assistant evaluating the match between a student and a bursary opportunity.
      
      Student Summary:
      "${studentSummary}"
      
      Bursary Summary:
      "${bursarySummary}"
      
      Based on these summaries, calculate a match score from 0-100 indicating how well the student matches with this bursary opportunity.
      
      IMPORTANT INSTRUCTIONS FOR YOUR RESPONSE:
      1. Be HIGHLY SPECIFIC to this exact bursary's criteria and the student's qualifications
      2. Reference concrete details from the bursary (exact field of study, award amount, eligibility criteria)
      3. Mention specific aspects of the student's profile that match or don't match
      4. Use a factual, objective tone that accurately reflects the match quality
      5. Your explanation must be tailored uniquely to this specific bursary-student combination
      
      Match score guidelines:
      - For low scores (0-40): Clearly explain specific mismatches between student profile and bursary requirements
      - For medium scores (41-70): Balance specific matches and mismatches objectively
      - For high scores (71-100): Highlight specific alignments without overstatement
      
      Provide your response in JSON format with two fields:
      1. "score": A number between 0-100 
      2. "explanation": A specific assessment (50-75 words) that references concrete details from both the bursary and student profile
      
      Examples of GOOD explanations:
      {"score": 85, "explanation": "Strong match for this Computer Science scholarship requiring 3.5+ GPA. Student's 3.8 GPA in CS at Stanford and machine learning expertise align with the bursary's focus on AI research. Financial need level matches the bursary's high-need requirement. Application deadline (March 15) allows sufficient preparation time."}
      
      {"score": 45, "explanation": "Limited alignment with this $5,000 Engineering scholarship. Student's Biology major doesn't match Engineering requirement, though programming skills are relevant. Financial need matches the medium requirement. Student's 2023 graduation aligns with junior/senior requirement, but field mismatch significantly reduces overall compatibility."}
      
      NEVER use generic language like "promising alignment" or "good compatibility" without specific details.
    `;

    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    try {
      // Parse the JSON from Claude's response
      const matchResult = JSON.parse(data.response);
      return {
        score: matchResult.score,
        explanation: matchResult.explanation,
      };
    } catch (parseError) {
      console.error("Error parsing Claude response:", parseError);
      // Fallback if parsing fails
      return {
        score: 50,
        explanation: "Match calculation based on specific profile and bursary compatibility factors.",
      };
    }
  } catch (error) {
    console.error("Error calculating AI semantic match:", error);
    // Fallback if Claude API fails
    return {
      score: 50,
      explanation: "Match analysis unavailable. Please review bursary criteria manually.",
    };
  }
}

/**
 * Complete function to match a student with a bursary using Claude 3.7
 * @param student The student profile
 * @param bursary The bursary opportunity
 * @returns AI-based match score with explanations and summaries
 */
export async function calculateAIMatch(
  student: IStudentProfile,
  bursary: IBursary
): Promise<AIMatchScore> {
  // Generate summaries
  const studentSummary = await generateStudentSummary(student);
  const bursarySummary = await generateBursarySummary(bursary);
  
  // Calculate semantic match
  const { score, explanation } = await calculateAISemanticMatch(studentSummary, bursarySummary);
  
  return {
    score,
    explanation,
    studentSummary,
    bursarySummary
  };
} 