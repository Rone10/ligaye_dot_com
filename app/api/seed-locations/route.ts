import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { locations } from '@/lib/db/schema';
import { eq, and, or, inArray } from 'drizzle-orm';
import { getUser } from '@/lib/supabase/server';

// Data extracted from the provided image
const locationData = [
  { city: 'Banjul', region: 'West Coast Region' },
  { city: 'Serekunda', region: 'West Coast Region' },
  { city: 'Bakau', region: 'West Coast Region' },
  { city: 'Abuko', region: 'West Coast Region' },
  { city: 'Bundungka Kunda', region: 'West Coast Region' },
  { city: 'Dippa Kunda', region: 'West Coast Region' },
  { city: 'Faji Kunda', region: 'West Coast Region' },
  { city: 'Kololi', region: 'West Coast Region' },
  { city: 'Kotu', region: 'West Coast Region' },
  { city: 'Latri Kunda German', region: 'West Coast Region' },
  { city: 'Latri Kunda Sabiji', region: 'West Coast Region' },
  { city: 'Manjai Kunda', region: 'West Coast Region' },
  { city: 'New Jeshwang', region: 'West Coast Region' },
  { city: 'Old Jeshwang', region: 'West Coast Region' },
  { city: 'Talinding', region: 'West Coast Region' },
  { city: 'Brikama', region: 'West Coast Region' },
  { city: 'Sukuta', region: 'West Coast Region' },
  { city: 'Gunjur', region: 'West Coast Region' },
  { city: 'Tanji', region: 'West Coast Region' },
  { city: 'Farato', region: 'West Coast Region' },
  { city: 'Busumbala', region: 'West Coast Region' },
  { city: 'Yundum', region: 'West Coast Region' },
  { city: 'Tabokoto', region: 'West Coast Region' },
  { city: 'Nema Kunku', region: 'West Coast Region' },
  { city: 'Kerewan', region: 'North Bank Region' },
  { city: 'Farafenni', region: 'North Bank Region' },
  { city: 'Jufureh', region: 'North Bank Region' },
  { city: 'Lamin (North Bank)', region: 'North Bank Region' },
  { city: 'Kalagi', region: 'North Bank Region' },
  { city: 'Kanilai', region: 'North Bank Region' },
  { city: 'Mansa Konko', region: 'Lower River Region' },
  { city: 'Soma', region: 'Lower River Region' },
  { city: 'Janjanbureh', region: 'Central River Region' },
  { city: 'Bansang', region: 'Central River Region' },
  { city: 'Kuntaur', region: 'Central River Region' },
  { city: 'Gimara Bakadaji', region: 'Central River Region' },
  { city: 'Basse Santa Su', region: 'Upper River Region' },
  { city: 'Sabi', region: 'Upper River Region' },
];

export async function POST() {
    const user  = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('Attempting to seed locations with duplicate check...');

        // 1. Fetch existing city/region pairs
        const existingLocations = await db()
            .select({ city: locations.city, region: locations.region })
            .from(locations)
            // Optimize by selecting only necessary columns
            // Filter out null cities if that's possible in your schema, though unlikely here
            .where(eq(locations.deleted, false)); // Assuming you only care about non-deleted existing locations

        // Create a Set of existing pairs for efficient lookup
        // Handle potential null cities just in case, though 'city' is likely not null based on your data
        const existingPairs = new Set(
            existingLocations.map(loc => `${loc.city?.toLowerCase() || ''}|${loc.region.toLowerCase()}`)
        );
        console.log(`Found ${existingPairs.size} existing location pairs.`);


        // 2. Filter the input data to find only new locations
        const locationsToInsert = locationData.filter(newLoc => {
            const pairKey = `${newLoc.city.toLowerCase()}|${newLoc.region.toLowerCase()}`;
            return !existingPairs.has(pairKey);
        });

        console.log(`Found ${locationsToInsert.length} new locations to insert.`);

        // 3. Insert only the new locations if any exist
        if (locationsToInsert.length === 0) {
            console.log('No new locations to insert. All provided locations already exist.');
            return NextResponse.json({ message: 'No new locations to insert. All provided locations already exist.' }, { status: 200 });
        }

        const result = await db().insert(locations).values(locationsToInsert).returning();

        console.log(`Successfully inserted ${result.length} new locations.`);
        return NextResponse.json({ message: `Successfully inserted ${result.length} new locations.`, count: result.length }, { status: 201 });

    } catch (error) {
        console.error('Error seeding locations:', error);
        return NextResponse.json({ error: 'Failed to seed locations' }, { status: 500 });
    }
} 