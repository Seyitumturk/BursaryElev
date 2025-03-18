import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Environment variable for Claude API key should be set in .env.local
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || 'dummy-key-for-development';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// For development purposes, use a mock response if no API key is provided
const useMockResponse = !process.env.CLAUDE_API_KEY;

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request (commented out for development purposes)
    const { userId } = auth();
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Get prompt from request body
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing required parameter: prompt' },
        { status: 400 }
      );
    }

    console.log('API call with prompt:', prompt.substring(0, 100) + '...');

    // Use mock responses for development if no API key is set
    if (useMockResponse) {
      console.log('Using mock Claude response (no API key provided)');
      // Return a mock response for development
      return NextResponse.json({
        response: generateMockResponse(prompt)
      });
    }

    // Call Claude API
    const claudeResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20240229',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.json();
      console.error('Claude API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to communicate with Claude API', details: errorData },
        { status: 502 }
      );
    }

    const data = await claudeResponse.json();
    return NextResponse.json({
      response: data.content[0].text
    });

  } catch (error: any) {
    console.error('Error processing Claude request:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to generate mock responses for development
function generateMockResponse(prompt: string): string {
  try {
    // For student profile summarization
    if (prompt.includes('student profile summarization')) {
      // Extract the student data from the prompt
      const dataStart = prompt.indexOf('Student Profile Data:');
      if (dataStart === -1) return "Could not find student data in prompt";
      
      const jsonDataString = prompt.substring(dataStart + 'Student Profile Data:'.length).trim();
      const studentData = JSON.parse(jsonDataString);
      
      // Generate a personalized response based on the actual data
      const institution = studentData.academic.institution || 'an educational institution';
      const major = studentData.academic.major || 'an unspecified field';
      const gradYear = studentData.academic.graduationYear || 'the future';
      const interests = Array.isArray(studentData.personal.interests) ? studentData.personal.interests : [];
      const skills = Array.isArray(studentData.personal.skills) ? studentData.personal.skills : [];
      const achievements = Array.isArray(studentData.personal.achievements) ? studentData.personal.achievements : [];
      const financialBackground = studentData.financial.financialBackground || '';
      const careerGoals = studentData.career.careerGoals || '';
      
      // Create a more direct, concise, and formatted summary with bullet points
      let summary = `${major} student at ${institution}, graduating in ${gradYear}.\n\n`;
      
      // Add strengths section with bullet points
      summary += `## Key Strengths\n\n`;
      
      if (skills.length > 0) {
        summary += `* **Strong technical skills in:** ${skills.join(', ')}\n\n`;
      }
      
      if (achievements.length > 0) {
        summary += `* **Notable achievements:** ${achievements.join(', ')}\n\n`;
      }
      
      if (interests.length > 0) {
        summary += `* **Diverse interests including:** ${interests.join(', ')}\n\n`;
      }
      
      // Add a direct assessment of financial needs if available
      if (financialBackground) {
        summary += `* **Financial situation:** ${financialBackground}\n\n`;
      }
      
      // Add career goals if available
      if (careerGoals) {
        summary += `* **Career direction:** ${careerGoals}\n\n`;
      }
      
      // Add a section for targeted recommendations
      summary += `## Recommendations\n\n`;
      summary += `* Apply for ${major}-specific scholarships that value ${skills.length > 0 ? skills[0] : 'academic excellence'}\n\n`;
      summary += `* Connect with ${institution}'s career services for internship opportunities\n\n`;
      summary += `* Join professional networks in the ${major} field to access exclusive funding\n\n`;
      
      if (interests.length > 0) {
        summary += `* Explore interdisciplinary opportunities combining ${major} with ${interests[0]}\n\n`;
      }
      
      summary += `* Build a portfolio highlighting your projects and achievements for applications\n\n`;
      
      // Add one direct compliment based on their profile
      summary += `**Summary:** You have a strong foundation in ${major}${skills.length > 0 ? ' with valuable ' + skills[0] + ' skills' : ''}${achievements.length > 0 ? ' and impressive achievements' : ''}. This profile positions you well for targeted bursary opportunities.`;
      
      return summary;
    } 
    // For bursary summarization
    else if (prompt.includes('bursary summarization')) {
      // Extract the bursary data from the prompt
      const dataStart = prompt.indexOf('Bursary Data:');
      if (dataStart === -1) return "Could not find bursary data in prompt";
      
      const jsonDataString = prompt.substring(dataStart + 'Bursary Data:'.length).trim();
      const bursaryData = JSON.parse(jsonDataString);
      
      // Generate a personalized response based on the actual data
      const title = bursaryData.title || 'Unnamed Scholarship';
      const description = bursaryData.description || 'No description provided';
      const amount = bursaryData.awardAmount ? `$${bursaryData.awardAmount}` : 'Unspecified amount';
      const fields = bursaryData.fieldOfStudy || [];
      const levels = bursaryData.academicLevel || [];
      const needLevel = bursaryData.financialNeedLevel || 'unspecified';
      const eligibility = bursaryData.eligibilityCriteria || '';
      
      // Create a more detailed bursary summary
      let summary = `The ${title} offers a valuable financial support opportunity of ${amount} specifically designed for students pursuing degrees in ${fields.join(', ') || 'various fields'}. `;
      
      summary += `This bursary is available to ${levels.join(', ') || 'students'} who demonstrate ${needLevel} financial need, making it an excellent opportunity for qualified applicants seeking educational funding assistance. `;
      
      if (eligibility) {
        summary += `Key eligibility requirements include: ${eligibility} `;
      }
      
      summary += `${description} `;
      
      summary += `Candidates should prepare a strong application highlighting how they meet the specific criteria of this bursary, particularly focusing on their academic achievements, financial circumstances, and relevant experiences in ${fields.join(', ') || 'their field'}. Successful applicants typically demonstrate not only financial need but also academic merit and a clear alignment with the bursary's stated purpose and values.`;
      
      return summary;
    }
    // For match scoring
    else if (prompt.includes('match between a student and a bursary')) {
      // Extract student and bursary summaries
      const studentStart = prompt.indexOf('Student Summary:');
      const bursaryStart = prompt.indexOf('Bursary Summary:');
      
      if (studentStart === -1 || bursaryStart === -1) {
        return JSON.stringify({
          score: 50,
          explanation: "Insufficient data to calculate an accurate match score."
        });
      }
      
      const studentSummary = prompt.substring(studentStart, bursaryStart).trim();
      const bursarySummary = prompt.substring(bursaryStart).trim();
      
      // Extract some keywords for more specific mock responses
      const studentKeywords = extractKeywords(studentSummary);
      const bursaryKeywords = extractKeywords(bursarySummary);
      
      // Generate a score between 30-95 for development purposes
      const score = Math.floor(Math.random() * 66) + 30;
      
      // Select explanation based on score range
      let explanation = "";
      
      if (score >= 75) {
        explanation = `Strong match for this ${bursaryKeywords.field || "specific"} bursary (${score}%). Student's ${studentKeywords.major || "major"} at ${studentKeywords.institution || "institution"} aligns with required field of study. ${studentKeywords.financialNeed || "Financial need level"} matches the bursary's ${bursaryKeywords.needLevel || "need requirement"}. Experience in ${studentKeywords.skills?.[0] || "relevant areas"} is particularly relevant to this opportunity.`;
      } 
      else if (score >= 50) {
        explanation = `Moderate match (${score}%) for this ${bursaryKeywords.amount || "$X,XXX"} ${bursaryKeywords.field || "field"} bursary. Student's ${studentKeywords.major || "academic background"} partially aligns with requirements. Financial need compatibility is good, but ${studentKeywords.skills?.[0] || "skill set"} only partially matches the bursary's focus on ${bursaryKeywords.criteria || "specific criteria"}.`;
      }
      else {
        explanation = `Limited match (${score}%) for this ${bursaryKeywords.field || "specific"} bursary. Student's ${studentKeywords.major || "major"} differs from the required ${bursaryKeywords.field || "field of study"}. ${bursaryKeywords.criteria || "Eligibility criteria"} specifies ${bursaryKeywords.academicLevel || "academic level"} requirements that don't align with student's profile.`;
      }
      
      return JSON.stringify({
        score,
        explanation
      });
    } 
    else {
      return "This is a detailed mock response based on your query. In production, Claude 3.7 would provide an even more customized and comprehensive response to your specific prompt.";
    }
  } catch (error) {
    console.error("Error generating mock response:", error);
    return "Error generating mock response. Please check the data format in your prompt.";
  }
}

// Helper function to extract keywords from summaries for more specific mock responses
function extractKeywords(text: string): any {
  const keywords: any = {};
  
  // Extract major/field
  if (text.match(/major(?:ing)? in ([^,.]+)/i)) {
    keywords.major = text.match(/major(?:ing)? in ([^,.]+)/i)?.[1] || "relevant field";
  } else if (text.match(/studying ([^,.]+)/i)) {
    keywords.major = text.match(/studying ([^,.]+)/i)?.[1] || "relevant field";
  } else if (text.match(/field(?:s)? of study: ([^,.]+)/i)) {
    keywords.field = text.match(/field(?:s)? of study: ([^,.]+)/i)?.[1] || "specific field";
  }
  
  // Extract institution
  if (text.match(/at ([^,.]+University|College|Institute)/i)) {
    keywords.institution = text.match(/at ([^,.]+University|College|Institute)/i)?.[1] || "their institution";
  }
  
  // Extract financial need
  if (text.match(/financial need(?:s)?: ([^,.]+)/i)) {
    keywords.financialNeed = text.match(/financial need(?:s)?: ([^,.]+)/i)?.[1] || "financial situation";
  } else if (text.match(/financial(?:ly)? ([^,.]+)/i)) {
    keywords.needLevel = text.match(/financial(?:ly)? ([^,.]+)/i)?.[1] || "need level";
  }
  
  // Extract skills
  const skillsMatch = text.match(/skills(?:\s+include)?(?:\s+in)?:? ([^.]+)/i);
  if (skillsMatch) {
    keywords.skills = skillsMatch[1].split(/,\s+|and\s+/).map((s: string) => s.trim());
  }
  
  // Extract amount
  if (text.match(/\$([0-9,]+)/)) {
    keywords.amount = text.match(/\$([0-9,]+)/)?.[0] || "$X,XXX";
  }
  
  // Extract criteria
  if (text.match(/eligibility(?:\s+criteria)?:? ([^.]+)/i)) {
    keywords.criteria = text.match(/eligibility(?:\s+criteria)?:? ([^.]+)/i)?.[1] || "specific criteria";
  }
  
  // Extract academic level
  if (text.match(/academic level(?:s)?: ([^.]+)/i)) {
    keywords.academicLevel = text.match(/academic level(?:s)?: ([^.]+)/i)?.[1] || "academic level";
  } else if (text.match(/for (undergraduate|graduate|freshman|sophomore|junior|senior)/i)) {
    keywords.academicLevel = text.match(/for (undergraduate|graduate|freshman|sophomore|junior|senior)/i)?.[1] || "academic level";
  }
  
  return keywords;
} 