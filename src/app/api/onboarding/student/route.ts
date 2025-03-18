import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Get the authenticated Clerk user data to access the email
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Could not retrieve user data" }, { status: 500 });
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ error: "User email not available" }, { status: 400 });
    }

    const body = await request.json();
    console.log("Student onboarding data received:", JSON.stringify(body, null, 2));
    
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

    console.log("Extracted fields:");
    console.log("skills:", skills);
    console.log("languages:", languages);
    console.log("achievements:", achievements);
    console.log("financialBackground:", financialBackground);
    console.log("careerGoals:", careerGoals);
    console.log("locationPreferences:", locationPreferences);

    // Find existing user first
    let userDoc = await User.findOne({ clerkId: userId });
    
    // Only create user if doesn't exist
    if (!userDoc) {
      userDoc = new User({
        clerkId: userId,
        email: userEmail, // Use email from Clerk instead of body
        role: "student",
      });
      await userDoc.save();
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

    console.log("Profile data to save:", JSON.stringify(profileData, null, 2));

    // First delete the existing profile to ensure clean state
    await StudentProfile.findOneAndDelete({ user: userDoc._id });

    // Create a new student profile from scratch
    const studentProfile = new StudentProfile(profileData);
    await studentProfile.save();

    console.log("Saved student profile:", JSON.stringify(studentProfile.toJSON(), null, 2));

    return NextResponse.json({
      message: "Student profile created/updated successfully",
      profile: studentProfile.toJSON(),
    });
  } catch (error) {
    console.error("Error in student onboarding:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 