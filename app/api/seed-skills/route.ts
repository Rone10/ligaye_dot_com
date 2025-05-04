import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { skills } from '@/lib/db/schema';
import { eq, ilike } from 'drizzle-orm';
import { getUser } from '@/lib/supabase/server';

const skillData = [
    "Communication", "Teamwork", "Leadership", "Time Management", "Critical Thinking",
    "Problem Solving", "Creativity", "Negotiation", "Presentation", "Adaptability",
    "Work Ethic", "Attention to Detail", "Project Management", "Microsoft Office Suite",
    "Data Analysis", "Graphic Design", "Social Media Management", "Web Development",
    "UI/UX Design", "Mobile App Development", "IT Support", "Networking", "Cybersecurity",
    "Digital Marketing", "SEO/SEM", "Python", "JavaScript", "PHP", "Accounting & Bookkeeping",
    "Audit & Taxation", "Procurement & Inventory Management", "Customer Relationship Management (CRM)",
    "Legal Drafting", "Clinical & Patient Care", "Teaching & Curriculum Design",
    "Machinery Operation", "Construction Supervision", "HVAC & Plumbing", "Electrical Installation",
    "Driving", "Translation & Interpretation", "Research & Proposal Writing", "Event Planning",
    "Photography", "Videography", "Video Editing", "Motion Graphics", "Content Writing",
    "Branding", "Voiceover Work", "Animation", "Illustration",
    "Artificial Intelligence & Machine Learning", "Blockchain", "Cloud Computing",
    "Data Science & Big Data Analytics", "Emotional Intelligence", "Resilience & Stress Management",
    "Cultural Competence"
].map(name => ({ name })); // Format for insertion

export async function POST() {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('Attempting to seed skills with duplicate check...');

        // Fetch existing non-deleted skill names
        const existingSkills = await db()
            .select({ name: skills.name })
            .from(skills)
            .where(eq(skills.deleted, false));

        const existingNamesLower = new Set(
            existingSkills.map(sk => sk.name.toLowerCase())
        );
        console.log(`Found ${existingNamesLower.size} existing skill names.`);

        // Filter new data
        const skillsToInsert = skillData.filter(newSk =>
            !existingNamesLower.has(newSk.name.toLowerCase())
        );

        console.log(`Found ${skillsToInsert.length} new skills to insert.`);

        if (skillsToInsert.length === 0) {
            console.log('No new skills to insert.');
            return NextResponse.json({ message: 'No new skills to insert. All provided skills already exist.' }, { status: 200 });
        }

        const result = await db().insert(skills).values(skillsToInsert).returning();

        console.log(`Successfully inserted ${result.length} new skills.`);
        return NextResponse.json({ message: `Successfully inserted ${result.length} new skills.`, count: result.length }, { status: 201 });

    } catch (error) {
        console.error('Error seeding skills:', error);
        return NextResponse.json({ error: 'Failed to seed skills' }, { status: 500 });
    }
} 