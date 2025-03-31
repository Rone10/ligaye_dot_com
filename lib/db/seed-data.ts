'use server'

import { db } from '.';
import { skills, jobSkills, jobs } from './schema';
import { eq } from 'drizzle-orm';

export async function seedSkills() {
  try {
    // Check if we already have skills
    const existingSkills = await db().select().from(skills).limit(1);
    
    if (existingSkills.length === 0) {
      console.log('Seeding skills...');
      
      // Common tech skills to seed
      const skillNames = [
        'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 
        'Python', 'Django', 'Flask', 'FastAPI',
        'Java', 'Spring Boot', 'Kotlin',
        'C#', '.NET', 'ASP.NET',
        'PHP', 'Laravel', 'Symfony',
        'Ruby', 'Ruby on Rails',
        'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
        'AWS', 'Azure', 'GCP', 'Terraform', 'Docker', 'Kubernetes',
        'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap',
        'Git', 'GitHub', 'GitLab', 'CI/CD',
        'REST API', 'GraphQL', 'gRPC',
        'React Native', 'Flutter', 'Swift', 'Kotlin'
      ];
      
      // Insert skills
      const insertedSkills = await Promise.all(
        skillNames.map(async (name) => {
          const result = await db().insert(skills).values({ name }).returning();
          return result[0];
        })
      );
      
      console.log(`Inserted ${insertedSkills.length} skills`);
    } else {
      console.log('Skills already exist, skipping seed');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error seeding skills:', error);
    return { success: false, error };
  }
}

export async function assignSkillsToJobs() {
  try {
    // Get all jobs
    const allJobs = await db().select().from(jobs).where(eq(jobs.isActive, true));
    
    // Get all skills
    const allSkills = await db().select().from(skills);
    
    if (allJobs.length === 0 || allSkills.length === 0) {
      console.log('No jobs or skills found to assign');
      return { success: false, message: 'No jobs or skills found' };
    }
    
    console.log(`Found ${allJobs.length} jobs and ${allSkills.length} skills`);
    
    // Check if we already have job skills
    const existingJobSkills = await db().select().from(jobSkills).limit(1);
    
    if (existingJobSkills.length === 0) {
      console.log('Assigning skills to jobs...');
      
      // For each job, assign 3-6 random skills
      for (const job of allJobs) {
        // Randomly select 3-6 skills
        const numSkills = Math.floor(Math.random() * 4) + 3; // 3 to 6 skills
        const shuffledSkills = [...allSkills].sort(() => 0.5 - Math.random());
        const selectedSkills = shuffledSkills.slice(0, numSkills);
        
        // Assign skills to job
        for (const skill of selectedSkills) {
          await db()
            .insert(jobSkills)
            .values({
              jobId: job.id,
              skillId: skill.id
            })
            .onConflictDoNothing(); // Skip if already exists
        }
      }
      
      console.log('Successfully assigned skills to jobs');
    } else {
      console.log('Job skills already exist, skipping assignment');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error assigning skills to jobs:', error);
    return { success: false, error };
  }
} 