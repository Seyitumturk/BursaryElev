import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Environment variable for Claude API key should be set in .env.local
// Use ANTHROPIC_API_KEY as the primary variable name, consistent with Anthropic's naming
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Use mock response only if NEITHER key is provided
const useMockResponse = !ANTHROPIC_API_KEY;

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

    // Use mock responses for development if no valid API key is set
    if (useMockResponse) {
      console.log('Using mock Claude response (ANTHROPIC_API_KEY not provided)');
      return NextResponse.json({
        response: generateMockResponse(prompt)
      });
    }

    // Call Claude API using the determined key
    const claudeResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY, // Use the correct variable here
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229', // Ensure this model name is correct for your key
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
    // Check order: More specific prompts first

    // For AI Suitability scoring
    if (prompt.includes('evaluating the SUITABILITY and POTENTIAL FIT')) {
      const mockScore = Math.floor(Math.random() * 51) + 40; // 40-90
      const mockExplanation = `Mock explanation: This bursary shows ${mockScore >= 70 ? 'strong' : mockScore >= 50 ? 'moderate' : 'limited'} suitability based on AI analysis. Skills/goals alignment appears ${mockScore >= 60 ? 'positive' : 'partial'}.`;
      console.log(`MOCK CLAUDE: Returning suitability score: ${mockScore}`);
      return JSON.stringify({ score: mockScore, explanation: mockExplanation });
    } 
    // For student profile summarization
    else if (prompt.includes('You are Claude') && prompt.includes('Student Profile Data:')) {
      // Extract the student data from the prompt
      const dataStart = prompt.indexOf('Student Profile Data:');
      if (dataStart === -1) return "Could not find student data in prompt";
      
      const jsonDataString = prompt.substring(dataStart + 'Student Profile Data:'.length).trim();
      console.log('MOCK CLAUDE: Processing student data');
      
      try {
        const studentData = JSON.parse(jsonDataString);
        
        // Extract actual student data
        const institution = studentData.academic.institution || 'your university';
        const major = studentData.academic.major || 'your field';
        const gradYear = studentData.academic.graduationYear || 'the near future';
        const interests = Array.isArray(studentData.personal.interests) ? studentData.personal.interests : [];
        const skills = Array.isArray(studentData.personal.skills) ? studentData.personal.skills : [];
        const achievements = Array.isArray(studentData.personal.achievements) ? studentData.personal.achievements : [];
        const bio = studentData.personal.bio || '';
        const financialBackground = studentData.financial.financialBackground || '';
        const careerGoals = studentData.career.careerGoals || '';
        const languages = Array.isArray(studentData.personal.languages) ? studentData.personal.languages : [];
        
        // Create a personalized, conversational response that speaks directly to the student
        let response = `Hi there! I've been looking at your profile as an ${major} student at ${institution}, and I'm really impressed with what I see.\n\n`;
        
        // Add specific details about their background
        if (skills.length > 0 || achievements.length > 0) {
          response += `Your background in ${skills.join(' and ')} combined with achievements like ${achievements.join(' and ')} gives you a strong foundation. `;
          
          if (interests.length > 0) {
            response += `I also notice your interest in ${interests.join(' and ')}, which adds a valuable dimension to your profile.\n\n`;
          } else {
            response += '\n\n';
          }
        } else if (bio) {
          response += `Your personal statement about "${bio}" shows your passion and direction. `;
          response += '\n\n';
        }
        
        // Add graduation context
        const currentYear = new Date().getFullYear();
        if (gradYear > currentYear) {
          const yearsLeft = gradYear - currentYear;
          response += `With ${yearsLeft} years until your expected graduation in ${gradYear}, now is the perfect time to be looking at funding opportunities that can support your education in ${major}.\n\n`;
        } else {
          response += `As you're approaching graduation in ${gradYear}, you should be looking at both educational funding and transition grants that can help you move from your studies into your career.\n\n`;
        }
        
        // Add career goals if available
        if (careerGoals) {
          response += `Your career goals in ${careerGoals} align well with your studies. For students with your background, I'd recommend exploring funding specifically designed for future professionals in this area.\n\n`;
        }
        
        // Add financial background if available
        if (financialBackground) {
          if (financialBackground.toLowerCase().includes('high')) {
            response += `Given your high financial need, I'd prioritize need-based scholarships and grants that can provide substantial support. `;
          } else if (financialBackground.toLowerCase().includes('medium')) {
            response += `With your moderate financial need, you should consider a mix of merit-based and need-based funding options. `;
          } else {
            response += `Based on your financial situation, you might want to focus primarily on merit and achievement-based opportunities. `;
          }
        }
        
        // Add language skills if relevant
        if (languages.length > 1) {
          response += `Your language skills in ${languages.join(', ')} could also open doors to international or multicultural scholarship opportunities.\n\n`;
        }
        
        // Add personalized advice
        response += `For ${major} students at ${institution}, I'd recommend connecting with your department's scholarship coordinator who can point you to field-specific funding. The ${major} department often has partnerships with organizations that offer support to students with your qualifications.\n\n`;
        
        // Add encouragement to close
        response += `With your combination of academic focus, ${skills.length > 0 ? 'demonstrated skills' : 'background'}, and ${achievements.length > 0 ? 'impressive achievements' : 'personal qualities'}, you're well-positioned to secure funding. Make sure your applications highlight these strengths, and don't hesitate to reach out if you need more specific guidance!`;
        
        return response;
      } catch (parseError) {
        console.error("Error parsing student data in mock response:", parseError);
        return "I've reviewed your profile and can see you're passionate about your field of study. Your academic background and personal achievements suggest you would be a strong candidate for several bursary opportunities. Consider looking into field-specific scholarships at your institution, as well as broader funding programs that value your unique combination of skills and interests.";
      }
    } 
    // For bursary summarization (using a more specific check)
    else if (prompt.trim().startsWith('You are an AI assistant helping with bursary opportunity summarization')) {
      console.log('MOCK CLAUDE: Processing bursary summarization'); // Added specific log
      // Extract the bursary data from the prompt
      const dataStart = prompt.indexOf('Bursary Data:');
      if (dataStart === -1) return "Could not find bursary data in prompt";
      
      try { // Added try-catch for parsing bursary data
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
      } catch(parseError) {
         console.error("Error parsing bursary data in mock response:", parseError);
         return "Mock bursary summary generation failed due to parsing error.";
      }
    }
    // Deprecated: Old match scoring prompt check (can likely be removed later)
    else if (prompt.includes('match between a student and a bursary')) {
       console.warn('MOCK CLAUDE: Received deprecated match scoring prompt.');
       // Return a generic score/explanation for this old prompt type
       return JSON.stringify({ score: 55, explanation: "Mock explanation for deprecated match score prompt." });
    }
    // Fallback for unrecognized prompts
    else {
      console.log('MOCK CLAUDE: Unrecognized prompt type');
      return "Mock response: Unrecognized prompt type. Claude would normally respond here.";
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