import { db } from '@/lib/db';
import { tenders, sectors, locations, profiles, tenderDocuments } from '@/lib/db/schema';
import type { Tender, Sector, Location, NewTender, NewTenderDocument } from '@/lib/db/schema';
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
    userId: profile.id, // Use the profile.id for the tender's userId field
    documentsArePaid: data.documentsArePaid,
    documentPrice: data.documentPrice || null,
    documentCurrency: data.documentCurrency,
  };

  const [tender] = await database
    .insert(tenders)
    .values(tenderData)
    .returning();

  return tender;
}

export async function createTenderWithDocuments(
  tenderData: Omit<NewTender, 'id' | 'createdAt' | 'updatedAt'> & { userId: string }
): Promise<{ success: boolean; tenderId?: string; error?: string }> {
  try {
    const database = await db();
    
    const result = await database.transaction(async (tx) => {
      // Get user profile by matching supabase userId to profiles.userId
      const [profile] = await tx
        .select()
        .from(profiles)
        .where(eq(profiles.userId, tenderData.userId));

      if (!profile) {
        throw new Error('User profile not found');
      }

      // Insert tender
      const [tender] = await tx
        .insert(tenders)
        .values({
          ...tenderData,
          userId: profile.id, // Use the profile.id for the tender's userId field
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: tenders.id });

      return tender;
    });

    return { success: true, tenderId: result.id };
  } catch (error) {
    console.error('Database error creating tender:', error);
    return { success: false, error: 'Database error' };
  }
}

export async function saveTenderDocumentMetadata(
  documents: Array<{
    tenderId: string;
    storagePath: string;
    originalFilename: string;
    fileSize: number;
    mimeType: string;
  }>
): Promise<boolean> {
  try {
    const database = await db();
    await database.insert(tenderDocuments).values(
      documents.map(doc => ({
        ...doc,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
    return true;
  } catch (error) {
    console.error('Error saving document metadata:', error);
    return false;
  }
} 