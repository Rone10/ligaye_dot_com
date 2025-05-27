import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUser } from '@/lib/supabase/server';
import { getTenders, getTendersCount, getSectorsForFilter, getLocationsForFilter } from './_queries';
import { TendersDataTable } from './_components/TendersDataTable';
import { TenderFilters } from './_components/TenderFilters';

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
  const user = await getUser();

  // Fetch data in parallel
  const [tenders, totalCount, sectors, locations] = await Promise.all([
    getTenders({ page, limit, filters }),
    getTendersCount({ filters }),
    getSectorsForFilter(),
    getLocationsForFilter(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e9efff] to-[#f4f7ff] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tenders</h1>
              <p className="text-gray-600 mt-2">
                Discover procurement opportunities and tender listings
              </p>
            </div>
            {user && (
              <Button asChild className="bg-[#4a6cfa] hover:bg-[#7b90ff]">
                <Link href="/tenders/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Tender
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Suspense fallback={<div>Loading filters...</div>}>
            <TenderFilters sectors={sectors} locations={locations} />
          </Suspense>
        </div>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {totalCount === 0 
              ? 'No tenders found'
              : `${totalCount} tender${totalCount === 1 ? '' : 's'} found`
            }
          </p>
        </div>

        {/* Tenders Table */}
        <div className="mb-8">
          <Suspense fallback={<div>Loading tenders...</div>}>
            <TendersDataTable
              tenders={tenders}
              currentUserId={user?.id}
              totalCount={totalCount}
              currentPage={page}
              limit={limit}
            />
          </Suspense>
        </div>

        {/* Pagination */}
        {totalCount > limit && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Button variant="outline" asChild>
                  <Link 
                    href={{
                      pathname: '/tenders',
                      query: { ...params, page: (page - 1).toString() }
                    }}
                  >
                    Previous
                  </Link>
                </Button>
              )}
              
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {page} of {Math.ceil(totalCount / limit)}
              </span>
              
              {page < Math.ceil(totalCount / limit) && (
                <Button variant="outline" asChild>
                  <Link 
                    href={{
                      pathname: '/tenders',
                      query: { ...params, page: (page + 1).toString() }
                    }}
                  >
                    Next
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 