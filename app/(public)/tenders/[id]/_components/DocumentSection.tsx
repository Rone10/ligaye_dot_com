import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Lock, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { getTenderDocuments } from '../_queries';
import { FreeDocumentDownload } from './FreeDocumentDownload';
import type { TenderDocument } from '@/lib/db/schema';

interface DocumentSectionProps {
  tender: {
    id: string;
    title: string;
    documentsArePaid: boolean;
    documentPrice?: number | null;
    documentCurrency?: string | null;
  };
}

export async function DocumentSection({ tender }: DocumentSectionProps) {
  const documents = await getTenderDocuments(tender.id);

  if (documents.length === 0) {
    return null; // Don't show section if no documents
  }

  return (
    <Card className="animate-appear">
      <CardHeader>
        <div className="flex items-center gap-md">
          <FileText className="h-6 w-6 text-primary-blue" />
          <CardTitle>Documents</CardTitle>
          {tender.documentsArePaid && (
            <div className="flex items-center gap-xs text-sm bg-yellow-100 text-yellow-800 px-sm py-xs rounded-full">
              <Lock className="h-3 w-3" />
              Paid Access
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {tender.documentsArePaid ? (
          // Paid Documents
          <div className="space-y-lg">
            <div className="bg-theme-light rounded-lg p-lg">
              <div className="flex items-center justify-between mb-md">
                <div>
                  <h4 className="font-semibold text-theme-dark">Document Access Required</h4>
                  <p className="text-sm text-theme-gray-dark mt-xs">
                    Purchase access to download {documents.length} document{documents.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-blue">
                    {tender.documentCurrency} {tender.documentPrice?.toFixed(2)}
                  </div>
                  <div className="text-sm text-theme-gray-dark">One-time payment</div>
                </div>
              </div>
              
              <div className="space-y-sm mb-lg">
                {documents.map((doc: TenderDocument) => (
                  <div key={doc.id} className="flex items-center gap-sm text-sm">
                    <FileText className="h-4 w-4 text-theme-gray-dark" />
                    <span className="text-theme-dark">{doc.originalFilename}</span>
                    <span className="text-theme-gray-dark">
                      ({((doc.fileSize || 0) / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                ))}
              </div>
              
              <Link href={`/tenders/${tender.id}/purchase`}>
                <Button className="w-full gap-xs" size="lg">
                  <CreditCard className="h-4 w-4" />
                  Purchase Document Access
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          // Free Documents
          <div className="space-y-sm">
            <div className="bg-green-50 border border-green-200 rounded-lg p-md mb-lg">
              <p className="text-sm text-green-800">
                <strong>Free Download:</strong> These documents are available for free download.
              </p>
            </div>
            
            {documents.map((doc: TenderDocument) => (
              <FreeDocumentDownload 
                key={doc.id} 
                document={{
                  id: doc.id,
                  originalFilename: doc.originalFilename,
                  fileSize: doc.fileSize || 0,
                }} 
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 