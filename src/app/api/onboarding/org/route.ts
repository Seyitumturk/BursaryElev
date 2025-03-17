import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import OrganizationProfile from "@/models/OrganizationProfile";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const body = await request.json();
    
    // Find existing user first
    let userDoc = await User.findOne({ clerkId: userId });
    
    // Only create user if doesn't exist
    if (!userDoc) {
      userDoc = new User({
        clerkId: userId,
        email: body.email,
        role: "funder",
      });
      await userDoc.save();
    } else {
      // Update role if needed
      if (userDoc.role !== "funder") {
        userDoc.role = "funder";
        await userDoc.save();
      }
    }

    // Update or create organization profile
    const orgProfile = await OrganizationProfile.findOneAndUpdate(
      { user: userDoc._id },
      {
        name: body.title,
        title: body.title,
        category: body.category,
        about: body.about,
        mission: body.mission,
        contact: {
          address: body.address,
          province: body.province,
          city: body.city,
          postalCode: body.postalCode,
          officeNumber: body.officeNumber,
          alternativePhone: body.alternativePhone,
          email: body.email,
          website: body.website,
          socialMedia: {
            twitter: body.twitter,
            facebook: body.facebook,
            linkedin: body.linkedin,
          },
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      message: "Organization profile created/updated successfully",
      profile: orgProfile,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 