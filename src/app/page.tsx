// import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Navigation */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="font-bold text-xl text-blue-600">
                Bursary Matching
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/sign-in" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Sign In
              </Link>
              <Link href="/sign-up" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-700">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
            Empowering Indigenous Youth through AI-Driven Bursary Matching for the Ulnooweg EleV Initiative
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
            Bridging the gap between opportunities and Indigenous youth across Atlantic Canada.
          </p>
          <div className="mt-10 flex justify-center gap-x-6">
            <Link href="/sign-up" className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Get Started
            </Link>
            <Link href="/sign-in" className="px-8 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-800">
              Sign In
            </Link>
            <Link href="/about" className="px-8 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Our Mission</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Breaking down systemic barriers and empowering Indigenous youth through personalized bursary matching,
              cultural resurgence, and innovative educational opportunities.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-4xl">🎯</span>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">AI-Driven Matching</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Our platform uses advanced AI to match bursary opportunities based on your profile, needs, and aspirations.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-4xl">🤖</span>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Automated Categorization</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Intelligent categorization of bursary applications streamlines selection for both students and providers.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-4xl">🔍</span>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Advanced Search & Filtering</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Find opportunities by institution, field of study, or financial need with easy-to-use filters.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-4xl">💡</span>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Community Powered</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Engage with mentors, recommend opportunities, and participate in a vibrant community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">How It Works</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Register, build your profile, and let our AI engine match you with the best bursaries available.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-center justify-center text-4xl text-blue-600">
                <span>📝</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white text-center">Sign Up & Profile</h3>
              <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
                Create an account and build a profile tailored to your academic and career interests.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-center justify-center text-4xl text-blue-600">
                <span>🤖</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white text-center">AI Matching</h3>
              <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
                Our AI engine analyzes your profile to suggest the best bursary matches available.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-center justify-center text-4xl text-blue-600">
                <span>💼</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white text-center">Apply & Track</h3>
              <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
                Easily apply to bursaries and manage your applications through a modern, intuitive dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Center Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Resource Center</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Access valuable guides, application tips, and expert advice to support your bursary journey.
            </p>
            <Link href="/resources" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Explore Resources
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
