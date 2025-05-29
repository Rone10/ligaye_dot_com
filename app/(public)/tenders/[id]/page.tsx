import { notFound } from 'next/navigation';
import { getTenderById } from './_queries';
import { getUser } from '@/lib/supabase/server';
import TenderDetailDisplay from './_components/TenderDetailDisplay';
import DeleteTenderDialog from './_components/DeleteTenderDialog';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, FileText } from 'lucide-react';
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
  let isOwner = false;
  if(user){
    // get user profile
    const profile = await getUserProfile(user?.id || '');
    isOwner = profile?.id === tender.userId;
    console.log('profile', profile);
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto max-w-6xl px-md sm:px-lg md:px-xl lg:px-2xl py-xl">
        {/* Enhanced Header Section */}
        <div className="space-y-xl mb-2xl">
          {/* Back Navigation */}
          <div className="animate-appear">
            <Link href="/tenders">
              <Button 
                variant="ghost" 
                className="gap-xs hover:bg-theme-light/50 hover:shadow-level-1 duration-standard group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 duration-standard" />
                Back to Tenders
              </Button>
            </Link>
          </div>
          
          {/* Page Header with enhanced styling */}
          <div className="glass-card p-xl rounded-xl shadow-level-2 hover:shadow-level-3 duration-standard animate-appear">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-lg">
              <div className="space-y-sm">
                <div className="flex items-center gap-md">
                  <div className="p-sm bg-primary-blue/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary-blue" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-theme-dark">Tender Details</h1>
                    <p className="text-lg text-theme-gray-dark mt-xs">
                      Complete information about this opportunity
                    </p>
                  </div>
                </div>
              </div>
              
              {isOwner && (
                <div className="flex gap-sm">
                  <Link href={`/tenders/${id}/edit`}>
                    <Button className="gap-xs shadow-level-2 hover:shadow-level-3 duration-standard">
                      <Edit className="h-4 w-4" />
                      Edit Tender
                    </Button>
                  </Link>
                  <DeleteTenderDialog tenderId={id} />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Tender details display */}
        <TenderDetailDisplay tender={tender} />
      </div>
    </div>
  );
} 