import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BriefcaseIcon, Building2, Search, Users, User, MapPin, Target, BarChart3, CreditCard, Building } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { generateWebSiteSchema, generateOrganizationSchema, generateLocalBusinessSchema } from '@/lib/seo/structured-data';
import StructuredData from '@/components/StructuredData';
import { generateSEOMetadata } from '@/lib/seo/metadata';
import { getCachedUser } from '@/lib/supabase/server';
import HeroSection from './_components/HeroSection';
import SearchSection from './_components/SearchSection';
import CTASection from './_components/CTASection';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: "Gambia's Premier Job Board - Find Jobs & Hire Talent",
    description: "Find your dream job or hire top talent in The Gambia. Ligaye.com connects job seekers with employers across all industries. Browse thousands of job opportunities, post jobs, and build your career in Gambia.",
    keywords: [
      'jobs in Gambia',
      'Gambian jobs',
      'employment Gambia',
      'careers Gambia',
      'job vacancies Gambia',
      'hire in Gambia',
      'Gambia job board',
      'work in Gambia',
      'Banjul jobs',
      'Serrekunda jobs',
      'job search Gambia',
      'post jobs Gambia'
    ],
  });
}

export default async function LandingPage() {
  const user = await getCachedUser();
  
  const websiteSchema = generateWebSiteSchema();
  const organizationSchema = generateOrganizationSchema();
  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <>
      <StructuredData data={websiteSchema} />
      <StructuredData data={organizationSchema} />
      <StructuredData data={localBusinessSchema} />
      <Navbar user={user} />
      <div className="flex flex-col">
        {/* Hero Section */}
        <HeroSection user={user} />

        {/* Search Section */}
        <SearchSection />

        {/* Features Section */}
        <section className="py-16 px-4 md:px-8 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Job Seekers Column */}
              <div className="glass-card p-8 md:p-10 hover:shadow-level-3 transition-all duration-300 flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-primary-blue mb-2">Looking for work?</h3>
                  <h2 className="text-3xl md:text-4xl font-bold text-theme-dark mb-6">Why job seekers love us</h2>
                  
                  <div className="space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary-blue/10 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                        <Building2 className="text-primary-blue h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-theme-dark mb-1">Connect directly with top Gambian employers</p>
                        <p className="text-theme-gray-dark">Apply directly to employers without intermediaries.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-primary-blue/10 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                        <Search className="text-primary-blue h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-theme-dark mb-1">Full transparency from the start</p>
                        <p className="text-theme-gray-dark">View salary, location, and requirements before applying.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-primary-blue/10 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                        <User className="text-primary-blue h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-theme-dark mb-1">One-click applications</p>
                        <p className="text-theme-gray-dark">Your profile is your CV. Apply with a single click.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-primary-blue/10 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                        <MapPin className="text-primary-blue h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-theme-dark mb-1">Local opportunities</p>
                        <p className="text-theme-gray-dark">Find jobs tailored to Gambia&apos;s job market.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Link href="/jobs" className="block">
                    <Button className="bg-primary-blue hover:bg-primary-blue-light text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl w-full">
                      Start Job Search
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Employers Column */}
              <div className="glass-card p-8 md:p-10 hover:shadow-level-3 transition-all duration-300 flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-secondary-green mb-2">Need to hire?</h3>
                  <h2 className="text-3xl md:text-4xl font-bold text-theme-dark mb-6">Why employers choose us</h2>
                  
                  <div className="space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="bg-secondary-green/10 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                        <Target className="text-secondary-green h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-theme-dark mb-1">Reach qualified local talent</p>
                        <p className="text-theme-gray-dark">Reach candidates with skills relevant to the local market.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-secondary-green/10 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                        <BarChart3 className="text-secondary-green h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-theme-dark mb-1">Easy application management</p>
                        <p className="text-theme-gray-dark">Post jobs, manage applications, and track candidates with ease.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-secondary-green/10 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                        <CreditCard className="text-secondary-green h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-theme-dark mb-1">Flexible payment options</p>
                        <p className="text-theme-gray-dark">Choose between online payments or pay with cash locally.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-secondary-green/10 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                        <Building className="text-secondary-green h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-theme-dark mb-1">Build your employer brand</p>
                        <p className="text-theme-gray-dark">Showcase your company culture to attract the right candidates.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Link href={user ? "/employer/jobs/new" : "/sign-up"} className="block">
                    <Button className="bg-secondary-green hover:bg-secondary-green/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl w-full">
                      Post Your First Job
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-theme-dark mb-4">How Ligaye Works</h2>
            <p className="text-theme-gray-dark max-w-2xl mx-auto">Ligaye makes it simple to connect job seekers and employers across Gambia</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {/* Job Seekers */}
              <div className="glass-card p-6 md:p-8 text-center hover:shadow-level-3 transition-all duration-300 flex flex-col h-full">
                <div className="flex-grow">
                  <div className="bg-primary-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User className="text-primary-blue h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-theme-dark mb-4">For Job Seekers</h3>
                  <p className="text-theme-gray-dark mb-4">Create a profile, upload your resume, and apply to jobs with a single click. Get notified about new opportunities that match your skills.</p>
                </div>
                <Link href={user ? "/jobs" : "/sign-up"}>
                  <Button variant="outline" className="border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white transition-all duration-300 mt-auto">
                    Get Started
                  </Button>
                </Link>
              </div>

              {/* Employers */}
              <div className="glass-card p-6 md:p-8 text-center hover:shadow-level-3 transition-all duration-300 flex flex-col h-full">
                <div className="flex-grow">
                  <div className="bg-secondary-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building className="text-secondary-green h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-theme-dark mb-4">For Employers</h3>
                  <p className="text-theme-gray-dark mb-4">Post job openings, manage applications, and find the perfect candidates for your company. Easy payment options via Stripe or cash.</p>
                </div>
                <Link href={user ? "/employer/jobs/new" : "/sign-up"}>
                  <Button variant="outline" className="border-secondary-green text-secondary-green hover:bg-secondary-green hover:text-white transition-all duration-300 mt-auto">
                    Post Jobs
                  </Button>
                </Link>
              </div>

              {/* Browse Jobs */}
              <div className="glass-card p-6 md:p-8 text-center hover:shadow-level-3 transition-all duration-300 flex flex-col h-full">
                <div className="flex-grow">
                  <div className="bg-primary-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="text-primary-blue h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-theme-dark mb-4">Browse Opportunities</h3>
                  <p className="text-theme-gray-dark mb-4">Browse through hundreds of job listings across various industries and experience levels throughout Gambia.</p>
                </div>
                <Link href="/jobs">
                  <Button variant="outline" className="border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white transition-all duration-300 mt-auto">
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <CTASection user={user} />

        {/* Mobile App Coming Soon Section */}
        <section className="py-12 px-4 md:px-8 relative overflow-hidden">
          <div className="max-w-5xl mx-auto">
            <div className="glass-card p-8 md:p-12 text-center relative">
              {/* Decorative elements */}
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary-blue/5 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-secondary-green/5 rounded-full blur-xl"></div>
              
              <div className="relative z-10">
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-r from-primary-blue to-secondary-green p-4 rounded-2xl shadow-level-2">
                    <Image
                      src="/apple-android.svg"
                      alt="Mobile Apps for iOS and Android"
                      width={80}
                      height={80}
                      className="filter brightness-0 invert"
                    />
                  </div>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-theme-dark mb-4">
                  <span className="text-primary-blue">Mobile App</span> Coming Soon!
                </h2>
                
                <p className="text-lg text-theme-gray-dark max-w-2xl mx-auto mb-6 leading-relaxed">
                  Take your job search and hiring on the go! Our mobile app for 
                  <span className="font-semibold text-theme-dark"> Android </span> and 
                  <span className="font-semibold text-theme-dark"> iOS </span> 
                  will bring Ligaye&apos;s powerful features right to your pocket.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="flex flex-col items-center">
                    <div className="bg-primary-blue/10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                      <Search className="text-primary-blue h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-theme-dark mb-1">Job Search</h4>
                    <p className="text-sm text-theme-gray-dark text-center">Search and apply to jobs anywhere, anytime</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="bg-secondary-green/10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                      <BriefcaseIcon className="text-secondary-green h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-theme-dark mb-1">Manage Applications</h4>
                    <p className="text-sm text-theme-gray-dark text-center">Track your applications on the go</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="bg-primary-blue/10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                      <Users className="text-primary-blue h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-theme-dark mb-1">Instant Notifications</h4>
                    <p className="text-sm text-theme-gray-dark text-center">Get notified about new opportunities</p>
                  </div>
                </div>
                
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-blue/10 to-secondary-green/10 px-6 py-3 rounded-full border border-primary-blue/20">
                  <div className="w-2 h-2 bg-secondary-green rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-theme-dark">Stay tuned for updates!</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}