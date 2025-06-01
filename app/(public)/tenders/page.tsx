import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUser } from '@/lib/supabase/server';
import { getTenders, getTendersCount, getSectorsForFilter, getLocationsForFilter } from './_queries';
import { TenderList } from './_components/TenderList';
import { TenderFilters } from './_components/TenderFilters';
import { getUserProfile } from './[id]/_queries';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    sector?: string;
    location?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function TendersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  // Parse search params
  const page = parseInt(params.page || '1', 10);
  const limit = parseInt(params.limit || '10', 10);
  const filters = {
    sectorId: params.sector || undefined,
    locationId: params.location || undefined,
    status: params.status || undefined,
    search: params.search || undefined,
  };

  // Get current user (for showing create button and edit/delete actions)
  // const user = await getUser();

  // // get user profile
  // const profile = await getUserProfile(user?.id || '');

  // Fetch data in parallel
  const [tenders, totalCount, sectors, locations] = await Promise.all([
    getTenders({ page, limit, filters }),
    getTendersCount({ filters }),
    getSectorsForFilter(),
    getLocationsForFilter(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto max-w-7xl px-md sm:px-lg md:px-xl lg:px-2xl py-xl">
        {/* Enhanced Header */}
        <div className="text-center space-y-lg mb-2xl">
          <div className="space-y-md">
            {/* <div className="flex justify-center">
              <div className="p-lg bg-primary-blue/10 rounded-xl">
                <FileText className="h-12 w-12 text-primary-blue" />
              </div>
            </div> */}
            <h1 className="text-4xl lg:text-5xl font-bold text-theme-dark">Tenders</h1>
            <p className="text-xl text-theme-gray-dark max-w-2xl mx-auto leading-relaxed">
              Discover procurement opportunities and tender listings
            </p>
          </div>
          
          {/* {user && ( */}
            <Button asChild className="shadow-level-2 hover:shadow-level-3 duration-standard">
              <Link href="/tenders/new" className="gap-xs">
                <Plus className="h-4 w-4" />
                Submit New Tender
              </Link>
            </Button>
          {/* )} */}
        </div>

        {/* Grid Layout for desktop, single column for mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-xl">
          {/* Filter Sidebar */}
          <div className="lg:sticky lg:top-xl lg:h-fit">
            <Suspense fallback={
              <div className="glass-card p-xl rounded-xl shadow-level-2 h-[400px] flex items-center justify-center">
                <div className="text-center space-y-sm">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue mx-auto"></div>
                  <p className="text-theme-gray-dark">Loading filters...</p>
                </div>
              </div>
            }>
              <TenderFilters sectors={sectors} locations={locations} />
            </Suspense>
          </div>
          
          {/* Tender Listings */}
          <div className="space-y-xl">
            <Suspense 
              fallback={
                <div className="glass-card p-2xl rounded-xl shadow-level-2 flex items-center justify-center h-[400px]">
                  <div className="text-center space-y-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
                    <p className="text-theme-gray-dark text-lg">Loading tenders...</p>
                  </div>
                </div>
              }
            >
              <TenderList
                tenders={tenders}
                // currentUserId={profile?.id}
                totalCount={totalCount}
                currentPage={page}
                limit={limit}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
} 