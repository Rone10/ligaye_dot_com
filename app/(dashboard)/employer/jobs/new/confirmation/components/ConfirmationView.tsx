'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Share2, Edit, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { clearJobFormData } from '../../components/JobFormProvider';

export function ConfirmationView() {
  // Clear the form data from localStorage on successful submission
  useEffect(() => {
    clearJobFormData();
  }, []);

  return (
    <div className="flex flex-col items-center py-8 px-4 max-w-3xl mx-auto text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>
      
      <h1 className="text-3xl font-bold mb-4">Your Job has been Posted!</h1>
      <p className="text-gray-600 mb-10 max-w-md">
        Your job posting has been successfully submitted and is now live on our platform.
      </p>
      
      <div className="grid md:grid-cols-3 gap-6 w-full mb-10">
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h3 className="font-medium mb-2">Job ID</h3>
          <p className="text-gray-800">#JB12345</p>
        </div>
        
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h3 className="font-medium mb-2">Status</h3>
          <div className="flex items-center justify-center">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              Active
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h3 className="font-medium mb-2">Visibility</h3>
          <p className="text-gray-800">Public</p>
        </div>
      </div>
      
      <div className="space-y-4 mb-10 w-full">
        <h2 className="text-xl font-semibold">What's Next?</h2>
        
        <div className="bg-white p-6 rounded-lg border border-slate-200 flex items-start text-left">
          <div className="bg-blue-100 p-2 rounded-full mr-4">
            <Share2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium mb-1">Share your job posting</h3>
            <p className="text-gray-600 text-sm mb-3">
              Increase visibility by sharing your job post on social media and with your network.
            </p>
            <Button variant="outline" size="sm">
              Share Job <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-slate-200 flex items-start text-left">
          <div className="bg-purple-100 p-2 rounded-full mr-4">
            <Edit className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium mb-1">Manage your job posting</h3>
            <p className="text-gray-600 text-sm mb-3">
              View applications, edit details, or close the position from your dashboard.
            </p>
            <Button variant="outline" size="sm">
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="default">
          <Link href="/employer/dashboard">
            Go to Dashboard
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/employer/jobs/new">
            Post Another Job
          </Link>
        </Button>
      </div>
    </div>
  );
} 