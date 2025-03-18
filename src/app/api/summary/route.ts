import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import StudentProfile from '@/models/StudentProfile';
import Bursary from '@/models/Bursary';
import User from '@/models/User';
import { generateStudentSummary, generateBursarySummary } from '@/lib/aiMatchingEngine';

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user - but don't require authentication for development
    const { userId } = auth();
    
    // Log request info for debugging
    console.log(`Summary API called. Auth userId: ${userId || 'none'}`);
    console.log(`Request URL: ${req.url}`);
    
    // DEVELOPMENT MODE: Skip all authentication checks
    // In production, you would enable these checks
    
    // Get query parameters
    const type = req.nextUrl.searchParams.get('type'); // 'student' or 'bursary'
    const id = req.nextUrl.searchParams.get('id');
    
    console.log(`Parameters - type: ${type}, id: ${id}`);
    
    if (!type || !['student', 'bursary'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type parameter. Use "student" or "bursary"' },
        { status: 400 }
      );
    }
    
    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }

    // Connect to database
    await dbConnect();

    // Generate summary based on type
    if (type === 'student') {
      // Get student profile
      let studentProfile;
      
      if (id === 'me') {
        // Handle the case where we need the current user's profile
        // In development mode, we'll try to find any student profile if userId is not provided
        if (!userId) {
          console.log('No userId for "me" request, finding first student profile for development');
          // For development, just get the first student profile
          studentProfile = await StudentProfile.findOne();
          
          if (!studentProfile) {
            return NextResponse.json({ error: 'No student profiles found' }, { status: 404 });
          }
        } else {
          const user = await User.findOne({ clerkId: userId });
          if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
          }
          
          studentProfile = await StudentProfile.findOne({ user: user._id });
        }
      } else {
        // Get by specific ID
        studentProfile = await StudentProfile.findById(id);
      }
      
      if (!studentProfile) {
        return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
      }
      
      console.log(`Found student profile: ${studentProfile._id}`);
      
      // Generate summary
      const summary = await generateStudentSummary(studentProfile);
      
      return NextResponse.json({ summary });
    } else {
      // Get bursary
      const bursary = await Bursary.findById(id);
      
      if (!bursary) {
        return NextResponse.json({ error: 'Bursary not found' }, { status: 404 });
      }
      
      console.log(`Found bursary: ${bursary._id}`);
      
      // Generate summary
      const summary = await generateBursarySummary(bursary);
      
      return NextResponse.json({ summary });
    }
  } catch (error: any) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary', details: error.message },
      { status: 500 }
    );
  }
} 