"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { PlusCircleIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";

interface SidebarLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  links: SidebarLink[];
}

export default function Sidebar({ links }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    // Check localStorage for theme
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      // If no stored preference, check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark");
          setTheme(isDark ? "dark" : "light");
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    async function fetchUserRole() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setRole(data.role);
      } catch (err) {
        console.error(err);
      }
    }
    fetchUserRole();
  }, []);

  const navLinks: SidebarLink[] = [...links];
  if (role === "organization" || role === "funder") {
    navLinks.push({
      href: "/submit",
      label: "Add Bursary",
      icon: <PlusCircleIcon className="h-6 w-6" />,
    });
  }
  if (role === "student") {
    navLinks.push({
      href: "/apply",
      label: "Apply with AI",
      icon: <RocketLaunchIcon className="h-6 w-6" />,
    });
  }

  return (
    <aside
      className={`bg-[#e8dccc] dark:bg-gray-900 shadow-lg transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } h-screen p-4`}
    >
      <div className="relative mb-8">
        <div className="flex justify-center">
          <div className="p-2 bg-white/30 dark:bg-gray-700/30 backdrop-blur-md rounded-lg">
            <Image
              src={theme === "light" ? "/logo-orange.png" : "/logo.png"}
              alt="Logo"
              width={collapsed ? 50 : 90}
              height={collapsed ? 50 : 90}
              className="object-contain"
            />
          </div>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-1/2 right-0 transform -translate-y-1/2"
        >
          {collapsed ? (
            <ChevronRightIcon className="h-6 w-6 text-gray-800 dark:text-white" />
          ) : (
            <ChevronLeftIcon className="h-6 w-6 text-gray-800 dark:text-white" />
          )}
        </button>
      </div>
      <nav>
        <ul className="space-y-4">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center gap-3 p-3 bg-white/30 dark:bg-gray-700/30 backdrop-blur-md rounded-lg hover:bg-white/50 dark:hover:bg-gray-600 transition"
              >
                {link.icon && (
                  <span className="text-gray-800 dark:text-white">{link.icon}</span>
                )}
                {!collapsed && (
                  <span className="text-gray-800 dark:text-white">{link.label}</span>
                )}
                {collapsed && !link.icon && (
                  <span className="text-gray-800 dark:text-white">
                    {link.label.charAt(0)}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
} 