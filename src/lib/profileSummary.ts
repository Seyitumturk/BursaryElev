import { IStudentProfile } from "../models/StudentProfile";

export interface ProfileSummary {
  summary: string;
  conversationalSummary: string;
  keyAttributes: {
    academic: string[];
    skills: string[];
    interests: string[];
    career: string[];
    financial: string;
  };
  matches: {
    strongAreas: string[];
    improvementAreas: string[];
  };
}

/**
 * Generates a summary of a student profile with key attributes
 * @param profile Student profile
 * @returns Profile summary with key attributes and match potential
 */
export function generateProfileSummary(profile: IStudentProfile): ProfileSummary {
  // Extract key academic attributes
  const academicAttributes = extractAcademicAttributes(profile);
  
  // Extract key skills and competencies
  const skillAttributes = extractSkillAttributes(profile);
  
  // Extract interests and extracurricular activities
  const interestAttributes = extractInterestAttributes(profile);
  
  // Extract career goals and aspirations
  const careerAttributes = extractCareerAttributes(profile);
  
  // Analyze financial background
  const financialSummary = analyzeFinancialBackground(profile);
  
  // Identify strong areas for matching
  const strongAreas = identifyStrongAreas(profile);
  
  // Identify areas that could be improved for better matches
  const improvementAreas = identifyImprovementAreas(profile);
  
  // Generate overall profile summary
  const summary = createSummaryText(
    profile,
    academicAttributes,
    skillAttributes,
    interestAttributes,
    careerAttributes,
    financialSummary
  );
  
  // Generate conversational summary
  const conversationalSummary = createConversationalSummary(
    profile,
    academicAttributes,
    skillAttributes,
    interestAttributes,
    careerAttributes,
    financialSummary,
    strongAreas,
    improvementAreas
  );
  
  return {
    summary,
    conversationalSummary,
    keyAttributes: {
      academic: academicAttributes,
      skills: skillAttributes,
      interests: interestAttributes,
      career: careerAttributes,
      financial: financialSummary
    },
    matches: {
      strongAreas,
      improvementAreas
    }
  };
}

function extractAcademicAttributes(profile: IStudentProfile): string[] {
  const attributes: string[] = [];
  
  if (profile.institution) {
    attributes.push(`${profile.institution} student`);
  }
  
  if (profile.major) {
    attributes.push(`${profile.major} major`);
  }
  
  if (profile.graduationYear) {
    const currentYear = new Date().getFullYear();
    const yearsToGraduation = profile.graduationYear - currentYear;
    
    if (yearsToGraduation <= 0) {
      attributes.push("Recent graduate");
    } else if (yearsToGraduation === 1) {
      attributes.push("Senior year student");
    } else if (yearsToGraduation === 2) {
      attributes.push("Junior year student");
    } else if (yearsToGraduation === 3) {
      attributes.push("Sophomore");
    } else {
      attributes.push("Freshman");
    }
  }
  
  return attributes;
}

function extractSkillAttributes(profile: IStudentProfile): string[] {
  const skills: string[] = [];
  
  // Extract technical skills
  if (profile.skills && profile.skills.length > 0) {
    // Filter for technical or specialized skills
    const technicalSkills = profile.skills.filter(skill => 
      !skill.toLowerCase().includes("communication") &&
      !skill.toLowerCase().includes("leadership") &&
      !skill.toLowerCase().includes("teamwork") &&
      !skill.toLowerCase().includes("organization")
    );
    
    if (technicalSkills.length > 0) {
      skills.push(...technicalSkills.slice(0, 3));
    }
    
    // Extract soft skills
    const softSkills = profile.skills.filter(skill => 
      skill.toLowerCase().includes("communication") ||
      skill.toLowerCase().includes("leadership") ||
      skill.toLowerCase().includes("teamwork") ||
      skill.toLowerCase().includes("organization")
    );
    
    if (softSkills.length > 0) {
      skills.push(...softSkills.slice(0, 2));
    }
  }
  
  // Add language skills
  if (profile.languages && profile.languages.length > 0) {
    if (profile.languages.length === 1) {
      skills.push(`${profile.languages[0]} speaker`);
    } else if (profile.languages.length === 2) {
      skills.push(`${profile.languages[0]} and ${profile.languages[1]} speaker`);
    } else {
      skills.push(`Multilingual (${profile.languages.length} languages)`);
    }
  }
  
  return skills;
}

function extractInterestAttributes(profile: IStudentProfile): string[] {
  const interests: string[] = [];
  
  if (profile.interests && profile.interests.length > 0) {
    // Add top interests
    interests.push(...profile.interests.slice(0, 3));
  }
  
  if (profile.achievements && profile.achievements.length > 0) {
    // Extract notable achievements
    const notableAchievements = profile.achievements
      .filter(achievement => 
        achievement.toLowerCase().includes("award") ||
        achievement.toLowerCase().includes("scholarship") ||
        achievement.toLowerCase().includes("honor") ||
        achievement.toLowerCase().includes("recognition") ||
        achievement.toLowerCase().includes("certificate")
      );
    
    if (notableAchievements.length > 0) {
      interests.push(...notableAchievements.slice(0, 2));
    }
  }
  
  return interests;
}

function extractCareerAttributes(profile: IStudentProfile): string[] {
  const career: string[] = [];
  
  if (profile.careerGoals) {
    // Analyze career statement for key goals
    const goals = profile.careerGoals.toLowerCase();
    
    if (goals.includes("research") || goals.includes("academia") || goals.includes("phd") || goals.includes("professor")) {
      career.push("Academic/Research career path");
    }
    
    if (goals.includes("entrepreneur") || goals.includes("start") || goals.includes("business") || goals.includes("company")) {
      career.push("Entrepreneurial interests");
    }
    
    if (goals.includes("nonprofit") || goals.includes("ngo") || goals.includes("social impact") || goals.includes("community")) {
      career.push("Social impact focus");
    }
    
    if (goals.includes("corporate") || goals.includes("industry") || goals.includes("professional")) {
      career.push("Industry/Corporate track");
    }
    
    if (goals.includes("international") || goals.includes("global") || goals.includes("abroad")) {
      career.push("Global/International focus");
    }
    
    // If no specific keywords were found, add a generic entry
    if (career.length === 0 && profile.careerGoals.length > 10) {
      career.push("Has defined career objectives");
    }
  }
  
  if (profile.locationPreferences && profile.locationPreferences.length > 0) {
    if (profile.locationPreferences.length === 1) {
      career.push(`Interested in ${profile.locationPreferences[0]}`);
    } else {
      career.push("Has multiple location preferences");
    }
  }
  
  return career;
}

function analyzeFinancialBackground(profile: IStudentProfile): string {
  if (!profile.financialBackground) {
    return "No financial information provided";
  }
  
  const background = profile.financialBackground.toLowerCase();
  
  // Check for high financial need indicators
  if (
    background.includes("struggling") ||
    background.includes("limited") ||
    background.includes("difficult") ||
    background.includes("hardship") ||
    background.includes("low income") ||
    background.includes("unemployed") ||
    background.includes("poverty") ||
    background.includes("loan") ||
    background.includes("debt") ||
    background.includes("challenge")
  ) {
    return "High financial need";
  }
  
  // Check for medium financial need indicators
  if (
    background.includes("middle") ||
    background.includes("average") ||
    background.includes("moderate") ||
    background.includes("some support") ||
    background.includes("partial") ||
    background.includes("working") ||
    background.includes("assistance")
  ) {
    return "Moderate financial need";
  }
  
  // Check for low financial need indicators
  if (
    background.includes("comfortable") ||
    background.includes("stable") ||
    background.includes("good") ||
    background.includes("wealthy") ||
    background.includes("secure") ||
    background.includes("well-off") ||
    background.includes("afford")
  ) {
    return "Low financial need";
  }
  
  // Default return if no specific indicators found
  return "Unspecified financial need";
}

function identifyStrongAreas(profile: IStudentProfile): string[] {
  const strongAreas: string[] = [];
  
  // Academic strengths
  if (profile.institution && profile.major && profile.graduationYear) {
    strongAreas.push("Complete academic profile");
  }
  
  // Skills and achievements
  if (profile.skills && profile.skills.length > 3) {
    strongAreas.push("Diverse skill set");
  }
  
  if (profile.achievements && profile.achievements.length > 0) {
    strongAreas.push("Documented achievements");
  }
  
  // Comprehensive profile
  if (
    profile.bio && 
    profile.bio.length > 100 && 
    profile.careerGoals && 
    profile.careerGoals.length > 100
  ) {
    strongAreas.push("Detailed personal statement");
  }
  
  if (profile.languages && profile.languages.length > 1) {
    strongAreas.push("Multilingual");
  }
  
  if (profile.interests && profile.interests.length > 3) {
    strongAreas.push("Diverse interests");
  }
  
  if (profile.financialBackground && profile.financialBackground.length > 50) {
    strongAreas.push("Clear financial information");
  }
  
  return strongAreas;
}

function identifyImprovementAreas(profile: IStudentProfile): string[] {
  const improvementAreas: string[] = [];
  
  // Missing academic info
  if (!profile.institution || !profile.major || !profile.graduationYear) {
    improvementAreas.push("Complete academic information");
  }
  
  // Limited skills or achievements
  if (!profile.skills || profile.skills.length < 2) {
    improvementAreas.push("Add more skills");
  }
  
  if (!profile.achievements || profile.achievements.length === 0) {
    improvementAreas.push("Add achievements");
  }
  
  // Incomplete personal statements
  if (!profile.bio || profile.bio.length < 50) {
    improvementAreas.push("Expand bio");
  }
  
  if (!profile.careerGoals || profile.careerGoals.length < 50) {
    improvementAreas.push("Clarify career goals");
  }
  
  if (!profile.financialBackground) {
    improvementAreas.push("Add financial background");
  }
  
  if (!profile.interests || profile.interests.length < 2) {
    improvementAreas.push("Add more interests");
  }
  
  return improvementAreas;
}

function createSummaryText(
  profile: IStudentProfile,
  academicAttributes: string[],
  skillAttributes: string[],
  interestAttributes: string[],
  careerAttributes: string[],
  financialSummary: string
): string {
  let summary = "";
  
  // Academic summary
  if (academicAttributes.length > 0) {
    summary += `${academicAttributes.join(", ")}. `;
  }
  
  // Skills summary
  if (skillAttributes.length > 0) {
    summary += `Demonstrates proficiency in ${skillAttributes.join(", ")}. `;
  }
  
  // Interests summary
  if (interestAttributes.length > 0) {
    summary += `Shows interest in ${interestAttributes.join(", ")}. `;
  }
  
  // Career summary
  if (careerAttributes.length > 0) {
    summary += `Career focus: ${careerAttributes.join(", ")}. `;
  }
  
  // Financial summary
  if (financialSummary) {
    summary += `${financialSummary}. `;
  }
  
  // If summary is empty, provide a default message
  if (summary === "") {
    summary = "Profile information is limited. Please complete your profile to get better bursary matches.";
  }
  
  return summary;
}

/**
 * Creates a conversational, natural language summary of the student profile
 */
function createConversationalSummary(
  profile: IStudentProfile,
  academicAttributes: string[],
  skillAttributes: string[],
  interestAttributes: string[],
  careerAttributes: string[],
  financialSummary: string,
  strongAreas: string[],
  improvementAreas: string[]
): string {
  // Start with a personalized greeting
  let conversational = "Based on your profile, I see you're ";
  
  // Add academic background
  if (profile.institution && profile.major) {
    conversational += `studying ${profile.major} at ${profile.institution}. `;
  } else if (profile.institution) {
    conversational += `a student at ${profile.institution}. `;
  } else if (profile.major) {
    conversational += `majoring in ${profile.major}. `;
  } else {
    conversational += `currently a student. `;
  }
  
  // Add graduation context
  if (profile.graduationYear) {
    const currentYear = new Date().getFullYear();
    const yearsToGraduation = profile.graduationYear - currentYear;
    
    if (yearsToGraduation < 0) {
      conversational += `You've recently graduated (${profile.graduationYear}), which is great! `;
    } else if (yearsToGraduation === 0) {
      conversational += `You're graduating this year – exciting times ahead! `;
    } else if (yearsToGraduation === 1) {
      conversational += `With just one year left until graduation, you're getting close to completing your degree. `;
    } else if (yearsToGraduation <= 3) {
      conversational += `You're ${yearsToGraduation} years away from graduation in ${profile.graduationYear}. `;
    } else {
      conversational += `You have ${yearsToGraduation} years ahead in your academic journey. `;
    }
  }
  
  // Add skills and strengths
  if (skillAttributes.length > 0) {
    conversational += `Your profile highlights skills in ${skillAttributes.slice(0, 3).join(", ")}${skillAttributes.length > 3 ? ", and more" : ""}. `;
  }
  
  // Add interests
  if (interestAttributes.length > 0) {
    conversational += `I can see you're interested in ${interestAttributes.slice(0, 3).join(", ")}${interestAttributes.length > 3 ? ", among other things" : ""}. `;
  }
  
  // Add career aspirations
  if (careerAttributes.length > 0) {
    conversational += `Career-wise, you seem focused on ${careerAttributes.slice(0, 2).join(" and ")}. `;
  }
  
  // Add financial context
  if (financialSummary && financialSummary !== "No financial information provided") {
    if (financialSummary === "High financial need") {
      conversational += `I understand that finances are an important consideration for you. `;
    } else if (financialSummary === "Moderate financial need") {
      conversational += `You've indicated some financial considerations in your academic journey. `;
    } else if (financialSummary === "Low financial need") {
      conversational += `It seems your financial situation is relatively stable. `;
    }
  }
  
  // Add strengths and bursary match potential
  if (strongAreas.length > 0) {
    conversational += `When it comes to bursary matching, your profile's strengths include ${strongAreas.slice(0, 2).join(" and ")}. `;
  }
  
  // Add personalized improvement suggestions
  if (improvementAreas.length > 0) {
    conversational += `To improve your chances of matching with even more opportunities, consider ${improvementAreas.map(area => area.toLowerCase()).slice(0, 2).join(" and ")}. `;
  }
  
  // Add ending note
  conversational += "I'll use this understanding of your profile to find the most suitable bursary opportunities for you.";
  
  return conversational;
} 