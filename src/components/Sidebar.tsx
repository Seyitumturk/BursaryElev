"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { 
  HomeIcon, 
  UserIcon, 
  BuildingLibraryIcon,
  DocumentTextIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline";

interface SidebarLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  links: SidebarLink[];
  position?: 'left' | 'right';
}

export default function Sidebar({ links, position = 'left' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
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

  // Map icons to standard links based on label
  const getIconForLabel = (label: string) => {
    switch (label.toLowerCase()) {
      case 'bursaries':
        return <DocumentTextIcon className="h-6 w-6" />;
      case 'profile':
        return <UserIcon className="h-6 w-6" />;
      case 'home':
        return <HomeIcon className="h-6 w-6" />;
      case 'manage bursaries':
        return <BuildingLibraryIcon className="h-6 w-6" />;
      default:
        return <AcademicCapIcon className="h-6 w-6" />;
    }
  };

  // Add icons to links if not already provided
  const navLinks: SidebarLink[] = links.map(link => ({
    ...link,
    icon: link.icon || getIconForLabel(link.label)
  }));

  // Determine collapse icon based on position
  const CollapseIcon = position === 'right' 
    ? (collapsed ? <ChevronLeftIcon className="h-5 w-5 text-gray-800 dark:text-white" /> : <ChevronRightIcon className="h-5 w-5 text-gray-800 dark:text-white" />)
    : (collapsed ? <ChevronRightIcon className="h-5 w-5 text-gray-800 dark:text-white" /> : <ChevronLeftIcon className="h-5 w-5 text-gray-800 dark:text-white" />);

  // Determine button position based on sidebar position
  const buttonPosition = position === 'right' ? 'left-0' : 'right-0';

  return (
    <aside
      className={`bg-[var(--sidebar-bg)]/80 dark:bg-[var(--sidebar-bg)] backdrop-blur-md shadow-lg transition-all duration-300 
        ${collapsed ? "w-16" : "w-64"} h-screen p-4 flex flex-col z-10`}
      style={{ borderLeft: position === 'right' ? '1px solid rgba(255,255,255,0.1)' : 'none', 
              borderRight: position === 'left' ? '1px solid rgba(255,255,255,0.1)' : 'none' }}
    >
      <div className="relative mb-10">
        <div className="flex justify-center">
          <div className={`p-2 bg-white/30 dark:bg-[var(--light-brown-2)]/20 backdrop-blur-md rounded-xl shadow-md ${collapsed ? 'w-10 h-10 flex items-center justify-center' : ''}`}>
            <Image
              src={theme === "light" ? "/logo-orange.png" : "/logo.png"}
              alt="Logo"
              width={collapsed ? 28 : 70}
              height={collapsed ? 28 : 70}
              className="object-contain"
            />
          </div>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`absolute ${collapsed ? 'top-10' : 'top-1/2'} ${buttonPosition} transform ${collapsed ? 'translate-y-0' : '-translate-y-1/2'} ${collapsed ? 'translate-x-3/4' : '-translate-x-1/2'} bg-white dark:bg-[var(--light-brown-1)] rounded-full p-1.5 shadow-md hover:shadow-lg transition-all z-20`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {CollapseIcon}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-3">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center ${collapsed ? 'justify-center' : 'px-3'} py-3 bg-white/30 dark:bg-[var(--light-brown-2)]/20 backdrop-blur-md rounded-xl shadow-sm hover:bg-[var(--light-brown-1)]/20 dark:hover:bg-[var(--light-brown-1)]/30 hover:shadow-md transition-all group`}
              >
                {link.icon && (
                  <span className="text-[var(--light-brown-2)] dark:text-[var(--light-brown-1)] group-hover:text-[#c33c33]/70 dark:group-hover:text-[#c33c33]/80">
                    {link.icon}
                  </span>
                )}
                {!collapsed && (
                  <span className="ml-3 text-gray-800 dark:text-white font-medium truncate">{link.label}</span>
                )}
                {collapsed && !link.icon && (
                  <span className="text-[var(--light-brown-2)] dark:text-[var(--light-brown-1)] font-bold">
                    {link.label.charAt(0)}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-4 text-center text-xs text-gray-500 dark:text-[var(--light-brown-1)]/70">
        {!collapsed && <p>Bursary Platform &copy; {new Date().getFullYear()}</p>}
      </div>
    </aside>
  );
} 