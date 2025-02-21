import Sidebar from "../../components/Sidebar";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dashboardLinks = [
    { href: "/dashboard/bursaries", label: "Bursaries" },
    { href: "/dashboard/profile", label: "Profile" },
  ];

  return (
    <div className="min-h-screen flex gap-4 bg-[#f4ece4] dark:bg-gray-800">
      <Sidebar links={dashboardLinks} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
} 