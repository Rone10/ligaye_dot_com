import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react'; // Or Construction, etc.

export default function BlogPage() {
  const glassmorphicCardClass =
    'bg-white/70 dark:bg-black/60 backdrop-blur-lg border border-white/30 dark:border-black/40 rounded-2xl shadow-lg';

  return (
    <div className="min-h-[calc(100vh-theme(spacing.16))] flex items-center justify-center bg-gradient-to-br from-[hsl(var(--bg-gradient-from))] to-[hsl(var(--bg-gradient-to))] py-12 px-4 sm:px-6 lg:px-8">
      <Card className={`${glassmorphicCardClass} max-w-md w-full text-center p-8 md:p-12`}>
        <CardHeader className="items-center">
           <div className="mb-6 inline-flex items-center justify-center p-4 bg-primary-blue/10 rounded-full">
              <Briefcase className="h-10 w-10 text-primary-blue" />
           </div>
          <CardTitle className="text-3xl font-bold text-theme-dark mb-3">
            Blog Coming Soon!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-theme-gray-dark">
            {/* Add blog content here */}
            We will be posting blogs on the latest trends in the job market and how to stay ahead of the curve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 