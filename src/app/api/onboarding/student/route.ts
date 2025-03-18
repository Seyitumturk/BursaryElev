import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    console.log("[Student Onboarding] Starting onboarding process");
    console.log("[Student Onboarding] Connecting to database...");
    await dbConnect();
    console.log("[Student Onboarding] Database connection successful");

    const { userId } = await auth();
    console.log(`[Student Onboarding] Auth check complete. User authenticated: ${!!userId}`);
    if (!userId) {
      console.log("[Student Onboarding] Authentication failed: No user ID found");
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Get the authenticated Clerk user data to access the email
    console.log("[Student Onboarding] Retrieving Clerk user data");
    const clerkUser = await currentUser();
    if (!clerkUser) {
      console.log("[Student Onboarding] Failed to retrieve Clerk user data");
      return NextResponse.json({ error: "Could not retrieve user data" }, { status: 500 });
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
    console.log(`[Student Onboarding] User email found: ${!!userEmail}`);
    if (!userEmail) {
      console.log("[Student Onboarding] No email address available for user");
      return NextResponse.json({ error: "User email not available" }, { status: 400 });
    }

    console.log("[Student Onboarding] Parsing request body");
    const body = await request.json();
    console.log("[Student Onboarding] Student onboarding data received:", JSON.stringify(body, null, 2));
    
    // Extract all fields with strong typing
    const { 
      institution, 
      major, 
      graduationYear, 
      interests, 
      bio,
      skills,
      languages,
      achievements,
      financialBackground,
      careerGoals,
      locationPreferences
    } = body;

    console.log("[Student Onboarding] Extracted fields:");
    console.log("[Student Onboarding] skills:", skills);
    console.log("[Student Onboarding] languages:", languages);
    console.log("[Student Onboarding] achievements:", achievements);
    console.log("[Student Onboarding] financialBackground:", financialBackground);
    console.log("[Student Onboarding] careerGoals:", careerGoals);
    console.log("[Student Onboarding] locationPreferences:", locationPreferences);

    // Find existing user first
    console.log(`[Student Onboarding] Looking for existing user with clerkId: ${userId}`);
    let userDoc = await User.findOne({ clerkId: userId });
    console.log(`[Student Onboarding] User exists: ${!!userDoc}`);
    
    // Only create user if doesn't exist
    if (!userDoc) {
      console.log("[Student Onboarding] Creating new user document");
      userDoc = new User({
        clerkId: userId,
        email: userEmail, // Use email from Clerk instead of body
        role: "student",
      });
      await userDoc.save();
      console.log(`[Student Onboarding] New user created with ID: ${userDoc._id}`);
    } else {
      console.log(`[Student Onboarding] Using existing user with ID: ${userDoc._id}`);
    }

    // Create a complete profile data object with all fields explicitly set
    const profileData = {
      user: userDoc._id,
      institution: institution || "",
      major: major || "",
      graduationYear: typeof graduationYear === 'number' ? graduationYear : 
                    (typeof graduationYear === 'string' ? parseInt(graduationYear) : new Date().getFullYear() + 4),
      interests: Array.isArray(interests) ? interests : [],
      bio: bio || "",
      skills: Array.isArray(skills) ? skills : [],
      languages: Array.isArray(languages) ? languages : [],
      achievements: Array.isArray(achievements) ? achievements : [],
      financialBackground: financialBackground || "",
      careerGoals: careerGoals || "",
      locationPreferences: Array.isArray(locationPreferences) ? locationPreferences : []
    };

    console.log("[Student Onboarding] Profile data to save:", JSON.stringify(profileData, null, 2));

    // First delete the existing profile to ensure clean state
    console.log(`[Student Onboarding] Deleting any existing profile for user: ${userDoc._id}`);
    const deleteResult = await StudentProfile.findOneAndDelete({ user: userDoc._id });
    console.log(`[Student Onboarding] Existing profile deleted: ${!!deleteResult}`);

    // Create a new student profile from scratch
    console.log("[Student Onboarding] Creating new student profile");
    const studentProfile = new StudentProfile(profileData);
    await studentProfile.save();
    console.log(`[Student Onboarding] Student profile saved successfully with ID: ${studentProfile._id}`);

    console.log("[Student Onboarding] Saved student profile:", JSON.stringify(studentProfile.toJSON(), null, 2));

    return NextResponse.json({
      message: "Student profile created/updated successfully",
      profile: studentProfile.toJSON(),
    });
  } catch (error) {
    console.error("[Student Onboarding] Error in student onboarding:", error);
    // More detailed error logging
    if (error instanceof Error) {
      console.error(`[Student Onboarding] Error name: ${error.name}`);
      console.error(`[Student Onboarding] Error message: ${error.message}`);
      console.error(`[Student Onboarding] Error stack: ${error.stack}`);
    }
    if (error instanceof mongoose.Error) {
      console.error(`[Student Onboarding] MongoDB error details:`, error);
    }
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: process.env.NODE_ENV === "production" ? undefined : (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
} 