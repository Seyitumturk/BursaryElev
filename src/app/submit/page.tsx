"use client";
import React, { useState } from "react";

export default function SubmitBursaryPage() {
  const [formData, setFormData] = useState({
    organization: "",
    contactEmail: "",
    title: "",
    description: "",
    applicationUrl: "",
    deadline: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add your form submission logic here
    console.log("Submitted data:", formData);
  };

  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Submit a Bursary Opportunity
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="organization"
              className="block text-gray-700 dark:text-gray-300"
            >
              Organization Name
            </label>
            <input
              type="text"
              id="organization"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              placeholder="Your organization's name"
              className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="contactEmail"
              className="block text-gray-700 dark:text-gray-300"
            >
              Contact Email
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="you@example.com"
              className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="title"
              className="block text-gray-700 dark:text-gray-300"
            >
              Bursary Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title of the bursary opportunity"
              className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-gray-700 dark:text-gray-300"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the opportunity"
              rows={4}
              className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="applicationUrl"
              className="block text-gray-700 dark:text-gray-300"
            >
              Application URL
            </label>
            <input
              type="url"
              id="applicationUrl"
              name="applicationUrl"
              value={formData.applicationUrl}
              onChange={handleChange}
              placeholder="https://"
              className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="deadline"
              className="block text-gray-700 dark:text-gray-300"
            >
              Deadline
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
          >
            Submit Opportunity
          </button>
        </form>
      </div>
    </div>
  );
} 