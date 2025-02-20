import React from "react";

const bursariesData = [
  {
    id: 1,
    title: "Indigenous Leadership Scholarship",
    description: "A scholarship for Indigenous students pursuing leadership in community development.",
    deadline: "2023-12-31",
  },
  {
    id: 2,
    title: "Cultural Resurgence Grant",
    description: "Grant supporting projects that promote Indigenous cultural heritage.",
    deadline: "2024-01-15",
  },
  {
    id: 3,
    title: "STEM Education Bursary",
    description: "A bursary for Indigenous youth aiming to excel in Science, Technology, Engineering, and Math.",
    deadline: "2023-11-30",
  },
];

export default function DashboardBursaries() {
  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Bursary Opportunities
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bursariesData.map((bursary) => (
            <div
              key={bursary.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-xl transition"
            >
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {bursary.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {bursary.description}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Deadline: {bursary.deadline}
              </p>
              <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 