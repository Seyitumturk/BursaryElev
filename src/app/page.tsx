import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5ede7] dark:bg-[#5b3d2e] relative overflow-hidden">
      {/* Background logo element - positioned in bottom right with low opacity */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-10 z-0 pointer-events-none">
        <Image 
          src="/logo.png" 
          alt="Background logo"
          width={500}
          height={500}
          className="object-contain"
        />
      </div>
      
      {/* Header Navigation - Modernized with brand colors */}
      <header className="bg-gradient-to-r from-[#ae3d31] via-[#d36425] to-[#bb725c] animated-gradient shadow-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/logo.png" 
                  alt="Ulnooweg EleV Logo" 
                  width={48} 
                  height={48}
                  className="mr-2"
                />
                <span className="font-bold text-xl text-[#f5ede7] hover:text-white transition-colors">
                  Ulnooweg EleV
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/sign-in" className="text-[#f5ede7] hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/sign-up" className="px-4 py-2 bg-[#5b3d2e] text-[#f5ede7] rounded-md hover:bg-[#876650] transition-all duration-300 shadow-md">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Redesigned with dynamic animated gradient and floating orbs */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-br from-[#d1a989] via-[#e3cbb7] to-[#f5ede7] dark:from-[#5b3d2e] dark:via-[#876650] dark:to-[#a9866b] animated-gradient relative z-10 overflow-hidden">
        {/* Glassmorphic sliding orbs */}
        <div className="h-full w-full absolute inset-0 overflow-hidden">
          <div className="floating-orb floating-orb-1"></div>
          <div className="floating-orb floating-orb-2"></div>
          <div className="floating-orb floating-orb-3"></div>
          <div className="floating-orb floating-orb-4"></div>
          <div className="floating-orb floating-orb-5"></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-[#ae3d31] via-[#d36425] to-[#bb725c] animated-gradient px-4">
            Empowering Indigenous Youth through AI-Driven Bursary Matching
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-[#5b3d2e] dark:text-[#f5ede7]">
            Bridging the gap between opportunities and Indigenous youth across Atlantic Canada.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-4">
            <Link href="/sign-up" className="btn-primary">
              Get Started
            </Link>
            <Link href="/sign-in" className="btn-secondary">
              Sign In
            </Link>
            <a href="https://www.ulnooweg.ca" target="_blank" rel="noopener noreferrer" className="btn-tertiary">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Seamless wave divider with enhanced animated gradient */}
      <div className="wave-divider relative overflow-hidden">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ae3d31">
                <animate attributeName="stop-color" values="#ae3d31;#d36425;#bb725c;#d36425;#ae3d31" dur="12s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="#d36425">
                <animate attributeName="stop-color" values="#d36425;#bb725c;#ae3d31;#bb725c;#d36425" dur="12s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#bb725c">
                <animate attributeName="stop-color" values="#bb725c;#ae3d31;#d36425;#ae3d31;#bb725c" dur="12s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" 
            className="fill-gradient"></path>
        </svg>
      </div>

      {/* Mission Section - Redesigned with modern card elements */}
      <section className="py-16 bg-gradient-to-br from-[#d1a989] via-[#c99e7d] to-[#bb8e6d] dark:from-[#876650] dark:via-[#75584a] dark:to-[#664b40] animated-gradient relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-[#5b3d2e] dark:text-[#f5ede7] relative inline-block">
              <span className="relative z-10">Our Mission</span>
              <div className="absolute -bottom-2 left-0 w-full h-2 bg-[#ae3d31] opacity-50 rounded"></div>
            </h2>
            <p className="mt-4 text-[#5b3d2e] dark:text-[#f5ede7] max-w-3xl mx-auto">
              Breaking down systemic barriers and empowering Indigenous youth through personalized bursary matching,
              cultural resurgence, and innovative educational opportunities.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-[#f5ede7] to-[#e3cbb7] dark:from-[#5b3d2e] dark:to-[#876650] p-8 rounded-lg shadow-lg hover-lift relative z-10">
              <div className="relative mb-4 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#ae3d31] to-[#d36425] animated-gradient">
                <svg className="w-6 h-6 text-[#f5ede7]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#5b3d2e] dark:text-[#f5ede7]">AI-Driven Matching</h3>
              <p className="mt-2 text-[#5b3d2e] dark:text-[#e3cbb7]">
                Our platform uses advanced AI to match bursary opportunities based on your profile, needs, and aspirations.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#f5ede7] to-[#e3cbb7] dark:from-[#5b3d2e] dark:to-[#876650] p-8 rounded-lg shadow-lg hover-lift relative z-10">
              <div className="relative mb-4 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#d36425] to-[#bb725c] animated-gradient">
                <svg className="w-6 h-6 text-[#f5ede7]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 3a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#5b3d2e] dark:text-[#f5ede7]">Automated Categorization</h3>
              <p className="mt-2 text-[#5b3d2e] dark:text-[#e3cbb7]">
                Intelligent categorization of bursary applications streamlines selection for both students and providers.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#f5ede7] to-[#e3cbb7] dark:from-[#5b3d2e] dark:to-[#876650] p-8 rounded-lg shadow-lg hover-lift relative z-10">
              <div className="relative mb-4 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#bb725c] to-[#a9866b] animated-gradient">
                <svg className="w-6 h-6 text-[#f5ede7]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z"></path>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd"></path>
              </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#5b3d2e] dark:text-[#f5ede7]">Advanced Search & Filtering</h3>
              <p className="mt-2 text-[#5b3d2e] dark:text-[#e3cbb7]">
                Find opportunities by institution, field of study, or financial need with easy-to-use filters.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#f5ede7] to-[#e3cbb7] dark:from-[#5b3d2e] dark:to-[#876650] p-8 rounded-lg shadow-lg hover-lift relative z-10">
              <div className="relative mb-4 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#ae3d31] to-[#d36425] animated-gradient">
                <svg className="w-6 h-6 text-[#f5ede7]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#5b3d2e] dark:text-[#f5ede7]">Community Powered</h3>
              <p className="mt-2 text-[#5b3d2e] dark:text-[#e3cbb7]">
                Engage with mentors, recommend opportunities, and participate in a vibrant community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seamless wave divider */}
      <div className="wave-divider">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
            fill="#f5ede7" className="dark:fill-[#5b3d2e]"></path>
        </svg>
      </div>

      {/* How It Works Section - Redesigned with dynamic cards */}
      <section className="py-16 bg-[#f5ede7] dark:bg-[#5b3d2e] relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-[#5b3d2e] dark:text-[#f5ede7] relative inline-block">
              <span className="relative z-10">How It Works</span>
              <div className="absolute -bottom-2 left-0 w-full h-2 bg-[#d36425] opacity-50 rounded"></div>
            </h2>
            <p className="mt-4 text-[#5b3d2e] dark:text-[#f5ede7]">
              Register, build your profile, and let our AI engine match you with the best bursaries available.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative bg-gradient-to-br from-[#ae3d31] to-[#bb725c] p-1 rounded-lg shadow-xl overflow-hidden hover-lift relative z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ae3d31] via-[#d36425] to-[#bb725c] opacity-75 animated-gradient"></div>
              <div className="relative bg-[#f5ede7] dark:bg-[#5b3d2e] p-6 rounded-lg h-full flex flex-col">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-[#ae3d31] to-[#d36425] group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-[#f5ede7]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path>
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#5b3d2e] dark:text-[#f5ede7] text-center">Sign Up & Profile</h3>
                <p className="mt-2 text-center text-[#5b3d2e] dark:text-[#e3cbb7] flex-grow">
                  Create an account and build a profile tailored to your academic and career interests.
                </p>
              </div>
            </div>
            <div className="group relative bg-gradient-to-br from-[#d36425] to-[#d1a989] p-1 rounded-lg shadow-xl overflow-hidden hover-lift relative z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-[#d36425] via-[#bb725c] to-[#d1a989] opacity-75 animated-gradient"></div>
              <div className="relative bg-[#f5ede7] dark:bg-[#5b3d2e] p-6 rounded-lg h-full flex flex-col">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-[#d36425] to-[#bb725c] group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-[#f5ede7]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#5b3d2e] dark:text-[#f5ede7] text-center">AI Matching</h3>
                <p className="mt-2 text-center text-[#5b3d2e] dark:text-[#e3cbb7] flex-grow">
                  Our AI engine analyzes your profile to suggest the best bursary matches available.
                </p>
              </div>
            </div>
            <div className="group relative bg-gradient-to-br from-[#bb725c] to-[#a9866b] p-1 rounded-lg shadow-xl overflow-hidden hover-lift relative z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-[#bb725c] via-[#a9866b] to-[#d1a989] opacity-75 animated-gradient"></div>
              <div className="relative bg-[#f5ede7] dark:bg-[#5b3d2e] p-6 rounded-lg h-full flex flex-col">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-[#bb725c] to-[#ae3d31] group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-[#f5ede7]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0115.414 6L12 2.586A2 2 0 0110.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#5b3d2e] dark:text-[#f5ede7] text-center">Apply & Track</h3>
                <p className="mt-2 text-center text-[#5b3d2e] dark:text-[#e3cbb7] flex-grow">
                  Easily apply to bursaries and manage your applications through a modern, intuitive dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Center Section - Redesigned with gradient background */}
      <section className="py-16 bg-gradient-to-br from-[#e3cbb7] to-[#f5ede7] dark:from-[#876650] dark:to-[#5b3d2e] animated-gradient relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#f5ede7]/90 to-[#e3cbb7]/90 dark:from-[#5b3d2e]/90 dark:to-[#876650]/90 backdrop-blur-sm p-8 rounded-xl shadow-xl relative z-10">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[#5b3d2e] dark:text-[#f5ede7] relative inline-block">
                <span className="relative z-10">Resource Center</span>
                <div className="absolute -bottom-2 left-0 w-full h-2 bg-[#bb725c] opacity-50 rounded"></div>
              </h2>
              <p className="mt-4 text-[#5b3d2e] dark:text-[#f5ede7]">
                Access valuable guides, application tips, and expert advice to support your bursary journey.
              </p>
              <Link href="/resources" className="mt-6 inline-block btn-primary">
                Explore Resources
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with animated gradient */}
      <footer className="py-8 bg-gradient-to-r from-[#ae3d31] via-[#d36425] to-[#bb725c] animated-gradient relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#f5ede7]">
          <p>&copy; {new Date().getFullYear()} Ulnooweg EleV Initiative</p>
        </div>
      </footer>
    </div>
  );
}
