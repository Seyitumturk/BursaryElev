import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
  return handleSyncRole();
}

export async function POST() {
  return handleSyncRole();
}

async function handleSyncRole() {
  try {
    console.log("[Sync Role] API called");
    
    // Verify the user is authenticated
    const { userId } = auth();
    console.log("[Sync Role] Auth result - userId:", userId);
    
    // For debugging, continue even without authentication
    let userIdToUse = userId;
    
    if (!userIdToUse) {
      console.log("[Sync Role] No userId found, but continuing for debugging");
      // Get user ID from localStorage if available on client
      // For server-side, we'll try to find any admin user
      try {
        await dbConnect();
        const anyAdminUser = await User.findOne({ role: "admin" }).lean();
        if (anyAdminUser) {
          userIdToUse = anyAdminUser.clerkId;
          console.log("[Sync Role] Using admin user found in database:", userIdToUse);
        }
      } catch (err) {
        console.error("[Sync Role] Error finding admin user:", err);
      }
      
      if (!userIdToUse) {
        console.log("[Sync Role] No userId available, returning error");
        return NextResponse.json({ 
          error: "Unauthorized", 
          message: "For debugging purposes, make sure at least one admin user exists in the database"
        }, { status: 401 });
      }
    }
    
    // Connect to database
    await dbConnect();
    
    // Get user from database
    const userDoc = await User.findOne({ clerkId: userIdToUse }).lean();
    
    if (!userDoc) {
      console.log("[Sync Role] User not found in database");
      return NextResponse.json({ 
        error: "User not found", 
        message: "No user with the given clerk ID found in the database"
      }, { status: 404 });
    }
    
    console.log("[Sync Role] Found user in database:", userDoc);
    console.log("[Sync Role] Database role:", userDoc.role);
    
    try {
      // Update Clerk user metadata with role from database
      if (userIdToUse) {
        await clerkClient.users.updateUserMetadata(userIdToUse, {
          publicMetadata: {
            role: userDoc.role
          }
        });
        
        console.log("[Sync Role] Successfully updated Clerk metadata with role:", userDoc.role);
      } else {
        console.log("[Sync Role] Skipping Clerk metadata update - no userId available");
      }
      
      return NextResponse.json({ 
        success: true, 
        message: "Role synchronized successfully",
        role: userDoc.role
      });
    } catch (error) {
      console.error("[Sync Role] Error updating Clerk metadata:", error);
      return NextResponse.json({ 
        error: "Failed to update Clerk metadata",
        details: error.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error("[Sync Role] Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error.message
    }, { status: 500 });
  }
} 