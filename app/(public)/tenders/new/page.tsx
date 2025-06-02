import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import { getSectors } from './_queries';
import { NewTenderForm } from './_components/NewTenderForm';

export default async function NewTenderPage() {
  // Verify user authentication
  const user = await getUser();
  if (!user) {
    redirect('/sign-in?redirect=/tenders/new');
  }

  // Fetch required data for dropdowns
  const sectors = await getSectors();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Tender</h1>
          <p className="text-gray-600">
            Post a new tender or public notice for your organization
          </p>
        </div>
        
        <NewTenderForm sectors={sectors} />
      </div>
    </div>
  );
} 