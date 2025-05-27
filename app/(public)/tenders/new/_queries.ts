import { db } from '@/lib/db';
import { tenders, sectors, locations, profiles } from '@/lib/db/schema';
import type { Tender, Sector, Location, NewTender } from '@/lib/db/schema';
import type { NewTenderSchemaType } from './_utils/validation';
import { eq } from 'drizzle-orm';

export async function getSectors(): Promise<Sector[]> {
  const database = await db();
  return await database
    .select()
    .from(sectors)
    .where(eq(sectors.deleted, false))
    .orderBy(sectors.name);
}

export async function getLocations(): Promise<Location[]> {
  const database = await db();
  return await database
    .select()
    .from(locations)
    .where(eq(locations.deleted, false))
    .orderBy(locations.region, locations.city);
}

export async function insertTender(data: NewTenderSchemaType, supabaseUserId: string): Promise<Tender> {
  const database = await db();

  // Get user profile by matching supabase userId to profiles.userId
  const [profile] = await database
    .select()
    .from(profiles)
    .where(eq(profiles.userId, supabaseUserId));

  if (!profile) {
    throw new Error('User profile not found');
  }

  // Prepare the tender data
  const tenderData: NewTender = {
    title: data.title,
    description: data.description,
    organizationName: data.organizationName,
    tenderType: data.tenderType,
    sectorId: data.sectorId || null,
    locationId: data.locationId || null,
    deadline: data.deadline || null,
    budgetRange: data.budgetRange || null,
    contactInformation: data.contactInformation || null,
    externalLink: data.externalLink || null,
    status: data.status,
    userId: profile.id // Use the profile.id for the tender's userId field
  };

  const [tender] = await database
    .insert(tenders)
    .values(tenderData)
    .returning();

  return tender;
} 