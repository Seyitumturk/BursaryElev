import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { email, role, firstName, lastName } = body; // expect role to be 'student' or 'organization'
    if (!email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let userDoc = await User.findOne({ clerkId: userId });
    if (!userDoc) {
      userDoc = new User({ clerkId: userId, email, role, firstName, lastName });
      await userDoc.save();
    }

    return NextResponse.json({ message: "User synced successfully", user: userDoc });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 