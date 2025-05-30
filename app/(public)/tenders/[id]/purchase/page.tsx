import { notFound } from 'next/navigation';
import { getTenderPurchaseInfo } from './_queries';
import { PurchaseForm } from './_components/PurchaseForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TenderPurchasePage({ params }: PageProps) {
  const { id } = await params;
  
  const tender = await getTenderPurchaseInfo(id);
  
  if (!tender) {
    notFound();
  }

  if (!tender.documentsArePaid || !tender.documentPrice) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <div className="container mx-auto max-w-2xl px-md py-xl">
          <Card>
            <CardContent className="p-xl text-center">
              <FileText className="mx-auto h-16 w-16 text-theme-gray-dark mb-lg" />
              <h1 className="text-2xl font-bold text-theme-dark mb-md">
                Documents are Free
              </h1>
              <p className="text-theme-gray-dark mb-lg">
                The documents for this tender are available for free download.
              </p>
              <Link href={`/tenders/${id}`}>
                <Button>View Tender Details</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // At this point, we know documentsArePaid is true and documentPrice is not null
  // Create a properly typed tender object for the PurchaseForm
  const tenderForPurchase = {
    id: tender.id,
    title: tender.title,
    documentPrice: tender.documentPrice, // We know this is not null due to the check above
    documentCurrency: tender.documentCurrency || 'GMD', // Provide default if null
  };

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

        {/* Purchase Header */}
        <Card className="mb-xl">
          <CardHeader>
            <div className="flex items-center gap-md">
              <div className="p-sm bg-primary-blue/10 rounded-lg">
                <CreditCard className="h-6 w-6 text-primary-blue" />
              </div>
              <div>
                <CardTitle className="text-2xl">Purchase Documents</CardTitle>
                <p className="text-theme-gray-dark mt-xs">
                  Complete your purchase to access tender documents
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-theme-light rounded-lg p-lg">
              <h3 className="font-semibold text-theme-dark mb-sm">{tender.title}</h3>
              <p className="text-sm text-theme-gray-dark mb-md">{tender.organizationName}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-theme-gray-dark">Document Access Price:</span>
                <span className="text-xl font-bold text-primary-blue">
                  {tender.documentCurrency || 'GMD'} {tender.documentPrice?.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Form */}
        <PurchaseForm tender={tenderForPurchase} />
      </div>
    </div>
  );
} 