import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import Bursary from "@/models/Bursary";
import User from "@/models/User";
import OrganizationProfile from "@/models/OrganizationProfile";

// Simulated AI functions (to be replaced with actual AI services)
function generateTags(description: string): string[] {
  // Simple keyword extraction logic (would be replaced by proper NLP in production)
  const text = description.toLowerCase();
  const potentialTags = [
    "education", "scholarship", "financial aid", "undergraduate", 
    "graduate", "indigenous", "STEM", "arts", "research", 
    "community service", "leadership", "academic excellence"
  ];
  
  return potentialTags.filter(tag => text.includes(tag.toLowerCase()));
}

function categorizeBursary(description: string, title: string): string[] {
  // Simple categorization logic (would be replaced by ML/NLP in production)
  const combinedText = (description + " " + title).toLowerCase();
  const categories = [];
  
  if (combinedText.includes("engineer") || combinedText.includes("computer") || 
      combinedText.includes("science") || combinedText.includes("tech")) {
    categories.push("STEM");
  }
  
  if (combinedText.includes("art") || combinedText.includes("music") || 
      combinedText.includes("creative") || combinedText.includes("performance")) {
    categories.push("Arts & Culture");
  }
  
  if (combinedText.includes("lead") || combinedText.includes("community") || 
      combinedText.includes("volunteer") || combinedText.includes("service")) {
    categories.push("Leadership & Community");
  }
  
  if (combinedText.includes("research") || combinedText.includes("academic") || 
      combinedText.includes("study") || combinedText.includes("phd")) {
    categories.push("Research & Academia");
  }
  
  if (combinedText.includes("indigenous") || combinedText.includes("native") || 
      combinedText.includes("first nation") || combinedText.includes("aboriginal")) {
    categories.push("Indigenous Focused");
  }
  
  // Add a general category if none are found
  if (categories.length === 0) {
    categories.push("General Education");
  }
  
  return categories;
}

function estimateCompetitionLevel(awardAmount: number, description: string): string {
  // A simple heuristic for competition level
  if (awardAmount > 5000) {
    return "high"; // High-value bursaries typically have more competition
  } else if (awardAmount > 2000) {
    return "medium";
  } else {
    return "low";
  }
}

function estimateApplicationComplexity(requiredDocuments: string[], description: string): string {
  // Estimate complexity based on number of required documents
  if (requiredDocuments.length > 5) {
    return "high";
  } else if (requiredDocuments.length > 2) {
    return "medium";
  } else {
    return "low";
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    // Get bursary ID from request
    const { bursaryId } = await request.json();
    
    if (!bursaryId) {
      return NextResponse.json(
        { error: "Bursary ID is required" },
        { status: 400 }
      );
    }
    
    // Find the bursary
    const bursary = await Bursary.findById(bursaryId);
    if (!bursary) {
      return NextResponse.json(
        { error: "Bursary not found" },
        { status: 404 }
      );
    }
    
    // Check if the user has permission to process this bursary
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Only organization/funder owners or admins can process bursaries
    if (user.role === "organization" || user.role === "funder") {
      const organizationProfile = await OrganizationProfile.findOne({ user: user._id });
      if (!organizationProfile || organizationProfile._id.toString() !== bursary.organization.toString()) {
        return NextResponse.json(
          { error: "You don't have permission to process this bursary" },
          { status: 403 }
        );
      }
    } else if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Only organizations, funders, or admins can process bursaries" },
        { status: 403 }
      );
    }
    
    // Apply AI processing
    const tags = generateTags(bursary.description);
    const categories = categorizeBursary(bursary.description, bursary.title);
    const competitionLevel = estimateCompetitionLevel(bursary.awardAmount, bursary.description);
    const applicationComplexity = estimateApplicationComplexity(bursary.requiredDocuments, bursary.description);
    
    // Update bursary with AI-generated fields
    bursary.aiTags = tags;
    bursary.aiCategorization = categories;
    bursary.competitionLevel = competitionLevel;
    bursary.applicationComplexity = applicationComplexity;
    
    // Save the updated bursary
    await bursary.save();
    
    return NextResponse.json({
      success: true,
      aiTags: tags,
      aiCategorization: categories,
      competitionLevel,
      applicationComplexity
    });
  } catch (error) {
    console.error("Error processing bursary with AI:", error);
    return NextResponse.json(
      { error: "Failed to process bursary with AI" },
      { status: 500 }
    );
  }
} 