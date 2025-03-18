import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import Bursary from '@/models/Bursary';
import StudentProfile from '@/models/StudentProfile';
import User from '@/models/User';
import { getRecommendedBursaries } from '@/lib/matchingEngine';

export async function GET(req: NextRequest) {
  try {
    // Get query parameters - default to true for AI inclusion
    const includeAI = req.nextUrl.searchParams.get('includeAI') !== 'false';
    
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
      return NextResponse.json({ error: 'Only student profiles can access matches' }, { status: 403 });
    }

    // Get student profile
    const studentProfile = await StudentProfile.findOne({ user: user._id });
    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Student profile not found, please complete onboarding' }, 
        { status: 404 }
      );
    }

    // Get all active bursaries
    const bursaries = await Bursary.find({})
      .populate({
        path: 'organization',
        select: '_id title name images contact', 
      });

    // Use matching engine to get recommended bursaries with AI matching if requested
    const matches = await getRecommendedBursaries(studentProfile, bursaries, includeAI);

    // Return top matches with details
    return NextResponse.json({
      matches: matches.map(match => ({
        bursary: match.bursary,
        matchScore: match.matchScore
      }))
    });

  } catch (error: any) {
    console.error('Error in bursary matching:', error);
    return NextResponse.json(
      { error: 'Failed to process matches', details: error.message },
      { status: 500 }
    );
  }
} 