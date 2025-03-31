'use server'

import { db } from '@/lib/db';
import { 
  applications,
  jobs,
  employerProfiles,
  profiles,
  skills,
  jobSkills,
  locations,
  jobTypeEnum,
  workLocationEnum,
  experienceLevelEnum
} from '@/lib/db/schema';
import { eq, and, or, desc, asc, sql, gt, lt, between, ilike, inArray } from 'drizzle-orm';
import { SQL } from 'drizzle-orm/sql';

export interface JobFilter {
  search?: string;
  jobTypes?: string[];
  workLocations?: string[];
  experienceLevels?: string[];
  salaryMin?: number;
  salaryMax?: number;
  postedAfter?: Date;
}

export interface JobSortOption {
  field: 'createdAt' | 'salaryRangeMin' | 'title';
  direction: 'asc' | 'desc';
}

export async function getJobs({
  page = 1,
  pageSize = 10,
  filters = {},
  sort = { field: 'createdAt', direction: 'desc' }
}: {
  page?: number;
  pageSize?: number;
  filters?: JobFilter;
  sort?: JobSortOption;
}) {
  try {
    // Calculate offset based on page and pageSize
    const offset = (page - 1) * pageSize;
    
    // Build base query conditions
    const conditions: SQL<unknown>[] = [
      eq(jobs.isActive, true),
      eq(jobs.deleted, false)
    ];
    
    // Add filter conditions
    if (filters.search) {
      conditions.push(
        sql`${jobs.title} ILIKE ${'%' + filters.search + '%'} OR ${jobs.description} ILIKE ${'%' + filters.search + '%'}`
      );
    }

    if (filters.jobTypes && filters.jobTypes.length > 0) {
      // Filter for valid job types
      const validTypes = filters.jobTypes.filter(type => 
        Object.values(jobTypeEnum.enumValues).includes(type as any)
      );
      
      if (validTypes.length > 0) {
        conditions.push(inArray(jobs.jobType, validTypes as any[]));
      }
    }

    if (filters.workLocations && filters.workLocations.length > 0) {
      // Filter for valid work locations
      const validLocations = filters.workLocations.filter(location => 
        Object.values(workLocationEnum.enumValues).includes(location as any)
      );
      
      if (validLocations.length > 0) {
        conditions.push(inArray(jobs.workLocation, validLocations as any[]));
      }
    }

    if (filters.experienceLevels && filters.experienceLevels.length > 0) {
      // Filter for valid experience levels
      const validLevels = filters.experienceLevels.filter(level => 
        Object.values(experienceLevelEnum.enumValues).includes(level as any)
      );
      
      if (validLevels.length > 0) {
        conditions.push(inArray(jobs.experienceLevel, validLevels as any[]));
      }
    }

    if (filters.salaryMin) {
      conditions.push(gt(jobs.salaryRangeMin, filters.salaryMin));
    }

    if (filters.salaryMax) {
      conditions.push(lt(jobs.salaryRangeMax, filters.salaryMax));
    }

    if (filters.postedAfter) {
      conditions.push(gt(jobs.createdAt, filters.postedAfter));
    }

    // Count total matching jobs for pagination
    const countResult = await db()
      .select({ count: sql<number>`count(*)` })
      .from(jobs)
      .innerJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
      .where(and(...conditions));

    const totalJobs = Number(countResult[0]?.count || 0);

    // Build sort options
    let sortOptions;
    if (sort.field === 'createdAt') {
      sortOptions = sort.direction === 'desc' ? desc(jobs.createdAt) : asc(jobs.createdAt);
    } else if (sort.field === 'salaryRangeMin') {
      sortOptions = sort.direction === 'desc' ? desc(jobs.salaryRangeMin) : asc(jobs.salaryRangeMin);
    } else if (sort.field === 'title') {
      sortOptions = sort.direction === 'desc' ? desc(jobs.title) : asc(jobs.title);
    } else {
      sortOptions = desc(jobs.createdAt); // Default sort
    }

    // Fetch jobs with pagination and sorting
    const jobResults = await db()
      .select({
        job: {
          id: jobs.id,
          title: jobs.title,
          description: jobs.description,
          jobType: jobs.jobType,
          workLocation: jobs.workLocation,
          experienceLevel: jobs.experienceLevel,
          salaryRangeMin: jobs.salaryRangeMin,
          salaryRangeMax: jobs.salaryRangeMax,
          salaryCurrency: jobs.salaryCurrency,
          salaryFrequency: jobs.salaryFrequency,
          createdAt: jobs.createdAt,
        },
        company: {
          name: employerProfiles.companyName,
        },
        location: {
          region: locations.region,
          town: locations.town,
          city: locations.city,
        }
      })
      .from(jobs)
      .innerJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
      .leftJoin(locations, eq(jobs.locationId, locations.id))
      .where(and(...conditions))
      .orderBy(sortOptions)
      .limit(pageSize)
      .offset(offset);
    
    // Fetch skills for each job
    const jobsWithSkills = await Promise.all(
      jobResults.map(async (jobResult: any) => {
        const jobSkillsResults = await db()
          .select({
            skill: {
              name: skills.name
            }
          })
          .from(jobSkills)
          .innerJoin(skills, eq(jobSkills.skillId, skills.id))
          .where(eq(jobSkills.jobId, jobResult.job.id));
        
        const skillNames = jobSkillsResults.map((result: any) => result.skill.name);
        
        // Format location
        const locationString = [
          jobResult.location?.city,
          jobResult.location?.town,
          jobResult.location?.region
        ]
          .filter(Boolean)
          .join(', ');
        
        return {
          id: jobResult.job.id,
          title: jobResult.job.title,
          company: jobResult.company.name,
          location: locationString || 'Remote',
          type: jobResult.job.jobType,
          workLocation: jobResult.job.workLocation,
          experienceLevel: jobResult.job.experienceLevel,
          description: jobResult.job.description,
          skills: skillNames,
          salaryRange: {
            min: jobResult.job.salaryRangeMin || 0,
            max: jobResult.job.salaryRangeMax || 0,
            currency: jobResult.job.salaryCurrency,
            frequency: jobResult.job.salaryFrequency
          },
          postedDate: jobResult.job.createdAt
        };
      })
    );

    return {
      jobs: jobsWithSkills,
      pagination: {
        total: totalJobs,
        pageCount: Math.ceil(totalJobs / pageSize),
        page,
        pageSize
      }
    };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return {
      jobs: [],
      pagination: {
        total: 0,
        pageCount: 0,
        page,
        pageSize
      }
    };
  }
}

export async function getJobById(id: string) {
  try {
    // Get job details
    const jobResult = await db()
      .select({
        job: {
          id: jobs.id,
          title: jobs.title,
          description: jobs.description,
          jobType: jobs.jobType,
          workLocation: jobs.workLocation,
          experienceLevel: jobs.experienceLevel,
          salaryRangeMin: jobs.salaryRangeMin,
          salaryRangeMax: jobs.salaryRangeMax,
          salaryCurrency: jobs.salaryCurrency,
          salaryFrequency: jobs.salaryFrequency,
          createdAt: jobs.createdAt,
          educationRequirements: jobs.educationRequirements,
          experienceRequirements: jobs.experienceRequirements,
          benefits: jobs.benefits,
          applicationDeadline: jobs.applicationDeadline,
        },
        company: {
          id: employerProfiles.id,
          name: employerProfiles.companyName,
          description: employerProfiles.companyDescription,
          website: employerProfiles.website,
          location: employerProfiles.location,
        },
        location: {
          region: locations.region,
          town: locations.town,
          city: locations.city,
        }
      })
      .from(jobs)
      .innerJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
      .leftJoin(locations, eq(jobs.locationId, locations.id))
      .where(
        and(
          eq(jobs.id, id),
          eq(jobs.isActive, true),
          eq(jobs.deleted, false)
        )
      )
      .limit(1);

    if (!jobResult.length) {
      throw new Error('Job not found');
    }

    // Get job skills
    const jobSkillsResults = await db()
      .select({
        skill: {
          name: skills.name
        }
      })
      .from(jobSkills)
      .innerJoin(skills, eq(jobSkills.skillId, skills.id))
      .where(eq(jobSkills.jobId, id));

    const skillNames = jobSkillsResults.map((result: any) => result.skill.name);

    // Format location
    const locationString = [
      jobResult[0].location?.city,
      jobResult[0].location?.town,
      jobResult[0].location?.region
    ]
      .filter(Boolean)
      .join(', ');

    return {
      id: jobResult[0].job.id,
      title: jobResult[0].job.title,
      company: {
        name: jobResult[0].company.name,
        logo: '/company-logo.png', // Replace with actual logo path
        description: jobResult[0].company.description || '',
        website: jobResult[0].company.website || '',
        linkedin: '', // Add to schema if needed
      },
      location: locationString || 'Remote',
      type: jobResult[0].job.jobType,
      workLocation: jobResult[0].job.workLocation,
      experienceLevel: jobResult[0].job.experienceLevel,
      description: jobResult[0].job.description,
      skills: skillNames,
      salaryRange: {
        min: jobResult[0].job.salaryRangeMin || 0,
        max: jobResult[0].job.salaryRangeMax || 0,
        currency: jobResult[0].job.salaryCurrency,
        frequency: jobResult[0].job.salaryFrequency
      },
      postedDate: jobResult[0].job.createdAt,
      responsibilities: [], // Extract from description or add to schema
      requirements: jobResult[0].job.experienceRequirements || [],
      education: Array.isArray(jobResult[0].job.educationRequirements) 
        ? jobResult[0].job.educationRequirements.join(', ')
        : '',
    };
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    throw new Error('Job not found');
  }
}

export async function getSimilarJobs(jobId: string, limit = 2) {
  try {
    // Get current job details to use for finding similar jobs
    const currentJob = await db()
      .select({
        jobType: jobs.jobType,
        experienceLevel: jobs.experienceLevel,
      })
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!currentJob.length) {
      return [];
    }

    // Build query for similar jobs based on job type, experience level, and skills
    const similarJobResults = await db()
      .select({
        job: {
          id: jobs.id,
          title: jobs.title,
          description: jobs.description,
          jobType: jobs.jobType,
          workLocation: jobs.workLocation,
          experienceLevel: jobs.experienceLevel,
          salaryRangeMin: jobs.salaryRangeMin,
          salaryRangeMax: jobs.salaryRangeMax,
          salaryCurrency: jobs.salaryCurrency,
          salaryFrequency: jobs.salaryFrequency,
          createdAt: jobs.createdAt,
        },
        company: {
          name: employerProfiles.companyName,
        },
        location: {
          region: locations.region,
          town: locations.town,
          city: locations.city,
        }
      })
      .from(jobs)
      .innerJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
      .leftJoin(locations, eq(jobs.locationId, locations.id))
      .where(
        and(
          eq(jobs.isActive, true),
          eq(jobs.deleted, false),
          // Not the same job
          sql`${jobs.id} != ${jobId}`,
          // Similar job type or experience level
          or(
            eq(jobs.jobType, currentJob[0].jobType),
            eq(jobs.experienceLevel, currentJob[0].experienceLevel)
          )
        )
      )
      .orderBy(desc(jobs.createdAt))
      .limit(limit);

    // Format the similar jobs like the main job list
    const similarJobsWithSkills = await Promise.all(
      similarJobResults.map(async (jobResult: any) => {
        const jobSkillsResults = await db()
          .select({
            skill: {
              name: skills.name
            }
          })
          .from(jobSkills)
          .innerJoin(skills, eq(jobSkills.skillId, skills.id))
          .where(eq(jobSkills.jobId, jobResult.job.id));
        
        const skillNames = jobSkillsResults.map((result: any) => result.skill.name);
        
        // Format location
        const locationString = [
          jobResult.location?.city,
          jobResult.location?.town,
          jobResult.location?.region
        ]
          .filter(Boolean)
          .join(', ');
        
        return {
          id: jobResult.job.id,
          title: jobResult.job.title,
          company: jobResult.company.name,
          location: locationString || 'Remote',
          type: jobResult.job.jobType,
          workLocation: jobResult.job.workLocation,
          experienceLevel: jobResult.job.experienceLevel,
          description: jobResult.job.description,
          skills: skillNames,
          salaryRange: {
            min: jobResult.job.salaryRangeMin || 0,
            max: jobResult.job.salaryRangeMax || 0,
            currency: jobResult.job.salaryCurrency,
            frequency: jobResult.job.salaryFrequency
          },
          postedDate: jobResult.job.createdAt
        };
      })
    );

    return similarJobsWithSkills;
  } catch (error) {
    console.error('Error fetching similar jobs:', error);
    return [];
  }
}

// Create job with skills
export async function createJob(jobData: any, skillIds: string[]) {
  // Start a transaction
  return await db().transaction(async (tx) => {
    // Create the job
    const newJob = await tx
      .insert(jobs)
      .values(jobData)
      .returning();
      
    const jobId = newJob[0].id;
    
    // Add skills
    if (skillIds && skillIds.length > 0) {
      for (const skillId of skillIds) {
        await tx
          .insert(jobSkills)
          .values({
            jobId,
            skillId
          })
          .onConflictDoNothing();
      }
    }
    
    return newJob[0];
  });
}

// Get job with skills
export async function getJobWithSkills(jobId: string) {
  // Get the job
  const job = await db()
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);
    
  if (!job.length) {
    throw new Error('Job not found');
  }
  
  // Get skills
  const jobSkillsData = await db()
    .select({
      skill: {
        id: skills.id,
        name: skills.name
      }
    })
    .from(jobSkills)
    .innerJoin(skills, eq(jobSkills.skillId, skills.id))
    .where(eq(jobSkills.jobId, jobId));
    
  const skillsList = jobSkillsData.map(item => item.skill);
  
  return {
    ...job[0],
    skills: skillsList
  };
}

// Update job skills
export async function updateJobSkills(jobId: string, skillIds: string[]) {
  return await db().transaction(async (tx) => {
    // Delete existing skills
    await tx
      .delete(jobSkills)
      .where(eq(jobSkills.jobId, jobId));
      
    // Add new skills
    if (skillIds && skillIds.length > 0) {
      for (const skillId of skillIds) {
        await tx
          .insert(jobSkills)
          .values({
            jobId,
            skillId
          })
          .onConflictDoNothing();
      }
    }
    
    return { success: true };
  });
}