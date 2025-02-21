"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrgOnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    about: "",
    mission: "",
    address: "",
    province: "",
    city: "",
    postalCode: "",
    officeNumber: "",
    alternativePhone: "",
    email: "",
    website: "",
    twitter: "",
    facebook: "",
    linkedin: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          about: formData.about,
          mission: formData.mission,
          address: formData.address,
          province: formData.province,
          city: formData.city,
          postalCode: formData.postalCode,
          officeNumber: formData.officeNumber,
          alternativePhone: formData.alternativePhone,
          email: formData.email,
          website: formData.website,
          socialMedia: {
            twitter: formData.twitter,
            facebook: formData.facebook,
            linkedin: formData.linkedin,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "An error occurred");
      } else {
        // Redirect to the dashboard or profile page after successful onboarding
        router.push("/dashboard/profile");
      }
    } catch (error: Error | unknown) {
      setError("An error occurred");
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
          Organization Onboarding
        </h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-gray-700 dark:text-gray-300"
            >
              Organization Name
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="category"
              className="block text-gray-700 dark:text-gray-300"
            >
              Category
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="about"
              className="block text-gray-700 dark:text-gray-300"
            >
              About
            </label>
            <textarea
              id="about"
              name="about"
              value={formData.about}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border rounded-md"
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="mission"
              className="block text-gray-700 dark:text-gray-300"
            >
              Mission
            </label>
            <textarea
              id="mission"
              name="mission"
              value={formData.mission}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border rounded-md"
            ></textarea>
          </div>
          <h2 className="text-lg font-semibold mt-6 text-gray-800 dark:text-white">
            Contact Information
          </h2>
          <div>
            <label
              htmlFor="address"
              className="block text-gray-700 dark:text-gray-300"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="province"
              className="block text-gray-700 dark:text-gray-300"
            >
              Province
            </label>
            <input
              type="text"
              id="province"
              name="province"
              value={formData.province}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="city"
              className="block text-gray-700 dark:text-gray-300"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="postalCode"
              className="block text-gray-700 dark:text-gray-300"
            >
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="officeNumber"
              className="block text-gray-700 dark:text-gray-300"
            >
              Office Number
            </label>
            <input
              type="text"
              id="officeNumber"
              name="officeNumber"
              value={formData.officeNumber}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="alternativePhone"
              className="block text-gray-700 dark:text-gray-300"
            >
              Alternative Phone (optional)
            </label>
            <input
              type="text"
              id="alternativePhone"
              name="alternativePhone"
              value={formData.alternativePhone}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 dark:text-gray-300"
            >
              Contact Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="website"
              className="block text-gray-700 dark:text-gray-300"
            >
              Website (optional)
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="twitter"
              className="block text-gray-700 dark:text-gray-300"
            >
              Twitter (optional)
            </label>
            <input
              type="text"
              id="twitter"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="facebook"
              className="block text-gray-700 dark:text-gray-300"
            >
              Facebook (optional)
            </label>
            <input
              type="text"
              id="facebook"
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="linkedin"
              className="block text-gray-700 dark:text-gray-300"
            >
              LinkedIn (optional)
            </label>
            <input
              type="text"
              id="linkedin"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Submitting..." : "Complete Onboarding"}
          </button>
        </form>
      </div>
    </div>
  );
} 