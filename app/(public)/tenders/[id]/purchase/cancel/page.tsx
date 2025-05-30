import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PurchaseCancelPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto max-w-2xl px-md py-xl">
        {/* Back Navigation */}
        <div className="mb-xl">
          <Link href={`/tenders/${id}`}>
            <Button variant="ghost" className="gap-xs">
              <ArrowLeft className="h-4 w-4" />
              Back to Tender
            </Button>
          </Link>
        </div>

        {/* Cancel Message */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-md">
              <div className="p-sm bg-red-100 rounded-lg">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-red-700">Purchase Cancelled</CardTitle>
                <p className="text-theme-gray-dark mt-xs">
                  Your payment was cancelled and no charges were made.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-lg">
              <p className="text-theme-gray-dark">
                You can try purchasing the documents again at any time. 
                If you experienced any issues during checkout, please contact support.
              </p>
              
              <div className="flex gap-md">
                <Link href={`/tenders/${id}/purchase`}>
                  <Button>Try Again</Button>
                </Link>
                <Link href={`/tenders/${id}`}>
                  <Button variant="outline">View Tender Details</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 