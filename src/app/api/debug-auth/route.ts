import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
  try {
    // Get auth information
    const { userId, sessionId, sessionClaims } = auth();
    
    // Get current user details
    const user = await currentUser();
    
    // Get database information if possible
    let dbUser = null;
    if (userId) {
      try {
        await dbConnect();
        dbUser = await User.findOne({ clerkId: userId }).lean();
      } catch (error) {
        console.error("Error fetching user from database:", error);
      }
    }
    
    // Return comprehensive debug information
    return NextResponse.json({
      auth: {
        userId,
        sessionId,
        isAuthenticated: !!userId,
        sessionClaims,
        metadata: sessionClaims?.metadata || null
      },
      user: user ? {
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress || null,
        firstName: user.firstName,
        lastName: user.lastName,
        metadata: {
          publicMetadata: user.publicMetadata,
          privateMetadata: user.privateMetadata
        }
      } : null,
      database: dbUser ? {
        id: dbUser._id.toString(),
        email: dbUser.email,
        role: dbUser.role,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName
      } : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Debug auth error:", error);
    return NextResponse.json({
      error: "Error getting debug information",
      message: error.message
    }, { status: 500 });
  }
} 