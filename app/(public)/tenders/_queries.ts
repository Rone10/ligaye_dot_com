import { db } from '@/lib/db';
import { tenders, sectors, locations, profiles } from '@/lib/db/schema';
import type { Tender, Sector, Location } from '@/lib/db/schema';
import { eq, and, ilike, or, desc, count } from 'drizzle-orm';

export interface TenderFiltersType {
  sectorId?: string;
  locationId?: string;
  status?: string;
  search?: string;
}

export interface GetTendersParams {
  page?: number;
  limit?: number;
  filters?: TenderFiltersType;
}

export interface TenderWithRelations extends Tender {
  sector?: Pick<Sector, 'id' | 'name'>;
  location?: Pick<Location, 'id' | 'region' | 'city'>;
  user?: Pick<typeof profiles.$inferSelect, 'id' | 'fullName'>;
}

export async function getTenders(params: GetTendersParams): Promise<TenderWithRelations[]> {
  const { page = 1, limit = 10, filters } = params;
  const offset = (page - 1) * limit;

  try {
    const database = await db();
    
    // Build where conditions
    const whereConditions = [
      eq(tenders.deleted, false), // Only non-deleted tenders
    ];

    // Add filter conditions
    if (filters?.sectorId) {
      whereConditions.push(eq(tenders.sectorId, filters.sectorId));
    }

    if (filters?.locationId) {
      whereConditions.push(eq(tenders.locationId, filters.locationId));
    }

    if (filters?.status) {
      whereConditions.push(eq(tenders.status, filters.status as any));
    }

    if (filters?.search) {
      whereConditions.push(
        or(
          ilike(tenders.title, `%${filters.search}%`),
          ilike(tenders.organizationName, `%${filters.search}%`),
          ilike(tenders.description, `%${filters.search}%`)
        )!
      );
    }

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
        // Related fields
        sector: {
          id: sectors.id,
          name: sectors.name,
        },
        location: {
          id: locations.id,
          region: locations.region,
          city: locations.city,
        },
        user: {
          id: profiles.id,
          fullName: profiles.fullName,
        },
      })
      .from(tenders)
      .leftJoin(sectors, eq(tenders.sectorId, sectors.id))
      .leftJoin(locations, eq(tenders.locationId, locations.id))
      .leftJoin(profiles, eq(tenders.userId, profiles.id))
      .where(and(...whereConditions))
      .orderBy(desc(tenders.createdAt))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
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
      sector: row.sector?.id ? row.sector : undefined,
      location: row.location?.id ? row.location : undefined,
      user: row.user?.id ? row.user : undefined,
    }));
  } catch (error) {
    console.error('Error fetching tenders:', error);
    throw new Error('Failed to fetch tenders');
  }
}

export async function getTendersCount(params: { filters?: TenderFiltersType }): Promise<number> {
  const { filters } = params;

  try {
    const database = await db();
    
    // Build where conditions
    const whereConditions = [
      eq(tenders.deleted, false), // Only non-deleted tenders
    ];

    // Add filter conditions
    if (filters?.sectorId) {
      whereConditions.push(eq(tenders.sectorId, filters.sectorId));
    }

    if (filters?.locationId) {
      whereConditions.push(eq(tenders.locationId, filters.locationId));
    }

    if (filters?.status) {
      whereConditions.push(eq(tenders.status, filters.status as any));
    }

    if (filters?.search) {
      whereConditions.push(
        or(
          ilike(tenders.title, `%${filters.search}%`),
          ilike(tenders.organizationName, `%${filters.search}%`),
          ilike(tenders.description, `%${filters.search}%`)
        )!
      );
    }

    const result = await database
      .select({ count: count() })
      .from(tenders)
      .where(and(...whereConditions));

    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error counting tenders:', error);
    throw new Error('Failed to count tenders');
  }
}

export async function getSectorsForFilter(): Promise<Sector[]> {
  try {
    const database = await db();
    
    const result = await database
      .select({
        id: sectors.id,
        name: sectors.name,
        deleted: sectors.deleted,
        createdAt: sectors.createdAt,
        updatedAt: sectors.updatedAt,
      })
      .from(sectors)
      .where(eq(sectors.deleted, false))
      .orderBy(sectors.name);

    return result;
  } catch (error) {
    console.error('Error fetching sectors:', error);
    throw new Error('Failed to fetch sectors');
  }
}

export async function getLocationsForFilter(): Promise<Location[]> {
  try {
    const database = await db();
    
    const result = await database
      .select({
        id: locations.id,
        region: locations.region,
        district: locations.district,
        city: locations.city,
        deleted: locations.deleted,
        createdAt: locations.createdAt,
        updatedAt: locations.updatedAt,
      })
      .from(locations)
      .where(eq(locations.deleted, false))
      .orderBy(locations.region, locations.city);

    return result;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw new Error('Failed to fetch locations');
  }
} 