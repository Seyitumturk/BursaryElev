import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import Bursary from "@/models/Bursary";
import OrganizationProfile from "@/models/OrganizationProfile";
import User from "@/models/User";

// SUPER SIMPLIFIED VERSION - FOCUS ON SAVING BURSARIES

/**
 * Create a bursary
 */
export async function POST(request: NextRequest) {
  console.log("======== CREATE BURSARY API CALLED ========");
  console.log("Request headers:", Object.fromEntries(request.headers.entries()));
  
  try {
    // 1. Connect to database
    console.log("Attempting to connect to MongoDB at:", process.env.MONGODB_URI);
    try {
      await dbConnect();
      console.log("✅ Database connected successfully");
    } catch (dbError) {
      console.error("❌ DATABASE CONNECTION ERROR:", dbError);
      return NextResponse.json(
        { error: "Failed to connect to database: " + (dbError instanceof Error ? dbError.message : String(dbError)) },
        { status: 500 }
      );
    }
    
    // 2. Get the bursary data from request
    let bursaryData;
    try {
      bursaryData = await request.json();
      console.log("✅ Received bursary data:", JSON.stringify(bursaryData, null, 2));
    } catch (parseError) {
      console.error("❌ FAILED TO PARSE REQUEST BODY:", parseError);
      return NextResponse.json(
        { error: "Invalid request body: " + (parseError instanceof Error ? parseError.message : String(parseError)) },
        { status: 400 }
      );
    }
    
    // 3. Get user ID from auth or fallback to header
    let userId;
    try {
      const session = await auth();
      userId = session?.userId;
      console.log("✅ Auth userId:", userId);
    } catch (error) {
      console.error("❌ Failed to get userId from auth:", error);
      
      // Try to get from headers
      const authHeader = request.headers.get("authorization") || request.headers.get("x-clerk-auth-token");
      if (authHeader) {
        userId = "user_" + Date.now(); // Fallback ID if we can't extract real one
        console.log("Using fallback userId:", userId);
      }
    }
    
    if (!userId) {
      console.error("❌ ERROR: No user ID found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // 4. Create or find user
    let user;
    try {
      user = await User.findOne({ clerkId: userId });
      
      if (!user) {
        console.log("Creating new user with ID:", userId);
        user = new User({
          clerkId: userId,
          email: "user@example.com", // Placeholder
          role: "organization",
          firstName: "New",
          lastName: "User"
        });
        
        await user.save();
        console.log("✅ Created new user:", user._id);
      } else {
        console.log("✅ Found existing user:", user._id);
      }
    } catch (userError) {
      console.error("❌ USER CREATION/LOOKUP ERROR:", userError);
      return NextResponse.json(
        { error: "Failed to create/find user: " + (userError instanceof Error ? userError.message : String(userError)) },
        { status: 500 }
      );
    }
    
    // 5. Create or find organization profile
    let orgProfile;
    try {
      orgProfile = await OrganizationProfile.findOne({ user: user._id });
      
      if (!orgProfile) {
        console.log("Creating organization profile for user:", user._id);
        orgProfile = new OrganizationProfile({
          user: user._id,
          name: "Default Organization",
          title: "Default Organization",
          description: "Auto-created organization profile",
          contact: {
            email: user.email || "default@example.com"
          },
          address: {
            country: "Unknown"
          },
          status: "active"
        });
        
        await orgProfile.save();
        console.log("✅ Created organization profile:", orgProfile._id);
      } else {
        console.log("✅ Found existing organization profile:", orgProfile._id);
      }
    } catch (orgError) {
      console.error("❌ ORGANIZATION PROFILE ERROR:", orgError);
      return NextResponse.json(
        { error: "Failed to create/find organization profile: " + (orgError instanceof Error ? orgError.message : String(orgError)) },
        { status: 500 }
      );
    }
    
    // 6. Create and save the bursary
    console.log("Creating bursary...");
    try {
      const newBursary = new Bursary({
        title: bursaryData.title,
        description: bursaryData.description,
        applicationUrl: bursaryData.applicationUrl,
        deadline: new Date(bursaryData.deadline),
        awardAmount: Number(bursaryData.awardAmount),
        eligibilityCriteria: bursaryData.eligibilityCriteria || "None specified",
        fieldOfStudy: bursaryData.fieldOfStudy || ["Other"],
        academicLevel: bursaryData.academicLevel || ["undergraduate"],
        financialNeedLevel: bursaryData.financialNeedLevel || "medium",
        requiredDocuments: bursaryData.requiredDocuments || [],
        documents: bursaryData.documents || [],
        organization: orgProfile._id,
        contentModerationStatus: "approved",
      });
      
      console.log("Bursary object created:", newBursary);
      console.log("Attempting to save to database...");
      
      // Save to database
      await newBursary.save();
      console.log("✅ SUCCESS! BURSARY SAVED:", newBursary._id);
      
      // Return success response
      return NextResponse.json(newBursary);
    } catch (bursaryError: any) {
      console.error("❌ BURSARY CREATION ERROR:", bursaryError);
      // Check if it's a validation error
      if (bursaryError.name === 'ValidationError') {
        const validationErrors = Object.keys(bursaryError.errors).map(field => ({
          field,
          message: bursaryError.errors[field].message
        }));
        console.error("Validation errors:", validationErrors);
        return NextResponse.json(
          { error: "Validation failed", details: validationErrors },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to create bursary: " + (bursaryError instanceof Error ? bursaryError.message : String(bursaryError)) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ UNHANDLED ERROR CREATING BURSARY:", error);
    return NextResponse.json(
      { error: "Failed to create bursary: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

/**
 * Get all bursaries
 */
export async function GET(request: NextRequest) {
  console.log("GET BURSARIES API CALLED");
  
  try {
    await dbConnect();
    
    // Check if we need to filter by current user's organization
    const url = new URL(request.url);
    const myBursariesOnly = url.searchParams.get('myBursariesOnly') === 'true';
    console.log("Filter by my bursaries only:", myBursariesOnly);
    
    let query = {};
    
    // If filtering by current user, get their organization ID
    if (myBursariesOnly) {
      try {
        const session = await auth();
        const userId = session?.userId;
        
        if (userId) {
          console.log("Filtering bursaries for user:", userId);
          
          // Find the user
          const user = await User.findOne({ clerkId: userId });
          
          if (user) {
            // Find the organization profile
            const orgProfile = await OrganizationProfile.findOne({ user: user._id });
            
            if (orgProfile) {
              console.log("Found organization profile:", orgProfile._id);
              query = { organization: orgProfile._id };
              console.log("Filtering bursaries by organization:", orgProfile._id);
            } else {
              console.log("No organization profile found for user");
              // Return empty array if no organization profile
              return NextResponse.json([]);
            }
          } else {
            console.log("No user found with clerkId:", userId);
            // Return empty array if no user found
            return NextResponse.json([]);
          }
        } else {
          console.log("No user ID found in session");
          // Return empty array if no user ID
          return NextResponse.json([]);
        }
      } catch (error) {
        console.error("Error filtering by user:", error);
        // Continue with empty query (show all) if there's an error
      }
    }
    
    console.log("Using query:", query);
    
    // Get bursaries with the constructed query, most recent first
    const bursaries = await Bursary.find(query)
      .populate({
        path: "organization",
        select: "title name description contact images"
      })
      .sort({ createdAt: -1 });
    
    console.log(`Found ${bursaries.length} bursaries`);
    return NextResponse.json(bursaries);
  } catch (error) {
    console.error("ERROR FETCHING BURSARIES:", error);
    return NextResponse.json(
      { error: "Failed to fetch bursaries" },
      { status: 500 }
    );
  }
} 