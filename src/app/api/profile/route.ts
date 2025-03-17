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
    } else {
      profileData = await OrganizationProfile.findOne({ user: userDoc._id }).lean();
    }

    return NextResponse.json({ profile: profileData, role: userDoc.role });
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

    const body = await request.json();
    let updatedProfile;

    if (userDoc.role === "student") {
      // Update student profile
      updatedProfile = await StudentProfile.findOneAndUpdate(
        { user: userDoc._id },
        {
          institution: body.institution,
          major: body.major,
          graduationYear: body.graduationYear,
          interests: body.interests,
          bio: body.bio
        },
        { new: true, upsert: true }
      );
    } else {
      // Update organization profile
      updatedProfile = await OrganizationProfile.findOneAndUpdate(
        { user: userDoc._id },
        {
          title: body.title,
          category: body.category,
          about: body.about,
          mission: body.mission,
          contact: body.contact
        },
        { new: true, upsert: true }
      );
    }

    return NextResponse.json({ 
      message: "Profile updated successfully", 
      profile: updatedProfile,
      role: userDoc.role
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 