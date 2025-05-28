import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileX } from 'lucide-react';
import Link from 'next/link';

export default function TenderNotFound() {
  return (
    <div className="container mx-auto px-xxs sm:px-xs md:px-sm lg:px-md py-lg">
      <Card className="glass-card p-xl max-w-2xl mx-auto text-center">
        <div className="flex flex-col items-center space-y-lg">
          <div className="bg-theme-gray/10 p-lg rounded-full">
            <FileX className="h-12 w-12 text-theme-gray-dark" />
          </div>
          
          <div className="space-y-sm">
            <h2 className="text-2xl font-bold text-theme-dark">
              Tender Not Found
            </h2>
            <p className="text-theme-gray-dark">
              The tender you're looking for doesn't exist or has been removed.
            </p>
          </div>

          <Link href="/tenders">
            <Button>
              Back to Tenders
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
