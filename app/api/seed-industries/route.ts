import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { industries } from '@/lib/db/schema';
import { eq, ilike } from 'drizzle-orm'; // Use ilike for case-insensitive comparison
import { getUser } from '@/lib/supabase/server';

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
].map(name => ({ name })); // Format for insertion

export async function POST() {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('Attempting to seed industries with duplicate check...');

        // Fetch existing non-deleted industry names
        const existingIndustries = await db()
            .select({ name: industries.name })
            .from(industries)
            .where(eq(industries.deleted, false));

        const existingNamesLower = new Set(
            existingIndustries.map(ind => ind.name.toLowerCase())
        );
        console.log(`Found ${existingNamesLower.size} existing industry names.`);

        // Filter new data
        const industriesToInsert = industryData.filter(newInd =>
            !existingNamesLower.has(newInd.name.toLowerCase())
        );

        console.log(`Found ${industriesToInsert.length} new industries to insert.`);

        if (industriesToInsert.length === 0) {
            console.log('No new industries to insert.');
            return NextResponse.json({ message: 'No new industries to insert. All provided industries already exist.' }, { status: 200 });
        }

        const result = await db().insert(industries).values(industriesToInsert).returning();

        console.log(`Successfully inserted ${result.length} new industries.`);
        return NextResponse.json({ message: `Successfully inserted ${result.length} new industries.`, count: result.length }, { status: 201 });

    } catch (error) {
        console.error('Error seeding industries:', error);
        return NextResponse.json({ error: 'Failed to seed industries' }, { status: 500 });
    }
} 