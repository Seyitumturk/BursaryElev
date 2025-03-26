"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { 
  UserIcon, 
  DocumentTextIcon, 
  CursorArrowRaysIcon, 
  TrendingUpIcon, 
  ClockIcon, 
  UserGroupIcon,
  DocumentDuplicateIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";

export default function AnalyticsDashboard() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    // User metrics
    totalStudents: 0,
    totalAdmins: 0,
    totalUsers: 0,
    newStudentsThisMonth: 0,
    newAdminsThisMonth: 0,
    totalFunders: 0,
    newFundersThisMonth: 0,
    
    // Bursary metrics
    totalBursaries: 0,
    activeBursaries: 0,
    bursariesThisMonth: 0,
    
    // Profile metrics
    profileCompletionRate: 0,
    orgProfileCompletionRate: 0,
    
    // Engagement metrics (placeholders)
    totalClicks: 0,
    totalViews: 0,
    
    // Detailed data
    recentRegistrations: [],
    topBursaries: [],
    topValueBursaries: []
  });

  // Get user role when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('userRole');
      setUserRole(storedRole);
      console.log("User role from localStorage:", storedRole);
      
      // For debugging, log all localStorage items
      const allLocalStorageItems = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        allLocalStorageItems[key] = localStorage.getItem(key);
      }
      console.log("All localStorage items:", allLocalStorageItems);
      
      // Redirect if not admin
      if (storedRole !== "admin") {
        console.log("User is not admin, redirecting to dashboard");
        router.push("/dashboard");
      } else {
        console.log("User is admin, synchronizing role before fetching data");
        // First try to sync the role with Clerk
        syncRoleWithClerk().then(() => {
          // Then fetch analytics data
          fetchAnalyticsData();
        }).catch(error => {
          console.error("Error syncing role:", error);
          // Try to fetch analytics data anyway
          fetchAnalyticsData();
        });
      }
    }
  }, [router]);

  // Sync user role between database and Clerk
  const syncRoleWithClerk = async () => {
    console.log("Syncing user role with Clerk");
    
    try {
      const response = await fetch('/api/admin/sync-role', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // Empty object as body
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Role sync error (${response.status}):`, errorText);
        throw new Error(`Failed to sync role: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Role synchronized successfully:", data);
      return data;
    } catch (error) {
      console.error("Error syncing role:", error);
      throw error;
    }
  };

  // Fetch analytics data from API
  const fetchAnalyticsData = async () => {
    console.log("Fetching analytics data from API");
    setIsLoading(true);
    
    try {
      // Use the actual API endpoint with credentials
      console.log("Making API request to /api/admin/analytics");
      const response = await fetch('/api/admin/analytics', {
        method: 'GET',
        credentials: 'same-origin', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Response status:", response.status);
      console.log("Response headers:", [...response.headers.entries()]);
      
      if (!response.ok) {
        // Get error details
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, errorText);
        
        try {
          // Try to parse as JSON if possible
          const errorJson = JSON.parse(errorText);
          console.error("Error details:", errorJson);
          throw new Error(`Error ${response.status}: ${errorJson.error || 'Unknown error'}`);
        } catch (e) {
          // If can't parse as JSON, use the raw text
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
      }
      
      const data = await response.json();
      console.log("Received analytics data:", data);
      
      // Check if data is empty or missing expected properties
      if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        console.error("Empty or invalid response data:", data);
        throw new Error("Empty or invalid response received");
      }
      
      setAnalyticsData(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      
      // Display error in the UI for debugging purposes
      setAnalyticsData(prevData => ({
        ...prevData,
        error: error.message
      }));
      
      // Fallback to dummy data if API fails
      setAnalyticsData({
        // Preserve the error message
        error: error.message,
        // User metrics
        totalStudents: 156,
        totalAdmins: 0,
        totalUsers: 188,
        newStudentsThisMonth: 24,
        newAdminsThisMonth: 0,
        totalFunders: 0,
        newFundersThisMonth: 0,
        
        // Bursary metrics
        totalBursaries: 67,
        activeBursaries: 48,
        bursariesThisMonth: 12,
        
        // Profile metrics
        profileCompletionRate: 78,
        orgProfileCompletionRate: 92,
        
        // Engagement metrics (placeholders)
        totalClicks: 2845,
        totalViews: 8236,
        
        // Detailed data
        recentRegistrations: [
          { name: "John Doe", type: "student", date: "2023-03-15" },
          { name: "ABC Organization", type: "organization", date: "2023-03-14" },
          { name: "Jane Smith", type: "student", date: "2023-03-13" },
          { name: "XYZ Foundation", type: "organization", date: "2023-03-12" }
        ],
        topBursaries: [
          { title: "Excellence in Computer Science", organization: "Tech Foundation", views: 328, clicks: 112 },
          { title: "Women in STEM Scholarship", organization: "STEM Alliance", views: 245, clicks: 98 },
          { title: "Future Leaders Grant", organization: "Business Council", views: 213, clicks: 87 },
          { title: "Entrepreneurship Award", organization: "Startup Hub", views: 189, clicks: 76 }
        ],
        topValueBursaries: [
          { title: "National Science Fellowship", organization: "Science Foundation", awardAmount: 25000, deadline: "2023-08-30" },
          { title: "Graduate Research Grant", organization: "University Research", awardAmount: 20000, deadline: "2023-09-15" },
          { title: "Technology Innovation Award", organization: "Tech Innovators", awardAmount: 15000, deadline: "2023-10-01" },
          { title: "Future Leaders Scholarship", organization: "Leadership Institute", awardAmount: 12000, deadline: "2023-07-31" }
        ]
      });
      setIsLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Create a metric card component for reuse
  const MetricCard = ({ title, value, icon, change, changeType = "increase", colorClass = "text-blue-600 dark:text-blue-400", bgClass = "bg-blue-100 dark:bg-blue-900/30" }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className={`mt-2 text-sm ${changeType === "increase" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {changeType === "increase" ? "↑" : "↓"} {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${bgClass}`}>
          <span className={colorClass}>{icon}</span>
        </div>
      </div>
    </div>
  );

  // Stats card component
  const StatsCard = ({ title, value, change, type }) => {
    // Choose icon and styles based on type
    const getTypeStyles = (type) => {
      switch(type) {
        case 'users':
          return {
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
            textColor: 'text-blue-600 dark:text-blue-400',
            icon: <UserIcon className="h-6 w-6" />
          };
        case 'bursaries':
          return {
            bgColor: 'bg-purple-100 dark:bg-purple-900/20',
            textColor: 'text-purple-600 dark:text-purple-400',
            icon: <DocumentTextIcon className="h-6 w-6" />
          };
        default:
          return {
            bgColor: 'bg-gray-100 dark:bg-gray-800',
            textColor: 'text-gray-600 dark:text-gray-400',
            icon: <UserIcon className="h-6 w-6" />
          };
      }
    };
    
    const { bgColor, textColor, icon } = getTypeStyles(type);
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
            {change && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                {change}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${bgColor}`}>
            <span className={textColor}>{icon}</span>
          </div>
        </div>
      </div>
    );
  };

  // Render admin dashboard
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Analytics Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Monitor platform activity and user engagement
        </p>
      </header>

      {/* Display any error messages */}
      {analyticsData.error && (
        <div className="p-4 mb-4 border border-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Error Loading Data</h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            {analyticsData.error}
          </p>
          <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
            Note: Showing fallback data below. Refresh to try again.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* User metrics */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              User Metrics
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <StatsCard
                title="Total Students"
                value={analyticsData.totalStudents}
                change={`+${analyticsData.newStudentsThisMonth} this month`}
                type="users"
              />
              <StatsCard
                title="Total Admins"
                value={analyticsData.totalAdmins}
                change={`+${analyticsData.newAdminsThisMonth} this month`}
                type="users"
              />
              <StatsCard
                title="Total Funders"
                value={analyticsData.totalFunders}
                change={`+${analyticsData.newFundersThisMonth} this month`}
                type="users"
              />
              <StatsCard
                title="Total Bursaries"
                value={analyticsData.totalBursaries}
                change={`+${analyticsData.bursariesThisMonth} this month`}
                type="bursaries"
              />
              <StatsCard
                title="Active Bursaries"
                value={analyticsData.activeBursaries}
                type="bursaries"
              />
              <StatsCard
                title="Total Website Users"
                value={analyticsData.totalUsers}
                type="users"
              />
            </div>
          </div>
          
          {/* Bursary metrics */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Bursary Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                title="Total Views" 
                value={analyticsData.totalViews.toLocaleString()}
                icon={<CursorArrowRaysIcon className="h-6 w-6" />}
                colorClass="text-pink-600 dark:text-pink-400"
                bgClass="bg-pink-100 dark:bg-pink-900/30"
              />
              <MetricCard 
                title="Total Clicks" 
                value={analyticsData.totalClicks.toLocaleString()}
                icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
                colorClass="text-cyan-600 dark:text-cyan-400"
                bgClass="bg-cyan-100 dark:bg-cyan-900/30"
              />
            </div>
          </div>
          
          {/* Most viewed bursaries */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Most Viewed Bursaries
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/30">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Bursary Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Organization
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Views
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Clicks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-800">
                  {analyticsData.topBursaries.map((bursary, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {bursary.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {bursary.organization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {bursary.views}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {bursary.clicks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* High-value bursaries */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Highest Value Bursaries
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/30">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Bursary Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Organization
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Award Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Deadline
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-800">
                  {analyticsData.topValueBursaries.map((bursary, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {bursary.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {bursary.organization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                        {formatCurrency(bursary.awardAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {bursary.deadline}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Recent registrations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Registrations
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/30">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Registration Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-800">
                  {analyticsData.recentRegistrations.map((user, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.type === "student" ? "Student" : 
                         user.type === "organization" ? "Organization" : 
                         user.type === "admin" ? "Admin" : 
                         user.type === "funder" ? "Funder" : user.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 