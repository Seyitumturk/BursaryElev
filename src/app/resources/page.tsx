import React from "react";

const resourcesData = [
  {
    id: 1,
    title: "How to Write a Winning Bursary Essay",
    excerpt: "Discover expert tips and strategies to help you craft an outstanding bursary essay.",
    link: "#",
  },
  {
    id: 2,
    title: "Navigating Financial Aid Options",
    excerpt: "A comprehensive guide to understanding and accessing bursary and scholarship programs.",
    link: "#",
  },
  {
    id: 3,
    title: "Case Studies: Successful Bursary Applications",
    excerpt: "Real-life success stories and case studies to inspire your bursary application journey.",
    link: "#",
  },
];

export default function ResourcesPage() {
  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Resource Center
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resourcesData.map((resource) => (
            <div
              key={resource.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-xl transition"
            >
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {resource.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {resource.excerpt}
              </p>
              <a
                href={resource.link}
                className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
              >
                Learn More
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 