import Sidebar from "../../components/Sidebar";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dashboardLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/profile", label: "Profile" },
    { href: "/dashboard/bursaries", label: "Bursaries" },
    { href: "/dashboard/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex gap-4 bg-gray-100 dark:bg-gray-800">
      {/* Updated Sidebar with toggle and glassmorphic style */}
      <Sidebar title="EleV Dashboard" links={dashboardLinks} />
      {/* Main Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
} 