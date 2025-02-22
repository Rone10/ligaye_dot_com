import { getTenderById, getSimilarTenders } from '@/app/actions/tenders';
import TenderDetailClient from './TenderDetailClient';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  // For now, we'll just pre-render the mock tender
  // In a real app, this would fetch all tender IDs from the API
  return [{ id: '1' }];
}

export default async function TenderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tender = await getTenderById(id);
  if (!tender) {
    notFound();
  }

  const similarTenders = await getSimilarTenders(id);

  return <TenderDetailClient tender={tender} similarTenders={similarTenders} />;
} 