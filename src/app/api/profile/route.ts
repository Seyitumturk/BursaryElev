import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import OrganizationProfile from "@/models/OrganizationProfile";

export async function GET() {
  try {
    await dbConnect();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const userDoc = await User.findOne({ clerkId: userId });
    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let profileData = null;

    if (userDoc.role === "student") {
      profileData = await StudentProfile.findOne({ user: userDoc._id }).lean();
      console.log("Retrieved student profile:", JSON.stringify(profileData, null, 2));
    } else {
      profileData = await OrganizationProfile.findOne({ user: userDoc._id }).lean();
    }

    return NextResponse.json({ 
      profile: profileData, 
      role: userDoc.role 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const userDoc = await User.findOne({ clerkId: userId });
    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the raw body data
    const body = await request.json();
    console.log("PROFILE UPDATE RAW REQUEST:", JSON.stringify(body, null, 2));
    
    let updatedProfile;

    if (userDoc.role === "student") {
      // Student profile update logic - Create a complete object with all fields
      const updateData = {
        user: userDoc._id,
        institution: body.institution || "",
        major: body.major || "",
        graduationYear: typeof body.graduationYear === 'number' ? body.graduationYear : 
                     (typeof body.graduationYear === 'string' ? parseInt(body.graduationYear) : new Date().getFullYear() + 4),
        interests: Array.isArray(body.interests) ? body.interests : [],
        bio: body.bio || "",
        skills: Array.isArray(body.skills) ? body.skills : [],
        languages: Array.isArray(body.languages) ? body.languages : [],
        achievements: Array.isArray(body.achievements) ? body.achievements : [],
        financialBackground: body.financialBackground || "",
        careerGoals: body.careerGoals || "",
        locationPreferences: Array.isArray(body.locationPreferences) ? body.locationPreferences : [],
      };
      
      console.log("STUDENT PROFILE UPDATE DATA:", JSON.stringify(updateData, null, 2));
      
      // Delete and recreate to ensure all fields are properly set
      await StudentProfile.findOneAndDelete({ user: userDoc._id });
      
      // Create a new profile with all fields
      updatedProfile = new StudentProfile(updateData);
      await updatedProfile.save();
      
      console.log("UPDATED STUDENT PROFILE:", JSON.stringify(updatedProfile.toJSON(), null, 2));
    } else {
      // CRITICAL FIX: Use MongoDB $set operator to update individual fields properly
      // This prevents replacing entire objects and preserves fields not explicitly set
      
      // Create a flat dot notation object for all nested fields
      const flattenedUpdate = flattenObject(body);
      
      // Remove _id, __v and timestamps from the update
      delete flattenedUpdate['_id'];
      delete flattenedUpdate['__v'];
      delete flattenedUpdate['createdAt'];
      delete flattenedUpdate['updatedAt'];
      
      // Set user ID
      flattenedUpdate['user'] = userDoc._id;
      
      // Create a proper $set update
      const updateOperation = {
        $set: flattenedUpdate
      };
      
      console.log("USING $SET UPDATE:", JSON.stringify(updateOperation, null, 2));
      
      // Update the profile with proper $set
      updatedProfile = await OrganizationProfile.findOneAndUpdate(
        { user: userDoc._id },
        updateOperation,
        { new: true, upsert: true }
      );
      
      console.log("UPDATED PROFILE RESULT:", JSON.stringify(updatedProfile, null, 2));
    }

    return NextResponse.json({ 
      message: "Profile updated successfully", 
      profile: userDoc.role === "student" ? updatedProfile.toJSON() : updatedProfile,
      role: userDoc.role
    });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Helper function to flatten nested objects for MongoDB $set
function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    // If it's not a plain object or it contains _id, don't flatten further
    if (typeof obj[key] !== 'object' || obj[key] === null || key === '_id') {
      acc[newKey] = obj[key];
    } else {
      const flattened = flattenObject(obj[key], newKey);
      Object.assign(acc, flattened);
    }
    
    return acc;
  }, {});
} 