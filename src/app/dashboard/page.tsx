"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import BursaryMatches from "@/components/BursaryMatches";

export default function DashboardHome() {
  const { user, isLoaded } = useUser();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!isLoaded || !user) return;
      
      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const userData = await response.json();
          setUserRole(userData.role);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, [user, isLoaded]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Dashboard
      </h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        Welcome to your personalized dashboard. Here you can view matching bursary opportunities, track your applications, and access exclusive resources.
      </p>
      
      {/* Show bursary matches only for student users */}
      {userRole === "student" && (
        <div className="mb-8">
          <BursaryMatches limit={3} />
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-[0_4px_30px_rgba(128,0,128,0.2)]">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            AI-Powered Matching
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Our system uses intelligent algorithms to match you with bursaries that best suit your profile.
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-[0_4px_30px_rgba(128,0,128,0.2)]">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Community Engagement
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Connect with mentors and peers to gain insights and support throughout your application process.
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-[0_4px_30px_rgba(128,0,128,0.2)]">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Application Tracking
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Monitor your application progress in one centralized dashboard.
          </p>
        </div>
      </div>
    </div>
  );
} 