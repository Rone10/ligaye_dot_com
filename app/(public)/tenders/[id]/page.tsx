import { notFound } from 'next/navigation';
import { getTenderById } from './_queries';
import { getUser } from '@/lib/supabase/server';
import TenderDetailDisplay from './_components/TenderDetailDisplay';
import DeleteTenderDialog from './_components/DeleteTenderDialog';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { getUserProfile } from './_queries';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TenderDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // Fetch tender details
  const tender = await getTenderById(id);
  
  if (!tender) {
    notFound();
  }
  
  // Get current user for authorization
  const user = await getUser();
  // get user profile
  const profile = await getUserProfile(user?.id || '');
  const isOwner = profile?.id === tender.userId;
  
  console.log('profile', profile);

  return (
    <div className="container mx-auto px-xxs sm:px-xs md:px-sm lg:px-md py-lg">
      {/* Back button */}
      <div className="mb-lg">
        <Link href="/tenders">
          <Button variant="ghost" className="gap-xs">
            <ArrowLeft className="h-4 w-4" />
            Back to Tenders
          </Button>
        </Link>
      </div>
      
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md mb-xl">
        <h1 className="text-3xl font-bold text-theme-dark">Tender Details</h1>
        
        {isOwner && (
          <div className="flex gap-sm">
            <Link href={`/tenders/${id}/edit`}>
              <Button className="gap-xs">
                <Edit className="h-4 w-4" />
                Edit Tender
              </Button>
            </Link>
            <DeleteTenderDialog tenderId={id} />
          </div>
        )}
      </div>
      
      {/* Tender details display */}
      <TenderDetailDisplay tender={tender} />
    </div>
  );
} 