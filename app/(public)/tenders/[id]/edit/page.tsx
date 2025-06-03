import { notFound, redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import { getTenderByIdForEdit, getSectors, getTenderDocuments } from './_queries';
import { EditTenderForm } from './_components/EditTenderForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTenderPage({ params }: PageProps) {
  const { id } = await params;

  // Get current user
  const user = await getUser();
  if (!user || user.user_metadata.role !== 'employer') {
    redirect('/');
  }

  try {
    // Fetch tender data with ownership verification and other required data
    const [tender, sectors, tenderDocuments] = await Promise.all([
      getTenderByIdForEdit(id, user.id), // Pass user.id for ownership verification
      getSectors(),
      getTenderDocuments(id),
    ]);

    if (!tender) {
      // Either tender doesn't exist or user doesn't own it
      notFound();
    }

    return (
      <div className="container mx-auto py-8 px-4">
        <EditTenderForm 
          tender={tender}
          sectors={sectors}
          initialDocuments={tenderDocuments}
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading tender for edit:', error);
    notFound();
  }
} 