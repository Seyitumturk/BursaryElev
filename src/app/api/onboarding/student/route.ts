import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
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
    
    const body = await request.json();
    const { institution, major, graduationYear, interests, bio } = body;
    if (!institution || !major || !graduationYear) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the existing user document or create one if missing
    let userDoc = await User.findOne({ clerkId: userId });
    if (!userDoc) {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      userDoc = new User({
        clerkId: userId,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        role: "student",
      });
      await userDoc.save();
    }

    // Update the user's role to student if not already set
    if (userDoc.role !== "student") {
      userDoc.role = "student";
      await userDoc.save();
    }

    // Create or update the student profile
    let studentProfile = await StudentProfile.findOne({ user: userDoc._id });
    if (studentProfile) {
      studentProfile.institution = institution;
      studentProfile.major = major;
      studentProfile.graduationYear = graduationYear;
      studentProfile.interests = interests;
      studentProfile.bio = bio;
      await studentProfile.save();
    } else {
      studentProfile = new StudentProfile({
        user: userDoc._id,
        institution,
        major,
        graduationYear,
        interests,
        bio,
      });
      await studentProfile.save();
    }

    return NextResponse.json({
      message: "Student profile created/updated successfully",
      profile: studentProfile,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 