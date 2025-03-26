import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Bursary from '@/models/Bursary';
import StudentProfile from '@/models/StudentProfile';
import OrganizationProfile from '@/models/OrganizationProfile';

export async function GET() {
  try {
    // Connect to database
    await dbConnect();
    
    // Verify the user is authenticated
    const { userId, sessionClaims } = auth();
    
    // Different behavior based on environment
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      console.log("[Admin Analytics] Auth check - userId:", userId);
      console.log("[Admin Analytics] Auth check - sessionClaims:", JSON.stringify(sessionClaims, null, 2));
    }
    
    // Use auth bypass only in development mode
    let userIdToUse = userId;
    let isAdmin = false;
    
    // In production, strictly enforce authentication
    if (!isDev && !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // In production, check role properly
    if (!isDev) {
      // First check Clerk metadata
      const clerkRole = sessionClaims?.metadata?.role;
      
      if (clerkRole === "admin") {
        isAdmin = true;
      } else {
        // If not in Clerk metadata, check the database
        const userDoc = await User.findOne({ clerkId: userId }).lean();
        isAdmin = userDoc?.role === "admin";
      }
      
      // For production, strictly enforce admin role
      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } 
    // Development mode allows bypassing admin check
    else if (!userId) {
      // In development, try to find any admin user if not authenticated
      const anyAdminUser = await User.findOne({ role: "admin" }).lean();
      if (anyAdminUser) {
        userIdToUse = anyAdminUser.clerkId;
        isAdmin = true;
      }
    }
    
    // Get current date and dates for time-based metrics
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Fetch recent users to check if user with clerkId exists
    if (userIdToUse) {
      let userExists = false;
      try {
        const dbUser = await User.findOne({ clerkId: userIdToUse }).lean();
        console.log("[Admin Analytics] Current user in database:", dbUser);
        userExists = !!dbUser;
      } catch (error) {
        console.error("[Admin Analytics] Error checking user:", error);
      }
      
      if (!userExists) {
        console.log("[Admin Analytics] WARNING: User not found in database. Data will be returned but this should be fixed.");
      }
    }
    
    // Calculate yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Calculate a week ago
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    console.log("[Admin Analytics] Fetching data from database");
    
    // Fetch user and bursary counts with proper error handling
    let totalStudents = 0;
    let totalAdmins = 0;
    let totalFunders = 0;
    let newStudentsThisMonth = 0;
    let newAdminsThisMonth = 0;
    let newFundersThisMonth = 0;
    let totalBursaries = 0;
    let activeBursaries = 0;
    let bursariesThisMonth = 0;
    let totalStudentProfiles = 0;
    let totalOrgProfiles = 0;
    
    try {
      totalStudents = await User.countDocuments({ role: "student" });
      console.log(`[Admin Analytics] Total students: ${totalStudents}`);
    } catch (error) {
      console.error("[Admin Analytics] Error counting students:", error);
    }
    
    try {
      totalAdmins = await User.countDocuments({ role: "admin" });
      console.log(`[Admin Analytics] Total admins: ${totalAdmins}`);
    } catch (error) {
      console.error("[Admin Analytics] Error counting admins:", error);
    }
    
    try {
      totalFunders = await User.countDocuments({ role: "funder" });
      console.log(`[Admin Analytics] Total funders: ${totalFunders}`);
    } catch (error) {
      console.error("[Admin Analytics] Error counting funders:", error);
    }
    
    try {
      newStudentsThisMonth = await User.countDocuments({ 
        role: "student", 
        createdAt: { $gte: firstDayOfMonth } 
      });
      console.log(`[Admin Analytics] New students this month: ${newStudentsThisMonth}`);
    } catch (error) {
      console.error("[Admin Analytics] Error counting new students:", error);
    }
    
    try {
      newAdminsThisMonth = await User.countDocuments({ 
        role: "admin", 
        createdAt: { $gte: firstDayOfMonth } 
      });
      console.log(`[Admin Analytics] New admins this month: ${newAdminsThisMonth}`);
    } catch (error) {
      console.error("[Admin Analytics] Error counting new admins:", error);
    }
    
    try {
      newFundersThisMonth = await User.countDocuments({ 
        role: "funder", 
        createdAt: { $gte: firstDayOfMonth } 
      });
      console.log(`[Admin Analytics] New funders this month: ${newFundersThisMonth}`);
    } catch (error) {
      console.error("[Admin Analytics] Error counting new funders:", error);
    }
    
    try {
      totalBursaries = await Bursary.countDocuments({});
      console.log(`[Admin Analytics] Total bursaries: ${totalBursaries}`);
    } catch (error) {
      console.error("[Admin Analytics] Error counting bursaries:", error);
    }
    
    try {
      activeBursaries = await Bursary.countDocuments({ 
        contentModerationStatus: "approved"
      });
      console.log(`[Admin Analytics] Active bursaries: ${activeBursaries}`);
    } catch (error) {
      console.error("[Admin Analytics] Error counting active bursaries:", error);
    }
    
    try {
      bursariesThisMonth = await Bursary.countDocuments({ 
        createdAt: { $gte: firstDayOfMonth } 
      });
      console.log(`[Admin Analytics] Bursaries this month: ${bursariesThisMonth}`);
    } catch (error) {
      console.error("[Admin Analytics] Error counting bursaries this month:", error);
    }
    
    try {
      totalStudentProfiles = await StudentProfile.countDocuments({});
      console.log(`[Admin Analytics] Total student profiles: ${totalStudentProfiles}`);
    } catch (error) {
      console.error("[Admin Analytics] Error counting student profiles:", error);
    }
    
    try {
      totalOrgProfiles = await OrganizationProfile.countDocuments({});
      console.log(`[Admin Analytics] Total organization profiles: ${totalOrgProfiles}`);
    } catch (error) {
      console.error("[Admin Analytics] Error counting organization profiles:", error);
    }
    
    // Get recent users
    console.log("[Admin Analytics] Fetching recent users");
    let recentUsers = [];
    try {
      recentUsers = await User.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      console.log(`[Admin Analytics] Found ${recentUsers.length} recent users`);
    } catch (error) {
      console.error("[Admin Analytics] Error fetching recent users:", error);
    }
    
    // Get most recent bursaries with organization names
    console.log("[Admin Analytics] Fetching recent bursaries");
    let recentBursaries = [];
    try {
      recentBursaries = await Bursary.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('organization', 'name')
        .lean();
      console.log(`[Admin Analytics] Found ${recentBursaries.length} recent bursaries`);
      if (recentBursaries.length > 0) {
        console.log("[Admin Analytics] First bursary sample:", JSON.stringify(recentBursaries[0] || {}, null, 2));
      }
    } catch (error) {
      console.error("[Admin Analytics] Error fetching recent bursaries:", error);
    }
    
    // Get bursaries with highest award amounts
    console.log("[Admin Analytics] Fetching high value bursaries");
    let highValueBursaries = [];
    try {
      highValueBursaries = await Bursary.find({})
        .sort({ awardAmount: -1 })
        .limit(5)
        .populate('organization', 'name')
        .lean();
      console.log(`[Admin Analytics] Found ${highValueBursaries.length} high value bursaries`);
      if (highValueBursaries.length > 0) {
        console.log(`[Admin Analytics] Highest award amount: ${highValueBursaries[0].awardAmount || 'N/A'}`);
      }
    } catch (error) {
      console.error("[Admin Analytics] Error fetching high value bursaries:", error);
    }
    
    // Format recent user registrations
    const recentRegistrations = recentUsers.map(user => ({
      id: user._id.toString(),
      name: user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email,
      email: user.email,
      type: user.role,
      date: user.createdAt.toISOString().split('T')[0]
    }));
    
    // Format top bursaries using real data but mock views
    const topBursaries = recentBursaries.map((bursary, index) => {
      // Calculate a pseudorandom view count based on the bursary ID
      const bursaryIdSum = bursary._id.toString()
        .split('')
        .reduce((sum, char) => sum + char.charCodeAt(0), 0);
      
      const views = (bursaryIdSum % 500) + 100; // 100-599 range
      const clicks = Math.floor(views * 0.4); // 40% of views
      
      const orgName = bursary.organization && 
        typeof bursary.organization === 'object' && 
        bursary.organization.name ? 
        bursary.organization.name : 'Unknown Organization';
      
      return {
        id: bursary._id.toString(),
        title: bursary.title || 'Untitled Bursary',
        organization: orgName,
        awardAmount: bursary.awardAmount || 0,
        applicationUrl: bursary.applicationUrl || '#',
        deadline: bursary.deadline ? new Date(bursary.deadline).toISOString().split('T')[0] : 'No deadline',
        views,
        clicks,
      };
    });
    
    // Format high value bursaries
    const topValueBursaries = highValueBursaries.map(bursary => {
      const orgName = bursary.organization && 
        typeof bursary.organization === 'object' && 
        bursary.organization.name ? 
        bursary.organization.name : 'Unknown Organization';
      
      return {
        id: bursary._id.toString(),
        title: bursary.title || 'Untitled Bursary',
        organization: orgName,
        awardAmount: bursary.awardAmount || 0,
        applicationUrl: bursary.applicationUrl || '#',
        deadline: bursary.deadline ? new Date(bursary.deadline).toISOString().split('T')[0] : 'No deadline',
      };
    });
    
    // Calculate profile completion rates
    const profileCompletionRate = totalStudents > 0 ? 
      Math.min(100, Math.round((totalStudentProfiles / totalStudents) * 100)) : 0;
    
    // Since we're not tracking organization profiles against admin users,
    // just use total org profiles if they exist
    const orgProfileCompletionRate = totalOrgProfiles > 0 ? 100 : 0;
    
    const analyticsData = {
      // User metrics
      totalStudents,
      totalAdmins,
      totalFunders,
      newStudentsThisMonth,
      newAdminsThisMonth,
      newFundersThisMonth,
      totalUsers: totalStudents + totalAdmins + totalFunders,
      
      // Bursary metrics
      totalBursaries,
      activeBursaries,
      bursariesThisMonth,
      
      // Profile metrics
      profileCompletionRate,
      orgProfileCompletionRate,
      
      // Placeholder metrics (not yet tracked in the database)
      totalClicks: 4237, // Placeholder for now
      totalViews: 12845, // Placeholder for now
      
      // Detailed data
      recentRegistrations,
      topBursaries,
      topValueBursaries,
    };

    console.log("[Admin Analytics] Returning data:", JSON.stringify({
      userCounts: {
        totalStudents,
        totalAdmins,
        totalFunders,
        totalUsers: totalStudents + totalAdmins + totalFunders
      },
      bursaryCounts: {
        totalBursaries,
        activeBursaries,
        bursariesThisMonth
      },
      detailCounts: {
        topBursariesCount: topBursaries.length,
        topValueBursariesCount: topValueBursaries.length,
        recentRegistrationsCount: recentRegistrations.length
      }
    }, null, 2));
    
    // Return comprehensive analytics data
    return NextResponse.json(analyticsData);
    
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 