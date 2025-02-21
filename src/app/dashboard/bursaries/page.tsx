"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Squares2X2Icon, Bars3Icon } from "@heroicons/react/24/solid";

export default function BursariesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [viewMode, setViewMode] = useState("card");
  const [loading, setLoading] = useState(true);

  // Simulate data fetching delay (for skeleton effect)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Filler data – in a real app your data would come from an API or similar source.
  const bursaries = [
    {
      id: 1,
      title: "Pathway to Success Scholarship",
      organization: "Indigenous Futures Org",
      logo: "/logo.png",
      awardAmount: "$5,000",
      awardsCount: "10 Awards",
      deadline: "2024-05-01",
      description:
        "This scholarship supports Indigenous youth pursuing higher education in community development and sustainability.",
    },
    {
      id: 2,
      title: "Cultural Heritage Grant",
      organization: "Culture Keepers Foundation",
      logo: "/logo.png",
      awardAmount: "$3,000",
      awardsCount: "5 Awards",
      deadline: "2024-07-15",
      description:
        "A grant aimed to preserve and promote Indigenous cultural heritage in modern educational settings.",
    },
    {
      id: 3,
      title: "Tech Innovators Bursary",
      organization: "Future Tech Initiative",
      logo: "/logo.png",
      awardAmount: "$4,000",
      awardsCount: "8 Awards",
      deadline: "2024-03-30",
      description:
        "Encouraging Indigenous youth to excel in STEM fields with financial support for tech education.",
    },
    {
      id: 4,
      title: "Community Leadership Award",
      organization: "Leaders United",
      logo: "/logo.png",
      awardAmount: "$2,500",
      awardsCount: "7 Awards",
      deadline: "2024-06-20",
      description:
        "Recognizes and supports future Indigenous leaders who demonstrate community engagement and vision.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top section with search bar and view mode toggle */}
      <div className="bg-[#e8dccc] dark:bg-gray-800 p-4 rounded-xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bursary Opportunities
        </h1>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Search and filter */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search bursaries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              <option value="highschool">By High School</option>
              <option value="subject">By Subject</option>
            </select>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-full shadow-sm hover:bg-purple-700 transition">
              Search
            </button>
          </div>
          {/* View mode toggle with icons */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 rounded-full shadow-sm ${
                viewMode === "card" ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
              aria-label="Grid View"
            >
              <Squares2X2Icon
                className={`h-6 w-6 ${viewMode === "card" ? "text-white" : "text-gray-800 dark:text-white"}`}
              />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-full shadow-sm ${
                viewMode === "list" ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
              aria-label="List View"
            >
              <Bars3Icon
                className={`h-6 w-6 ${viewMode === "list" ? "text-white" : "text-gray-800 dark:text-white"}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Conditional Rendering: Show skeletons while loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((_, idx) => (
            <div
              key={idx}
              className="bg-white/30 dark:bg-gray-800/30 rounded-xl shadow-lg p-6 backdrop-blur-md border border-white/20 animate-pulse"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-gray-300 dark:bg-gray-700 rounded-full w-12 h-12"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === "card" ? (
        // Modernized card view using glassmorphism with gradient background & optimized image
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bursaries.map((bursary) => (
            <div
              key={bursary.id}
              className="bg-white/70 dark:bg-gray-800/30 rounded-xl shadow-lg p-6 backdrop-blur-md border border-[#e8dccc]/20 dark:border-white/20 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <Image
                  src={bursary.logo || "https://i.pravatar.cc/48"}
                  alt={`${bursary.organization} Logo`}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {bursary.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {bursary.organization}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">
                    {bursary.awardAmount}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Award</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">
                    {bursary.awardsCount}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Awards</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">
                    {bursary.deadline}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Deadline</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-white/20 dark:bg-gray-700/20 backdrop-blur-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  {bursary.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Modernized list view with updated styles and optimized image
        <div className="space-y-4">
          {bursaries.map((bursary) => (
            <div
              key={bursary.id}
              className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-xl shadow-lg p-4 backdrop-blur-md border border-purple-300/20 hover:shadow-2xl transition-all duration-300 flex items-start gap-4"
            >
              <Image
                src={bursary.logo || "https://i.pravatar.cc/48"}
                alt={`${bursary.organization} Logo`}
                width={48}
                height={48}
                className="flex-shrink-0 rounded-full object-cover"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {bursary.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {bursary.organization}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {bursary.deadline}
                </p>
                <div className="mt-2 p-2 rounded-md bg-white/20 dark:bg-gray-700/20 backdrop-blur-sm">
                  <p className="text-gray-700 dark:text-gray-300">
                    {bursary.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 