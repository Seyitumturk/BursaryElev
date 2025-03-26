import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    console.log("[Admin Onboarding] Starting admin onboarding process");
    console.log("[Admin Onboarding] Connecting to database...");
    await dbConnect();
    console.log("[Admin Onboarding] Database connection successful");

    const { userId } = await auth();
    console.log(`[Admin Onboarding] Auth check complete. User authenticated: ${!!userId}`);
    if (!userId) {
      console.log("[Admin Onboarding] Authentication failed: No user ID found");
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Get the authenticated Clerk user data to access the email
    console.log("[Admin Onboarding] Retrieving Clerk user data");
    const clerkUser = await currentUser();
    if (!clerkUser) {
      console.log("[Admin Onboarding] Failed to retrieve Clerk user data");
      return NextResponse.json({ error: "Could not retrieve user data" }, { status: 500 });
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
    console.log(`[Admin Onboarding] User email found: ${!!userEmail}`);
    if (!userEmail) {
      console.log("[Admin Onboarding] No email address available for user");
      return NextResponse.json({ error: "User email not available" }, { status: 400 });
    }

    console.log("[Admin Onboarding] Parsing request body");
    const body = await request.json();
    console.log("[Admin Onboarding] Admin onboarding data received:", JSON.stringify(body, null, 2));
    
    // Extract all fields with strong typing
    const { 
      fullName,
      position,
      contact,
      bio
    } = body;

    // Split fullName into firstName and lastName
    let firstName = "", lastName = "";
    if (fullName) {
      const nameParts = fullName.split(" ");
      firstName = nameParts[0] || "";
      lastName = nameParts.slice(1).join(" ") || "";
    }

    // Find existing user first
    console.log(`[Admin Onboarding] Looking for existing user with clerkId: ${userId}`);
    let userDoc = await User.findOne({ clerkId: userId });
    console.log(`[Admin Onboarding] User exists: ${!!userDoc}`);
    
    // Only create user if doesn't exist
    if (!userDoc) {
      console.log("[Admin Onboarding] Creating new user document");
      userDoc = new User({
        clerkId: userId,
        email: userEmail, // Use email from Clerk instead of body
        role: "admin",
        firstName,
        lastName,
        // Store additional admin information in the User document
        adminInfo: {
          position,
          contact,
          bio: bio || ""
        }
      });
      await userDoc.save();
      console.log(`[Admin Onboarding] New admin user created with ID: ${userDoc._id}`);
    } else {
      // Update existing user to be an admin
      console.log(`[Admin Onboarding] Updating existing user to admin role: ${userDoc._id}`);
      userDoc.role = "admin";
      userDoc.firstName = firstName;
      userDoc.lastName = lastName;
      
      // Update or create adminInfo field
      userDoc.adminInfo = {
        position,
        contact,
        bio: bio || ""
      };
      
      await userDoc.save();
    }

    // Now update Clerk metadata with the admin role
    try {
      // This part will require Clerk API but we can handle in frontend
      console.log("[Admin Onboarding] Setting user role in localStorage");
    } catch (clerkError) {
      console.error("[Admin Onboarding] Error updating Clerk metadata:", clerkError);
      // Continue anyway - we've updated the local DB
    }

    return NextResponse.json({
      message: "Admin account created successfully",
      user: {
        id: userDoc._id,
        email: userDoc.email,
        role: userDoc.role,
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        position: userDoc.adminInfo?.position || position || "",
        contact: userDoc.adminInfo?.contact || contact || "",
        bio: userDoc.adminInfo?.bio || bio || ""
      }
    });
  } catch (error) {
    console.error("[Admin Onboarding] Error in admin onboarding:", error);
    // More detailed error logging
    if (error instanceof Error) {
      console.error(`[Admin Onboarding] Error name: ${error.name}`);
      console.error(`[Admin Onboarding] Error message: ${error.message}`);
      console.error(`[Admin Onboarding] Error stack: ${error.stack}`);
    }
    if (error instanceof mongoose.Error) {
      console.error(`[Admin Onboarding] MongoDB error details:`, error);
    }
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: process.env.NODE_ENV === "production" ? undefined : (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
} 