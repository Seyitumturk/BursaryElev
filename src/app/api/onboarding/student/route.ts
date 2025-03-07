import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
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

    // Find existing user first
    let userDoc = await User.findOne({ clerkId: userId });
    
    // Only create user if doesn't exist
    if (!userDoc) {
      userDoc = new User({
        clerkId: userId,
        email: body.email,
        role: "student",
      });
      await userDoc.save();
    }

    // Update or create student profile
    const studentProfile = await StudentProfile.findOneAndUpdate(
      { user: userDoc._id },
      {
        institution,
        major,
        graduationYear,
        interests,
        bio,
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      message: "Student profile created/updated successfully",
      profile: studentProfile,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 