import { notFound } from 'next/navigation';
import { verifyPurchaseAndGetDocuments } from './_queries';
import { DownloadLinks } from './_components/DownloadLinks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

export default async function PurchaseSuccessPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { session_id } = await searchParams;
  
  if (!session_id) {
    notFound();
  }

  const purchaseData = await verifyPurchaseAndGetDocuments(id, session_id);
  console.log('purchaseData inside purchase success page', purchaseData);
  if (!purchaseData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto max-w-3xl px-md py-xl">
        {/* Success Header */}
        <Card className="mb-xl">
          <CardHeader>
            <div className="flex items-center gap-md">
              <div className="p-sm bg-green-100 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-green-700">Purchase Successful!</CardTitle>
                <p className="text-theme-gray-dark mt-xs">
                  Your payment has been processed and documents are now available for download.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-theme-light rounded-lg p-lg">
              <h3 className="font-semibold text-theme-dark mb-sm">{purchaseData.tender.title}</h3>
              <p className="text-sm text-theme-gray-dark mb-md">{purchaseData.tender.organizationName}</p>
              <div className="grid grid-cols-2 gap-md text-sm">
                <div>
                  <span className="text-theme-gray-dark">Amount Paid:</span>
                  <span className="font-medium ml-sm">
                    {purchaseData.payment.currency} {(purchaseData.payment.amount / 100).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-theme-gray-dark">Transaction ID:</span>
                  <span className="font-mono text-xs ml-sm">{purchaseData.payment.transactionId}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-md">
              <Download className="h-6 w-6 text-primary-blue" />
              <CardTitle>Download Documents</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-lg">
              <p className="text-theme-gray-dark mb-md">
                Your documents are ready for download. These links will expire in 15 minutes for security.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-md">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Please download all documents now. 
                  You can return to this page using the link in your email receipt.
                </p>
              </div>
            </div>
            
            <DownloadLinks documents={purchaseData.documents} />
            
            <div className="mt-xl pt-lg border-t border-theme-gray">
              <Link href={`/tenders/${id}`}>
                <Button variant="outline">Back to Tender Details</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 