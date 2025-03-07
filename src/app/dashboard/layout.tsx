"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, userId, sessionId } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Get user role when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('userRole');
      setUserRole(storedRole);
      console.log("User role:", storedRole); // Debug user role
    }
  }, []);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (isLoaded && !sessionId) {
      router.push("/sign-in");
    }
  }, [isLoaded, sessionId, router]);
  
  // Base links for navigation sidebar
  const dashboardLinks = [
    { href: "/dashboard/bursaries", label: "Bursaries" },
    { href: "/dashboard/profile", label: "Profile" },
  ];
  
  // Add organization-specific links
  if (userRole === "organization") {
    dashboardLinks.push(
      { href: "/dashboard/organization/bursaries", label: "Manage Bursaries" }
    );
  }
  
  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f4ece4] to-[#e8dccc] dark:from-[var(--background)] dark:to-[#3d2a20]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Show dashboard if authenticated
  if (sessionId) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-[#f4ece4] to-[#e8dccc] dark:from-[var(--background)] dark:to-[#3d2a20]">
        {/* Left sidebar for navigation */}
        <Sidebar links={dashboardLinks} position="left" />
        
        {/* Main content area with header */}
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  // Return empty div while redirecting (this won't show for long)
  return <div></div>;
} 