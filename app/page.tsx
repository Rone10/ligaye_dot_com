'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, BriefcaseIcon, Building2, Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import RingLoaderSpinner from '@/components/loaders/ring-loader';

export default function LandingPage() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
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
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-dark relative z-10">
              Gambia&apos;s Premier <span className="text-primary-blue">Employment Platform</span>
            </h1>
            
            <p className="text-xl text-gray-dark max-w-2xl mx-auto relative z-10">
              Connecting talented professionals with opportunities across Gambia. Find your dream job or hire the perfect candidate today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center relative z-10">
              <Link href="/jobs">
                <Button size="lg" className="button-primary gap-2 w-full sm:w-auto px-8 py-6 text-lg shadow-level-2 hover:shadow-level-3 transition-all duration-300 hover:translate-y-[-2px]">
                  Find Jobs <Search className="h-5 w-5 ml-1" />
                </Button>
              </Link>
              <Link href="/employer/jobs/new">
                <Button size="lg" variant="outline" className="button-secondary gap-2 w-full sm:w-auto px-8 py-6 text-lg border-2 hover:bg-primary-blue/5 transition-all duration-300">
                  Post a Job <ArrowRight className="h-5 w-5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Job Search Section */}
      <section className="py-12 px-4 md:px-8 relative -mt-4 md:-mt-12 mb-12">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-8 md:p-10 shadow-level-3 border border-white/30 backdrop-blur-xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-dark mb-6">Search Your Dream Job</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-grow relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-dark h-5 w-5" />
                <Input 
                  placeholder="Job title, keyword, or company" 
                  className="pl-12 h-14 w-full text-base focus:shadow-[0_0_0_3px_rgba(74,108,250,0.15)] transition-all duration-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Link href={`/jobs${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}>
                <Button className="button-primary h-14 px-10 text-base font-semibold transition-all duration-300 hover:bg-primary-blue-light hover:shadow-level-2">
                  Search Jobs
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                "Software Engineer",
                "Marketing Manager",
                "Data Scientist",
                "Product Manager",
                "UX Designer",
                "Sales Representative"
              ].map((job, index) => (
                <Link href={`/jobs?q=${encodeURIComponent(job)}`} key={index}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="rounded-full bg-white/90 hover:bg-white py-2 px-5 transition-all duration-300 hover:border-primary-blue hover:text-primary-blue hover:shadow-level-1 text-gray-dark/90"
                  >
                    {job}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Use Ligaye Section */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-br bg-red-500 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Job Seekers Column */}
            <div className="glass-card p-8 md:p-10 hover:shadow-level-3 transition-all duration-300 flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-primary-blue mb-2">Looking for work?</h3>
                <h2 className="text-3xl md:text-4xl font-bold text-dark mb-6">Why job seekers love us</h2>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary-blue/10 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                      <Building2 className="text-primary-blue h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-dark mb-1">Connect directly with top Gambian employers</p>
                      <p className="text-gray-dark">Apply directly to employers without intermediaries.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary-blue/10 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                      <Search className="text-primary-blue h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-dark mb-1">Full transparency from the start</p>
                      <p className="text-gray-dark">View salary, location, and requirements before applying.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary-blue/10 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                      <ArrowRight className="text-primary-blue h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-dark mb-1">One-click applications</p>
                      <p className="text-gray-dark">Your profile is your CV. Apply with a single click.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary-blue/10 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                      <Users className="text-primary-blue h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-dark mb-1">Exclusive local opportunities</p>
                      <p className="text-gray-dark">Find jobs tailored to Gambia&apos;s job market.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link href="/sign-up">
                  <Button variant="outline" className="border-2 border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white transition-all duration-300">
                    Create profile
                  </Button>
                </Link>
              </div>
            </div>

            {/* Employers Column */}
            <div className="glass-card p-8 md:p-10 hover:shadow-level-3 transition-all duration-300 flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-primary-blue mb-2">Need talent?</h3>
                <h2 className="text-3xl md:text-4xl font-bold text-dark mb-6">Why employers trust us</h2>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary-blue/10 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                      <Users className="text-primary-blue h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-dark mb-1">Access qualified Gambian talent</p>
                      <p className="text-gray-dark">Reach candidates with skills relevant to the local market.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary-blue/10 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                      <BriefcaseIcon className="text-primary-blue h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-dark mb-1">Easy job posting & management</p>
                      <p className="text-gray-dark">Post jobs, manage applications, and track candidates with ease.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary-blue/10 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                      <Search className="text-primary-blue h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-dark mb-1">Flexible payment options</p>
                      <p className="text-gray-dark">Choose between online payments or pay with cash locally.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary-blue/10 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                      <Building2 className="text-primary-blue h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-dark mb-1">Enhanced employer branding</p>
                      <p className="text-gray-dark">Showcase your company culture to attract the right candidates.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link href="/employer/jobs/new">
                  <Button className="bg-primary-blue text-white hover:bg-primary-blue-light transition-all duration-300">
                    Post a job
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-8 bg-gray/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">How It Works</h2>
            <p className="text-gray-dark max-w-2xl mx-auto">Ligaye makes it simple to connect job seekers and employers across Gambia</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-card p-6 hover:translate-y-[-5px] transition-all duration-300">
              <div className="bg-primary-blue/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-primary-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">For Job Seekers</h3>
              <p className="text-gray-dark mb-4">Create a profile, upload your resume, and apply to jobs with a single click. Get notified about new opportunities that match your skills.</p>
              <Link href="/sign-up" className="text-primary-blue font-medium hover:underline inline-flex items-center">
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            {/* Feature 2 */}
            <div className="glass-card p-6 hover:translate-y-[-5px] transition-all duration-300">
              <div className="bg-secondary-green/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="text-secondary-green" />
              </div>
              <h3 className="text-xl font-semibold mb-2">For Employers</h3>
              <p className="text-gray-dark mb-4">Post job openings, manage applications, and find the perfect candidates for your company. Easy payment options via Stripe or cash.</p>
              <Link href="/employer/jobs/new" className="text-primary-blue font-medium hover:underline inline-flex items-center">
                Post a Job <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            {/* Feature 3 */}
            <div className="glass-card p-6 hover:translate-y-[-5px] transition-all duration-300">
              <div className="bg-primary-blue/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BriefcaseIcon className="text-primary-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Latest Opportunities</h3>
              <p className="text-gray-dark mb-4">Browse through hundreds of job listings across various industries and experience levels throughout Gambia.</p>
              <Link href="/jobs" className="text-primary-blue font-medium hover:underline inline-flex items-center">
                Browse Jobs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/5 to-secondary-green/5 z-0"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="glass-card p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">Ready to Take the Next Step?</h2>
            <p className="text-gray-dark mb-8 max-w-2xl mx-auto">Whether you&apos;re looking for your next opportunity or seeking talented professionals, Ligaye.com has you covered.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="button-primary w-full sm:w-auto">Create an Account</Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="button-secondary w-full sm:w-auto">Sign In</Button>
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