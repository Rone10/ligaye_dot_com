import { db } from '@/lib/db/db';
import { locations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Get all locations for dropdown
export async function getAllLocations() {
  return await db()
    .select({
      id: locations.id,
      name: locations.town, // Using town as display name
      region: locations.region,
      district: locations.district,
    })
    .from(locations)
    .where(eq(locations.deleted, false))
    .orderBy(locations.region, locations.town);
} 