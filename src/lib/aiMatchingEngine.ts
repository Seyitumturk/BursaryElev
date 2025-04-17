import { IBursary } from '../models/Bursary';
import { IStudentProfile } from '../models/StudentProfile';

/**
 * Get the correct API URL for Claude API calls
 * This properly handles development and production environments
 */
const getApiUrl = () => {
  // For client-side code (browser)
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/claude`;
  }
  
  // For server-side code (Node.js)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
                 process.env.NEXTAUTH_URL || 
                 (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  return `${baseUrl}/api/claude`;
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
    console.log(`Generating summary for student: Institution=${student.institution}, Major=${student.major}`);
    
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

    console.log('Student profile data for Claude:', JSON.stringify(studentProfileData).substring(0, 500) + '...');

    const prompt = `
      You are Claude, a helpful, friendly AI assistant analyzing a student's profile for bursary matches.
      
      I need you to craft a CONVERSATIONAL, PERSONALIZED summary of this student's profile, speaking directly TO the student in a warm, supportive tone.
      
      IMPORTANT TONE/STYLE REQUIREMENTS:
      - Use "you" language - speak DIRECTLY to the student
      - Be warm, encouraging and supportive but not overly enthusiastic
      - Sound like a helpful advisor who genuinely sees their potential
      - Be specific about their unique qualities, don't use generic praise
      - Keep your tone natural and conversational, not formal
      
      CONTENT REQUIREMENTS:
      1. Start with a friendly, personalized greeting acknowledging their major and institution
      2. Highlight 2-3 specific strengths from their profile (skills, achievements, etc.)
      3. Briefly mention their career goals and how they align with their background
      4. Add 1-2 specific funding opportunity suggestions based on their field/background
      5. Conclude with brief, genuine encouragement
      
      FORMAT:
      - Write this as a single, cohesive 4-5 paragraph message (200-250 words)
      - No bullet points, no headers, just a natural-sounding message
      - Avoid phrases like "Based on your profile" - just speak naturally
      
      CRITICAL: Only mention information EXPLICITLY included in their profile data. DO NOT make assumptions about their interests or create fictional details.
      
      Student Profile Data:
      ${JSON.stringify(studentProfileData, null, 2)}
    `;

    const apiUrl = getApiUrl();
    console.log(`Making student summary request to: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
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
 * Generates a summary of the bursary using Claude 3.7
 * @param bursary The bursary object
 * @returns A comprehensive summary of the bursary
 */
export async function generateBursarySummary(bursary: IBursary): Promise<string> {
  try {
    const bursaryData = {
      title: bursary.title,
      description: bursary.description,
      awardAmount: bursary.awardAmount,
      fieldOfStudy: bursary.fieldOfStudy,
      academicLevel: bursary.academicLevel,
      deadline: bursary.deadline,
      financialNeedLevel: bursary.financialNeedLevel,
      eligibilityCriteria: bursary.eligibilityCriteria,
      aiTags: bursary.aiTags,
      aiCategorization: bursary.aiCategorization,
      requiredDocuments: bursary.requiredDocuments,
      applicationUrl: bursary.applicationUrl,
      applicationComplexity: bursary.applicationComplexity
    };

    const prompt = `
      You are an AI assistant tasked with creating a clear, concise, and user-friendly summary of a bursary opportunity for students exploring their options.

      Your goal is to explain what this bursary is about, who it's for, and what the key requirements are in a conversational and easy-to-understand manner.
      
      TASK: Based on the provided bursary data, generate a summary covering the following points:
      1.  **Purpose/Goal:** Briefly explain the main goal or focus of this bursary (e.g., supporting STEM students, encouraging community leadership).
      2.  **Ideal Candidate:** Describe the type of student the bursary aims to support (mention key criteria like field of study, academic level, financial need, etc.).
      3.  **Key Eligibility Requirements:** List the most important requirements students MUST meet (e.g., specific major, minimum GPA if mentioned, citizenship, enrollment status).
      4.  **Award Details:** State the award amount and application deadline clearly.
      5.  **Application Insight:** Briefly mention any notable aspects of the application (e.g., required documents, complexity level).

      TONE & STYLE:
      - Conversational and informative.
      - Clear and direct language.
      - Structure the information logically, perhaps using short paragraphs or bullet points for clarity.
      - Avoid jargon where possible.
      - Aim for approximately 150-200 words.
      
      FORMAT REQUIREMENTS:
      - You can use paragraphs, headings (like **Eligibility:**), and/or bullet points (using '-') for readability.
      - Present the information in a way that helps a student quickly understand if this bursary is relevant to them.
      
      Bursary Data:
      ${JSON.stringify(bursaryData, null, 2)}
    `;

    const apiUrl = getApiUrl();
    console.log(`Making bursary summary request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error generating bursary summary:", error);
    // Return a more specific error message instead of a generic fallback
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `Error generating AI summary for ${bursary.title}: ${errorMessage}. Please try again later or contact support.`;
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
      You are an AI assistant evaluating the SUITABILITY and POTENTIAL FIT between a student and a bursary opportunity, going beyond basic eligibility.
      Assume basic eligibility checks (field of study, academic level) have been performed elsewhere. 
      Focus on the nuanced alignment between the student's profile and the bursary's goals and focus.
      
      Student Summary (Highlights skills, goals, experiences):
      "${studentSummary}"
      
      Bursary Summary (Describes purpose, ideal candidate, specific criteria beyond academics):
      "${bursarySummary}"
      
      TASK: Calculate an AI SUITABILITY score (0-100) representing how well this student's PROFILE aligns with the INTENT and specific FOCUS AREAS of this bursary.
      
      EVALUATION CRITERIA (Focus on these aspects):
      1. Skill & Experience Alignment (35% weight)
         - Do the student's specific skills, projects, or experiences strongly align with requirements or preferences mentioned in the bursary (e.g., leadership, research, specific software, community involvement)?
         - How relevant is their background to the bursary's specific domain or purpose?
      
      2. Career Goal / Bursary Purpose Alignment (30% weight)
         - Do the student's stated career goals resonate with the bursary's mission or the field it supports?
         - Does the bursary support a path the student seems genuinely interested in?
      
      3. Financial Need Context (if applicable) (20% weight)
         - Considering the bursary's stated financial need level, does the student's situation (as described in their summary) seem appropriate for this type of award?
         - Does the bursary aim to support students with specific financial circumstances mentioned by the student?
      
      4. Overall Profile Resonance (15% weight)
         - Does the student's overall profile (interests, achievements, bio) paint a picture of someone who would be a strong candidate for *this specific* bursary?
         - Are there unique aspects of the student profile that align exceptionally well with unique aspects of the bursary?

      SCORE GUIDELINES (Reflecting Suitability):
      - 90-100: Exceptional fit; student profile strongly resonates with the bursary's specific aims and desired candidate profile.
      - 70-89: Strong suitability; clear alignment in key areas like skills, goals, or specific criteria.
      - 50-69: Moderate suitability; some alignment, but perhaps less targeted to this specific opportunity compared to others.
      - 30-49: Limited suitability; profile aligns weakly with the bursary's specific focus.
      - 0-29: Poor suitability; profile seems misaligned with the bursary's intent or target candidate.
      
      YOUR RESPONSE MUST:
      1. Focus on the NUANCE of the match, not just basic eligibility.
      2. Reference SPECIFIC details from BOTH summaries (skills, goals, bursary focus) to justify the score.
      3. Provide a clear, concise explanation (75-100 words) highlighting the key reasons for the suitability score.
      4. Output in JSON format with "score" (0-100 number) and "explanation" (string).
    `;

    const apiUrl = getApiUrl();
    console.log(`Making AI match request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Clean the raw response string from Claude API
    let rawResponse = data.response || "";
    rawResponse = rawResponse.trim();
    if (rawResponse.startsWith("```json")) {
      rawResponse = rawResponse.substring(7);
    }
    if (rawResponse.endsWith("```")) {
      rawResponse = rawResponse.substring(0, rawResponse.length - 3);
    }
    rawResponse = rawResponse.trim(); // Trim again after removing fences

    try {
      // Parse the cleaned JSON response
      const result = JSON.parse(rawResponse);
      const score = parseInt(result.score, 10);
      const explanation = result.explanation;
      
      console.log(`AI match calculated successfully: ${score}/100`);
      
      return { 
        score: isNaN(score) ? 50 : score, 
        explanation: explanation || "No explanation provided" 
      };
    } catch (parseError) {
      console.error("Error parsing AI match response:", parseError);
      console.log("Raw response:", data.response); // Log original raw response for debugging
      
      // Try to extract just the score and explanation if the response is not valid JSON
      // Use the cleaned rawResponse for extraction attempts
      const scoreMatch = rawResponse.match(/score["\s:]+(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 50;

      const explanationMatch = rawResponse.match(/explanation["\s:]+"(.*?)"/i);
      const extractedExplanation = explanationMatch ? explanationMatch[1] : "Unable to parse the full explanation.";
      
      return { 
        score, 
        explanation: extractedExplanation 
      };
    }
  } catch (error) {
    console.error("Error calculating AI semantic match:", error);
    return { score: 50, explanation: "Error calculating match score." };
  }
}

/**
 * Calculate an AI-enhanced match score between a student and bursary
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