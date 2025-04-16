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
          studentProfile = await StudentProfile.findOne().sort({ createdAt: -1 });
          
          if (!studentProfile) {
            return NextResponse.json({ error: 'No student profiles found' }, { status: 404 });
          }

          console.log(`Found latest student profile for development: ${studentProfile._id}`);
          console.log(`Profile data: Institution: ${studentProfile.institution}, Major: ${studentProfile.major}`);
        } else {
          const user = await User.findOne({ clerkId: userId });
          if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
          }
          
          studentProfile = await StudentProfile.findOne({ user: user._id });
          
          if (!studentProfile) {
            // Try to find any profile if the user-specific one isn't found
            console.log('User-specific profile not found, finding latest profile for development');
            studentProfile = await StudentProfile.findOne().sort({ createdAt: -1 });
            
            if (!studentProfile) {
              return NextResponse.json({ error: 'No student profiles found' }, { status: 404 });
            }
          }
        }
      } else {
        // Get by specific ID
        studentProfile = await StudentProfile.findById(id);
      }
      
      if (!studentProfile) {
        return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
      }
      
      console.log(`Found student profile: ${studentProfile._id}`);
      console.log(`Using institution: ${studentProfile.institution}, major: ${studentProfile.major}`);
      
      // Generate summary
      const summary = await generateStudentSummary(studentProfile);
      console.log("Generated AI summary:", summary.substring(0, 100) + "...");
      
      return NextResponse.json({ summary });
    } else {
      // Get bursary
      const bursary = await Bursary.findById(id);
      
      if (!bursary) {
        return NextResponse.json({ error: 'Bursary not found' }, { status: 404 });
      }
      
      console.log(`Found bursary: ${bursary._id}`);

      // --- Caching Logic Start ---
      const cacheMaxAgeDays = 7;
      const badCacheString = "Mock response: Unrecognized prompt type. Claude would normally respond here."; // Define the bad string
      let useCache = false;

      if (
        bursary.aiGeneratedSummary && 
        bursary.aiGeneratedSummary !== badCacheString && // Explicitly check against the bad string
        bursary.aiSummaryLastUpdated
       ) {
        const summaryAge = Date.now() - new Date(bursary.aiSummaryLastUpdated).getTime();
        const maxAgeMillis = cacheMaxAgeDays * 24 * 60 * 60 * 1000;
        if (summaryAge < maxAgeMillis) {
          useCache = true; // Use cache only if not the bad string AND within age limit
        }
      }
      
      if (useCache) {
          console.log(`Using cached bursary summary for ${bursary._id} (generated ${bursary.aiSummaryLastUpdated!.toLocaleDateString()})`);
          return NextResponse.json({ summary: bursary.aiGeneratedSummary });
      } else if (bursary.aiGeneratedSummary === badCacheString) {
          console.log(`Cached summary for ${bursary._id} is the bad fallback string. Forcing regeneration.`);
      } else if (bursary.aiGeneratedSummary) {
          console.log(`Cached summary for ${bursary._id} is older than ${cacheMaxAgeDays} days. Regenerating.`);
      } else {
           console.log(`No cached summary found for ${bursary._id}. Generating new summary...`);
      }
      // --- Caching Logic End ---

      // Continue with generation logic only if cache wasn't used
      console.log(`Generating new summary for ${bursary._id}...`);
      // Generate summary
      let summary;
      try {
         summary = await generateBursarySummary(bursary);
         
         // Important: Check if the generated summary is actually an error message
         if (summary && !summary.startsWith("Error generating AI summary")) {
            console.log(`Successfully generated new summary for ${bursary._id}. Caching...`);
            // Save the new summary back to the database
            bursary.aiGeneratedSummary = summary;
            bursary.aiSummaryLastUpdated = new Date();
            await bursary.save();
            console.log(`Cached summary saved successfully for ${bursary._id}.`);
         } else if (summary && summary.startsWith("Error generating AI summary")) {
            // Don't save the error message back to the cache
            console.warn(`AI generation returned an error message for ${bursary._id}, not caching.`);
         } else {
            console.warn(`AI generation returned empty or null summary for ${bursary._id}, not caching.`);
            // Return a generic error or the specific error message if needed
            return NextResponse.json({ summary: "Failed to generate bursary summary at this time." }, { status: 500 });
         }
      } catch (generationError: any) {
         console.error(`Error during generateBursarySummary call for ${bursary._id}:`, generationError);
         // Return an error response if generation itself fails
         return NextResponse.json(
           { error: 'Failed to generate bursary summary', details: generationError.message },
           { status: 500 }
         );
      }

      // Return the newly generated (and possibly cached) summary
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