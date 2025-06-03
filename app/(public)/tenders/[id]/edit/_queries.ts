'use server';
import { db } from '@/lib/db';
import { tenders, sectors, locations, profiles, tenderDocuments } from '@/lib/db/schema';
import type { Tender, Sector, Location } from '@/lib/db/schema';
import type { UpdateTenderSchemaType } from './_utils/validation';
import { eq, and } from 'drizzle-orm';

export async function getTenderByIdForEdit(id: string, supabaseUserId?: string): Promise<Tender | null> {
  try {
    const database = await db();
    
    // If supabaseUserId is provided, verify ownership
    if (supabaseUserId) {
      // Get user profile by matching supabase userId to profiles.userId
      const [profile] = await database
        .select()
        .from(profiles)
        .where(eq(profiles.userId, supabaseUserId));

      if (!profile) {
        throw new Error('User profile not found');
      }

      // Get tender and verify ownership
      const result = await database
        .select()
        .from(tenders)
        .where(and(
          eq(tenders.id, id),
          eq(tenders.userId, profile.id),
          eq(tenders.deleted, false)
        ))
        .limit(1);

      return result[0] || null;
    } else {
      // Just get the tender without ownership check (for page loading)
      const result = await database
        .select()
        .from(tenders)
        .where(and(
          eq(tenders.id, id),
          eq(tenders.deleted, false)
        ))
        .limit(1);

      return result[0] || null;
    }
  } catch (error) {
    console.error('Error fetching tender for edit:', error);
    throw new Error('Failed to fetch tender for editing');
  }
}

export async function getLocationById(locationId: string): Promise<Location | null> {
  try {
    const database = await db();
    
    const [location] = await database
      .select()
      .from(locations)
      .where(and(
        eq(locations.id, locationId),
        eq(locations.deleted, false)
      ))
      .limit(1);

    return location || null;
  } catch (error) {
    console.error('Error fetching location by id:', error);
    return null;
  }
}

export async function updateTender(id: string, data: UpdateTenderSchemaType, supabaseUserId: string): Promise<Tender | null> {
  try {
    const database = await db();

    // Get user profile by matching supabase userId to profiles.userId
    const [profile] = await database
      .select()
      .from(profiles)
      .where(eq(profiles.userId, supabaseUserId));

    if (!profile) {
      throw new Error('User profile not found');
    }

    // First, verify the tender exists and belongs to the user
    const existingTender = await database
      .select()
      .from(tenders)
      .where(and(
        eq(tenders.id, id),
        eq(tenders.userId, profile.id),
        eq(tenders.deleted, false)
      ))
      .limit(1);

    if (existingTender.length === 0) {
      throw new Error('Tender not found or unauthorized');
    }

    // Update the tender
    const [updatedTender] = await database
      .update(tenders)
      .set({
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
        documentsArePaid: data.documentsArePaid,
        documentPrice: data.documentPrice || null,
        documentCurrency: data.documentCurrency,
        updatedAt: new Date(),
      })
      .where(eq(tenders.id, id))
      .returning();

    return updatedTender || null;
  } catch (error) {
    console.error('Error updating tender:', error);
    throw new Error('Failed to update tender');
  }
}

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