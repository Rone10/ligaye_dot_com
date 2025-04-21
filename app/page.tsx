'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, BriefcaseIcon, Building2, Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import RingLoaderSpinner from '@/components/loaders/ring-loader';

export default function LandingPage() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
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
      <main className="flex-1 pt-16 md:pt-32 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center">
          <div className="flex-1 space-y-6 animate-appear">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-dark">
              Gambia&apos;s Premier <span className="text-primary-blue">Job Board</span>
            </h1>
            <p className="text-lg text-gray-dark max-w-xl">
              Connecting talented professionals with opportunities across Gambia. Find your dream job or hire the perfect candidate today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/jobs">
                <Button size="lg" className="button-primary gap-2 w-full sm:w-auto">
                  Find Jobs <Search className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/employer/jobs/new">
                <Button size="lg" variant="outline" className="button-secondary gap-2 w-full sm:w-auto">
                  Post a Job <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex-1 relative animate-appear-zoom">
            <div className="glass-card p-8 relative z-10 max-w-md mx-auto h-80 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <BriefcaseIcon className="h-24 w-24 text-primary-blue/70" />
                <p className="text-gray-dark">Job search illustration</p>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-blue/10 rounded-full blur-xl z-0"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-secondary-green/10 rounded-full blur-xl z-0"></div>
          </div>
        </div>
      </main>

      {/* Job Search Section */}
      <section className="py-12 px-4 md:px-8 relative -mt-8 md:-mt-16 mb-12">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-8 shadow-level-3">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-dark mb-6">Search Your Dream Job</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-dark h-5 w-5" />
                <Input 
                  placeholder="Job title, keyword, or company" 
                  className="pl-10 h-12 w-full" 
                />
              </div>
              <Button className="button-primary h-12 px-8 transition-all duration-300 hover:bg-primary-blue-light hover:scale-105">Search Jobs</Button>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full bg-white/80 hover:bg-white transition-all duration-300 hover:border-primary-blue hover:text-primary-blue hover:shadow-level-1"
              >
                Software Engineer
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full bg-white/80 hover:bg-white transition-all duration-300 hover:border-primary-blue hover:text-primary-blue hover:shadow-level-1"
              >
                Marketing Manager
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full bg-white/80 hover:bg-white transition-all duration-300 hover:border-primary-blue hover:text-primary-blue hover:shadow-level-1"
              >
                Data Scientist
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full bg-white/80 hover:bg-white transition-all duration-300 hover:border-primary-blue hover:text-primary-blue hover:shadow-level-1"
              >
                Product Manager
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full bg-white/80 hover:bg-white transition-all duration-300 hover:border-primary-blue hover:text-primary-blue hover:shadow-level-1"
              >
                UX Designer
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full bg-white/80 hover:bg-white transition-all duration-300 hover:border-primary-blue hover:text-primary-blue hover:shadow-level-1"
              >
                Sales Representative
              </Button>
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
      <footer className="bg-dark text-white py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Ligaye.com</h3>
              <p className="text-gray-300">Gambia&apos;s Premier Job Board</p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-3">For Job Seekers</h4>
              <ul className="space-y-2">
                <li><Link href="/jobs" className="text-gray-300 hover:text-white">Find Jobs</Link></li>
                <li><Link href="/create-profile" className="text-gray-300 hover:text-white">Create Profile</Link></li>
                <li><Link href="/job-alerts" className="text-gray-300 hover:text-white">Job Alerts</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-3">For Employers</h4>
              <ul className="space-y-2">
                <li><Link href="/employer/jobs/new" className="text-gray-300 hover:text-white">Post a Job</Link></li>
                <li><Link href="/pricing" className="text-gray-300 hover:text-white">Pricing</Link></li>
                <li><Link href="/resources" className="text-gray-300 hover:text-white">Resources</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-3">Contact</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white">Support</Link></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; {new Date().getFullYear()} Ligaye.com. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
} 