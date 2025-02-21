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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } h-screen p-4`}
    >
      <div className="flex justify-between items-center mb-8">
        {!collapsed && (
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {title}
          </h2>
        )}
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? (
            <ChevronRightIcon className="h-6 w-6 text-gray-800 dark:text-white" />
          ) : (
            <ChevronLeftIcon className="h-6 w-6 text-gray-800 dark:text-white" />
          )}
        </button>
      </div>
      <nav>
        <ul className="space-y-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
              >
                {collapsed ? link.label.charAt(0) : link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
} 