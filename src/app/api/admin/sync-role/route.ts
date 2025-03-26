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
    // Connect to database first
    await dbConnect();
    
    // Different behavior based on environment
    const isDev = process.env.NODE_ENV === 'development';
    
    // Verify the user is authenticated
    const { userId } = auth();
    
    if (isDev) {
      console.log("[Sync Role] Auth result - userId:", userId);
    }
    
    // In production, strictly enforce authentication
    if (!isDev && !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // For development mode, we might allow fallback to any admin user
    let userIdToUse = userId;
    
    if (isDev && !userIdToUse) {
      // Try to find any admin user for development testing
      const anyAdminUser = await User.findOne({ role: "admin" }).lean();
      if (anyAdminUser) {
        userIdToUse = anyAdminUser.clerkId;
        if (isDev) console.log("[Sync Role] Using admin user found in database:", userIdToUse);
      }
      
      if (!userIdToUse) {
        return NextResponse.json({ 
          error: "Unauthorized", 
          message: "No user found to sync role with"
        }, { status: 401 });
      }
    }
    
    // Get user from database
    const userDoc = await User.findOne({ clerkId: userIdToUse }).lean();
    
    if (!userDoc) {
      return NextResponse.json({ 
        error: "User not found", 
        message: "No user with the given clerk ID found in the database"
      }, { status: 404 });
    }
    
    if (isDev) {
      console.log("[Sync Role] Found user in database:", userDoc);
      console.log("[Sync Role] Database role:", userDoc.role);
    }
    
    try {
      // Update Clerk user metadata with role from database
      await clerkClient.users.updateUserMetadata(userIdToUse, {
        publicMetadata: {
          role: userDoc.role
        }
      });
      
      if (isDev) {
        console.log("[Sync Role] Successfully updated Clerk metadata with role:", userDoc.role);
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