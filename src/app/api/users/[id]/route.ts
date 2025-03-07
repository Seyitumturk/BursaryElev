import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET(
  request: Request, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Get the id parameter properly by awaiting the params object
    const { id } = await context.params;

    // Find the user by clerkId
    const user = await User.findOne({ clerkId: id });
    if (!user) {
      // If the user is "current", try to find using the authenticated userId
      if (id === "current" && userId) {
        const currentUser = await User.findOne({ clerkId: userId });
        if (currentUser) {
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 