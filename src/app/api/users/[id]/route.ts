import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET(
  request: Request, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log(`API route called: GET /api/users/[id] - Starting request processing`);
    console.log(`Attempting database connection...`);
    
    await dbConnect();
    console.log(`Database connection successful`);

    const { userId } = await auth();
    console.log(`Auth check complete. User authenticated: ${!!userId}`);
    
    if (!userId) {
      console.log(`Authentication failed: No user ID found`);
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Get the id parameter properly by awaiting the params object
    const { id } = await context.params;
    console.log(`Looking up user with ID: ${id}`);

    // Find the user by clerkId
    const user = await User.findOne({ clerkId: id });
    console.log(`User lookup result: ${!!user ? "Found" : "Not found"}`);
    
    if (!user) {
      // If the user is "current", try to find using the authenticated userId
      if (id === "current" && userId) {
        console.log(`Attempting to find current user with clerk ID: ${userId}`);
        const currentUser = await User.findOne({ clerkId: userId });
        if (currentUser) {
          console.log(`Current user found`);
          return NextResponse.json({
            id: currentUser._id,
            clerkId: currentUser.clerkId,
            email: currentUser.email,
            role: currentUser.role,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            createdAt: currentUser.createdAt,
            updatedAt: currentUser.updatedAt
          });
        }
      }
      console.log(`User not found for ID: ${id}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(`Successfully returning user data for ID: ${id}`);
    return NextResponse.json({
      id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    // More detailed error logging
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}`);
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: process.env.NODE_ENV === "production" ? undefined : (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
} 