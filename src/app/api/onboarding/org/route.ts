import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import OrganizationProfile from "@/models/OrganizationProfile";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    console.log("[Org Onboarding] Starting organization onboarding process");
    console.log("[Org Onboarding] Connecting to database...");
    await dbConnect();
    console.log("[Org Onboarding] Database connection successful");

    const { userId } = await auth();
    console.log(`[Org Onboarding] Auth check complete. User authenticated: ${!!userId}`);
    if (!userId) {
      console.log("[Org Onboarding] Authentication failed: No user ID found");
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Get the authenticated Clerk user data to access the email
    console.log("[Org Onboarding] Retrieving Clerk user data");
    const clerkUser = await currentUser();
    if (!clerkUser) {
      console.log("[Org Onboarding] Failed to retrieve Clerk user data");
      return NextResponse.json({ error: "Could not retrieve user data" }, { status: 500 });
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
    console.log(`[Org Onboarding] User email found: ${!!userEmail}`);

    console.log("[Org Onboarding] Parsing request body");
    const body = await request.json();
    console.log("[Org Onboarding] Organization data received:", JSON.stringify(body, null, 2));
    
    // Find existing user first
    console.log(`[Org Onboarding] Looking for existing user with clerkId: ${userId}`);
    let userDoc = await User.findOne({ clerkId: userId });
    console.log(`[Org Onboarding] User exists: ${!!userDoc}`);
    
    // Only create user if doesn't exist
    if (!userDoc) {
      console.log("[Org Onboarding] Creating new user document");
      userDoc = new User({
        clerkId: userId,
        email: userEmail || body.email, // Prefer Clerk email but fallback to body
        role: "funder",
      });
      await userDoc.save();
      console.log(`[Org Onboarding] New user created with ID: ${userDoc._id}`);
    } else {
      // Update role if needed
      if (userDoc.role !== "funder") {
        console.log(`[Org Onboarding] Updating user role from ${userDoc.role} to funder`);
        userDoc.role = "funder";
        await userDoc.save();
        console.log("[Org Onboarding] User role updated successfully");
      }
    }

    // Update or create organization profile
    console.log(`[Org Onboarding] Updating or creating organization profile for user: ${userDoc._id}`);
    const orgProfileData = {
      name: body.title,
      title: body.title,
      category: body.category,
      about: body.about,
      mission: body.mission,
      targetDemographics: body.targetDemographics || [],
      fundingAmount: body.fundingAmount || "",
      applicationDeadlines: body.applicationDeadlines || "",
      scholarshipTypes: body.scholarshipTypes || [],
      eligibilityCriteria: body.eligibilityCriteria || [],
      fundingHistory: body.fundingHistory || "",
      successStories: body.successStories || "",
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
    };
    
    console.log("[Org Onboarding] Organization profile data:", JSON.stringify(orgProfileData, null, 2));
    
    const orgProfile = await OrganizationProfile.findOneAndUpdate(
      { user: userDoc._id },
      orgProfileData,
      { new: true, upsert: true }
    );
    
    console.log(`[Org Onboarding] Organization profile ${orgProfile.isNew ? 'created' : 'updated'} with ID: ${orgProfile._id}`);

    return NextResponse.json({
      message: "Organization profile created/updated successfully",
      profile: orgProfile,
    });
  } catch (error) {
    console.error("[Org Onboarding] Error in organization onboarding:", error);
    // More detailed error logging
    if (error instanceof Error) {
      console.error(`[Org Onboarding] Error name: ${error.name}`);
      console.error(`[Org Onboarding] Error message: ${error.message}`);
      console.error(`[Org Onboarding] Error stack: ${error.stack}`);
    }
    if (error instanceof mongoose.Error) {
      console.error(`[Org Onboarding] MongoDB error details:`, error);
    }
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: process.env.NODE_ENV === "production" ? undefined : (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
} 