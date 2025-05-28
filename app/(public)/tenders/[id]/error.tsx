'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function TenderDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Tender detail error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-xxs sm:px-xs md:px-sm lg:px-md py-lg">
      <Card className="glass-card p-xl max-w-2xl mx-auto text-center">
        <div className="flex flex-col items-center space-y-lg">
          <div className="bg-red-500/10 p-lg rounded-full">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          
          <div className="space-y-sm">
            <h2 className="text-2xl font-bold text-theme-dark">
              Something went wrong!
            </h2>
            <p className="text-theme-gray-dark">
              We encountered an error while loading the tender details.
            </p>
          </div>

          <div className="flex gap-sm">
            <Button
              onClick={reset}
              variant="outline"
            >
              Try again
            </Button>
            <Link href="/tenders">
              <Button>
                Back to Tenders
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
