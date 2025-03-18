import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import StudentProfile from '@/models/StudentProfile';
import User from '@/models/User';
import { generateProfileSummary } from '@/lib/profileSummary';

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Find user in our database
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure user is a student
    if (user.role !== 'student') {
      return NextResponse.json({ error: 'Profile summary only available for student profiles' }, { status: 403 });
    }

    // Get student profile
    const studentProfile = await StudentProfile.findOne({ user: user._id });
    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Student profile not found, please complete onboarding' }, 
        { status: 404 }
      );
    }

    // Generate profile summary
    const profileSummary = generateProfileSummary(studentProfile);

    // Return the profile summary
    return NextResponse.json({
      summary: profileSummary
    });

  } catch (error: any) {
    console.error('Error generating profile summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate profile summary', details: error.message },
      { status: 500 }
    );
  }
} 