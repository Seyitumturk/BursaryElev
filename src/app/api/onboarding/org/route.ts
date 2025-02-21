import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
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
    const {
      title,
      category,
      about,
      mission,
      address,
      province,
      city,
      postalCode,
      officeNumber,
      alternativePhone,
      email,
      website,
      socialMedia,
    } = body;

    // Validate that the required fields are present
    if (
      !title ||
      !category ||
      !about ||
      !mission ||
      !address ||
      !province ||
      !city ||
      !postalCode ||
      !officeNumber ||
      !email
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the user document or create it if missing
    let userDoc = await User.findOne({ clerkId: userId });
    if (!userDoc) {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      userDoc = new User({
        clerkId: userId,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        role: "funder",
      });
      await userDoc.save();
    }

    // Update the user's role to funder (for organizations)
    if (userDoc.role !== "funder") {
      userDoc.role = "funder";
      await userDoc.save();
    }

    // Create the organization profile document
    const newOrgProfile = new OrganizationProfile({
      user: userDoc._id,
      title,
      category,
      about,
      mission,
      images: {}, // You can later update with actual image URLs if needed
      contact: {
        address,
        province,
        city,
        postalCode,
        officeNumber,
        alternativePhone,
        email,
        website,
        socialMedia,
      },
      status: "pending",
    });
    await newOrgProfile.save();

    return NextResponse.json({
      message: "Organization profile created successfully",
      profile: newOrgProfile,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 