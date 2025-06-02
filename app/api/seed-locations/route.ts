import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { locations } from '@/lib/db/schema';
import { eq, and, or, inArray } from 'drizzle-orm';
import { getUser } from '@/lib/supabase/server';
import locationData from '@/documents/gambia_locations_data.json';

export async function POST() {
    const user  = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('Attempting to seed locations with duplicate check...');

        // 1. Fetch existing city/district/region combinations
        const existingLocations = await db()
            .select({ 
                city: locations.city, 
                district: locations.district, 
                region: locations.region 
            })
            .from(locations)
            .where(eq(locations.deleted, false));

        // Create a Set of existing combinations for efficient lookup
        // Use city|district|region as the unique identifier since we now have all three fields
        const existingCombinations = new Set(
            existingLocations.map(loc => 
                `${loc.city?.toLowerCase() || ''}|${loc.district?.toLowerCase() || ''}|${loc.region.toLowerCase()}`
            )
        );
        console.log(`Found ${existingCombinations.size} existing location combinations.`);

        // 2. Filter the input data to find only new locations
        const locationsToInsert = locationData.filter(newLoc => {
            const combinationKey = `${newLoc.city.toLowerCase()}|${newLoc.district.toLowerCase()}|${newLoc.region.toLowerCase()}`;
            return !existingCombinations.has(combinationKey);
        });

        console.log(`Found ${locationsToInsert.length} new locations to insert.`);

        // 3. Insert only the new locations if any exist
        if (locationsToInsert.length === 0) {
            console.log('No new locations to insert. All provided locations already exist.');
            return NextResponse.json({ 
                message: 'No new locations to insert. All provided locations already exist.',
                totalInData: locationData.length,
                existingCount: existingCombinations.size
            }, { status: 200 });
        }

        const result = await db().insert(locations).values(locationsToInsert).returning();

        console.log(`Successfully inserted ${result.length} new locations.`);
        return NextResponse.json({ 
            message: `Successfully inserted ${result.length} new locations.`, 
            count: result.length,
            totalInData: locationData.length,
            existingCount: existingCombinations.size
        }, { status: 201 });

    } catch (error) {
        console.error('Error seeding locations:', error);
        return NextResponse.json({ error: 'Failed to seed locations' }, { status: 500 });
    }
} 