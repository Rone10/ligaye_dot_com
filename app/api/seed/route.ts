import { NextRequest, NextResponse } from 'next/server';
import { seedSkills, assignSkillsToJobs } from '@/lib/db/seed-data';

// This route will seed the database with skills and assign them to jobs
export async function GET(req: NextRequest) {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ 
        error: 'This route is only available in development' 
      }, { status: 403 });
    }

    // Seed skills
    const skillsResult = await seedSkills();
    
    // Assign skills to jobs
    const assignResult = await assignSkillsToJobs();
    
    return NextResponse.json({ 
      success: skillsResult.success && assignResult.success,
      skillsResult,
      assignResult
    });
  } catch (error) {
    console.error('Error in seed route:', error);
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 });
  }
} 