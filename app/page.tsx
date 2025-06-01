'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, BriefcaseIcon, Building2, Search, Users, User, MapPin, Target, BarChart3, CreditCard, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import RingLoaderSpinner from '@/components/loaders/ring-loader';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  
  // Check if user is logged in on the client side
  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const handleSearch = (query: string = searchQuery) => {
    if (query.trim()) {
      router.push(`/jobs?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/jobs');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleKeywordClick = (keyword: string) => {
    handleSearch(keyword);
  };

  if (loading) {
    return <div className='flex justify-center items-center h-screen container mx-auto'>
      <RingLoaderSpinner />
    </div>;
  }

  return (
    <>
    <Navbar user={user} />
    <div className="flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 pt-20 md:pt-32 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="space-y-6 animate-appear relative">
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-16 w-40 h-40 bg-primary-blue/5 rounded-full blur-3xl z-0"></div>
            <div className="absolute -bottom-12 left-10 w-32 h-32 bg-secondary-green/5 rounded-full blur-2xl z-0"></div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-theme-dark relative z-10">
            <span className="text-primary-blue"> Gambia&apos;s  </span>Digital Career
            <span className="text-primary-blue"> Revolution </span>
            </h1>
            
            <p className="text-xl text-theme-gray-dark max-w-2xl mx-auto relative z-10">
              Find your dream job or hire top talent in The Gambia. Connect with opportunities that match your skills and ambitions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link href="/jobs">
                <Button className="bg-primary-blue hover:bg-primary-blue-light text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                  Find Jobs
                </Button>
              </Link>
              <Link href={user ? "/employer/jobs/new" : "/sign-up"}>
                <Button variant="outline" className="bg-background/90 text-theme-dark border border-theme-gray hover:bg-background/80 transition-all duration-300 font-semibold py-3 px-8 rounded-xl">
                  Post a Job
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Search Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-theme-dark text-center mb-8">
              Start Your Job Search
            </h2>
            
            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-theme-gray-dark h-5 w-5" />
              <input
                type="text"
                placeholder="Search for jobs, companies, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-theme-gray focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/20 text-lg bg-background"
              />
            </form>
            
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {['Software Developer', 'Marketing Manager', 'Teacher', 'Accountant', 'Sales Representative'].map((term) => (
                <button
                  key={term}
                  onClick={() => handleKeywordClick(term)}
                  className="rounded-full bg-background/90 hover:bg-background py-2 px-5 transition-all duration-300 hover:border-primary-blue hover:text-primary-blue hover:shadow-level-1 text-theme-gray-dark/90"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

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
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-theme-dark mb-6">Ready to Get Started?</h2>
            
            <div className="space-y-4 mb-8">
              <p className="text-theme-gray-dark max-w-2xl mx-auto">Explore new job opportunities and manage your applications from your personalized dashboard.</p>
              
              <p className="text-theme-gray-dark max-w-2xl mx-auto">Manage your job postings and discover qualified candidates from your employer dashboard.</p>
              
              <p className="text-theme-gray-dark max-w-2xl mx-auto">Whether you&apos;re looking for your next opportunity or seeking talented professionals, Ligaye.com has you covered.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={user ? "/jobs" : "/sign-up"}>
                <Button className="bg-primary-blue hover:bg-primary-blue-light text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                  Join as Job Seeker
                </Button>
              </Link>
              <Link href={user ? "/employer/jobs/new" : "/sign-up"}>
                <Button variant="outline" className="border-secondary-green text-secondary-green hover:bg-secondary-green hover:text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300">
                  Join as Employer
                </Button>
              </Link>
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