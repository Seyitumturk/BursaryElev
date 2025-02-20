"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

interface SidebarProps {
  title: string;
  links: { href: string; label: string }[];
}

export default function Sidebar({ title, links }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`
        flex flex-col h-screen p-4 transition-all duration-300
        ${isCollapsed ? "w-16" : "w-64"}
        bg-white/30 dark:bg-gray-900/30 backdrop-blur-md
        shadow-[0_4px_30px_rgba(128,0,128,0.2)]
        rounded-tr-2xl rounded-br-2xl
      `}
    >
      <div className="flex items-center justify-between">
        <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm">
          <Image
            src="/logo.png"
            alt="Logo"
            width={isCollapsed ? 32 : 120}
            height={isCollapsed ? 32 : 40}
            className="transition-all duration-300"
          />
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-purple-600 focus:outline-none"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-6 w-6" />
          ) : (
            <ChevronLeftIcon className="h-6 w-6" />
          )}
        </button>
      </div>
      <nav className="mt-8 flex-1">
        <ul className="space-y-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`
                  flex items-center p-2 rounded-md transition
                  bg-gradient-to-br from-purple-500/10 to-indigo-500/10 
                  dark:from-purple-900/10 dark:to-indigo-900/10 
                  backdrop-blur-sm shadow-sm border border-purple-300/20
                  hover:scale-105 hover:shadow-2xl
                  ${isCollapsed ? "justify-center" : "justify-start"}
                `}
              >
                {!isCollapsed ? (
                  <span className="ml-2">{link.label}</span>
                ) : (
                  <span className="sr-only">{link.label}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
} 