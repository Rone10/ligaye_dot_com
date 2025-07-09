import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sectors } from '@/lib/db/schema';
import { eq, ilike } from 'drizzle-orm'; // Use ilike for case-insensitive comparison
import { getUser } from '@/lib/supabase/server';
import { adminArcjet } from '@/lib/arcjet';
import { headers } from 'next/headers';

const industryData = [
  "Agriculture & Agribusiness",
  "Aerospace & Defense",
  "Banking & Financial Services",
  "Biotechnology & Life Sciences",
  "Construction & Real Estate",
  "Creative Arts & Media",
  "Customer Service & Call Centers",
  "Education & Training",
  "E-commerce & Online Retail",
  "Energy, Oil & Gas",
  "Engineering & Technical Services",
  "Environmental & Natural Resources",
  "Government & Public Service",
  "Healthcare & Medical",
  "Hospitality & Tourism",
  "Human Resources & Recruitment",
  "Information Technology & Software",
  "Legal & Compliance",
  "Logistics, Transport & Supply Chain",
  "Manufacturing & Production",
  "Marketing, Advertising & PR",
  "Media & Broadcasting",
  "NGO & Nonprofit",
  "Pharmaceuticals",
  "Procurement & Supply",
  "Renewable Energy & Sustainability",
  "Research & Development",
  "Retail & Wholesale",
  "Sales & Business Development",
  "Security Services",
  "Telecommunications",
  "Textiles & Fashion",
  "Training & Development",
  "Utilities & Sanitation",
  "Youth, Sports & Culture",
  "Other"
].map(name => ({ name }));

export async function POST() {
    // Rate limiting and shield protection for admin routes
    const request = new Request('https://ligaye.com/api/seed-industries', {
        headers: await headers(),
    });
    
    const decision = await adminArcjet.protect(request);
    
    if (decision.isDenied()) {
        return NextResponse.json(
            { error: 'Too many seed requests. Please try again later.' },
            { status: 429 }
        );
    }
    
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('Attempting to seed sectors with duplicate check...');

        // Fetch existing non-deleted sector names
        const existingSectors = await db()
            .select({ name: sectors.name })
            .from(sectors)
            .where(eq(sectors.deleted, false));

        const existingNamesLower = new Set(
            existingSectors.map(sector => sector.name.toLowerCase())
        );
        console.log(`Found ${existingNamesLower.size} existing sector names.`);

        // Filter new data
        const sectorsToInsert = industryData.filter(newSector =>
            !existingNamesLower.has(newSector.name.toLowerCase())
        );

        console.log(`Found ${sectorsToInsert.length} new sectors to insert.`);

        if (sectorsToInsert.length === 0) {
            console.log('No new sectors to insert.');
            return NextResponse.json({ message: 'No new sectors to insert. All provided sectors already exist.' }, { status: 200 });
        }

        const result = await db().insert(sectors).values(sectorsToInsert).returning();

        console.log(`Successfully inserted ${result.length} new sectors.`);
        return NextResponse.json({ message: `Successfully inserted ${result.length} new sectors.`, count: result.length }, { status: 201 });

    } catch (error) {
        console.error('Error seeding sectors:', error);
        return NextResponse.json({ error: 'Failed to seed sectors' }, { status: 500 });
    }
} 