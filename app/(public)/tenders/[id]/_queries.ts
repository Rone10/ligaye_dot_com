import { db } from '@/lib/db';
import { tenders, sectors, locations, profiles, tenderDocuments } from '@/lib/db/schema';
import type { Tender, Sector, Location, Profile, TenderDocument } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export interface TenderWithRelations extends Tender {
  sector?: Sector;
  location?: Location;
  user?: Pick<Profile, 'id' | 'fullName'>;
}

export async function getTenderById(id: string): Promise<TenderWithRelations | null> {
  try {
    const database = await db();
    
    const result = await database
      .select({
        // Tender fields
        id: tenders.id,
        title: tenders.title,
        description: tenders.description,
        organizationName: tenders.organizationName,
        tenderType: tenders.tenderType,
        sectorId: tenders.sectorId,
        locationId: tenders.locationId,
        deadline: tenders.deadline,
        budgetRange: tenders.budgetRange,
        contactInformation: tenders.contactInformation,
        externalLink: tenders.externalLink,
        status: tenders.status,
        userId: tenders.userId,
        deleted: tenders.deleted,
        createdAt: tenders.createdAt,
        updatedAt: tenders.updatedAt,
        // New document-related fields
        documentsArePaid: tenders.documentsArePaid,
        documentPrice: tenders.documentPrice,
        documentCurrency: tenders.documentCurrency,
        // Related fields - full objects
        sector: sectors,
        location: locations,
        user: {
          id: profiles.id,
          fullName: profiles.fullName,
        },
      })
      .from(tenders)
      .leftJoin(sectors, eq(tenders.sectorId, sectors.id))
      .leftJoin(locations, eq(tenders.locationId, locations.id))
      .leftJoin(profiles, eq(tenders.userId, profiles.id))
      .where(and(
        eq(tenders.id, id),
        eq(tenders.deleted, false)
      ))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      organizationName: row.organizationName,
      tenderType: row.tenderType,
      sectorId: row.sectorId,
      locationId: row.locationId,
      deadline: row.deadline,
      budgetRange: row.budgetRange,
      contactInformation: row.contactInformation,
      externalLink: row.externalLink,
      status: row.status,
      userId: row.userId,
      deleted: row.deleted,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      // New document-related fields
      documentsArePaid: row.documentsArePaid,
      documentPrice: row.documentPrice,
      documentCurrency: row.documentCurrency,
      sector: row.sector || undefined,
      location: row.location || undefined,
      user: row.user?.id ? row.user : undefined,
    };
  } catch (error) {
    console.error('Error fetching tender by ID:', error);
    throw new Error('Failed to fetch tender details');
  }
} 


// get user profile
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const database = await db();
    const profile = await database
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));
    return profile[0] || null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
}

export async function getTenderDocuments(tenderId: string): Promise<TenderDocument[]> {
  try {
    const database = await db();
    
    const documents = await database
      .select()
      .from(tenderDocuments)
      .where(and(
        eq(tenderDocuments.tenderId, tenderId),
        eq(tenderDocuments.deleted, false)
      ));

    return documents;
  } catch (error) {
    console.error('Error fetching tender documents:', error);
    return [];
  }
}