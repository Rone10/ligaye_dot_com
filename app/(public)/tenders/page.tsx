import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUser } from '@/lib/supabase/server';
import { getTenders, getTendersCount, getSectorsForFilter } from './_queries';
import { TendersPageClient } from './_components/TendersPageClient';

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
    sectorId: params.sector && params.sector.trim() !== '' ? params.sector : undefined,
    locationId: params.location && params.location.trim() !== '' ? params.location : undefined,
    status: params.status && params.status.trim() !== '' ? params.status : undefined,
    search: params.search && params.search.trim() !== '' ? params.search : undefined,
  };

  // Get current user (for showing create button and edit/delete actions)
  const user = await getUser();

  // Fetch data in parallel
  const [tenders, totalCount, sectors] = await Promise.all([
    getTenders({ page, limit, filters }),
    getTendersCount({ filters }),
    getSectorsForFilter(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
            Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Tenders</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover procurement opportunities and tender listings from various organizations.
          </p>

          {user && user.user_metadata.role === 'employer' && (
            <div className="mt-6">
              <Button asChild className="shadow-sm hover:shadow-md transition-all">
                <Link href="/tenders/new" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Submit New Tender
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Tenders Page Content */}
        <Suspense fallback={
          <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
            {/* Filter Sidebar Loading */}
            <div className="lg:sticky lg:top-8 lg:h-fit">
              <div className="bg-card border border-border rounded-xl p-6 h-[400px] flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground">Loading filters...</p>
                </div>
              </div>
            </div>

            {/* Tender Listings Loading */}
            <div className="space-y-8">
              <div className="bg-card border border-border rounded-xl p-8 flex items-center justify-center h-[400px]">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground text-lg">Loading tenders...</p>
                </div>
              </div>
            </div>
          </div>
        }>
          <TendersPageClient
            tenders={tenders}
            totalCount={totalCount}
            currentPage={page}
            limit={limit}
            sectors={sectors}
            user={user}
          />
        </Suspense>
      </div>
    </div>
  );
}