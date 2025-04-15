'use server'

import { eq, ne, and, or, asc, desc, SQL, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { jobs, employerProfiles, profiles, jobStatusEnum } from '@/lib/db/schema'
import { getUser } from '@/lib/supabase/server'

export interface JobListingFilter {
  status?: string
  searchTerm?: string
  sort?: 'newest' | 'oldest'
}

// Cache options type for Next.js
type CacheOptions = {
  next?: {
    tags?: string[];
    revalidate?: number;
  }
};

// Get employer job listings with optional filtering
export async function getEmployerJobs(filter: JobListingFilter = {}, options?: CacheOptions) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }
    
    // Get employer profile ID
    const employerResult = await db()
      .select({
        employerProfileId: employerProfiles.id
      })
      .from(profiles)
      .innerJoin(
        employerProfiles,
        and(
          eq(profiles.id, employerProfiles.profileId),
          eq(employerProfiles.deleted, false)
        )
      )
      .where(and(
        eq(profiles.userId, user.id),
        eq(profiles.deleted, false)
      ))
      .limit(1)
    
    if (!employerResult.length) {
      return { error: 'Employer profile not found' }
    }
    
    const employerProfileId = employerResult[0].employerProfileId
    
    // Base query condition
    let queryCondition = and(eq(jobs.companyId, employerProfileId))
    
    // Add status filter if provided
    if (filter.status && filter.status !== 'ALL') {
      // Handle special case for 'ACTIVE_EXPIRED' to show both active and expired jobs
      if (filter.status === 'ACTIVE_EXPIRED') {
        queryCondition = and(queryCondition, or(
          eq(jobs.status, 'ACTIVE'),
          eq(jobs.status, 'EXPIRED')
        ))
      } else {
        // Map UI status 'pending' to DB status 'PENDING_PAYMENT'
        const dbStatus = filter.status === 'pending' ? 'PENDING_PAYMENT' : filter.status;
        queryCondition = and(queryCondition, eq(jobs.status, dbStatus as any))
      }
    } else {
      // Default filter to exclude deleted jobs
      queryCondition = and(queryCondition, ne(jobs.status, 'DELETED'))
    }
    
    // Add search term filter if provided
    if (filter.searchTerm) {
      const term = `%${filter.searchTerm}%`
      queryCondition = and(queryCondition, or(
        sql`${jobs.title} ILIKE ${term}`,
        sql`${jobs.description} ILIKE ${term}`
      ))
    }
    
    // Build the query
    const query = db()
      .select({
        id: jobs.id,
        title: jobs.title,
        status: jobs.status,
        jobType: jobs.jobType,
        workLocation: jobs.workLocation,
        experienceLevel: jobs.experienceLevel,
        publishedAt: jobs.publishedAt,
        expiresAt: jobs.expiresAt,
        applicationDeadline: jobs.applicationDeadline,
        createdAt: jobs.createdAt,
        updatedAt: jobs.updatedAt
      })
      .from(jobs)
      .where(queryCondition)
    
    // Apply sorting
    const jobListings = await (filter.sort === 'oldest' 
      ? query.orderBy(asc(jobs.createdAt)) 
      : query.orderBy(desc(jobs.createdAt)))
    
    return { jobListings }
  } catch (error) {
    console.error('Error fetching employer jobs:', error)
    return { error: 'Failed to fetch job listings' }
  }
}

// Get counts of jobs by status for the employer dashboard
export async function getEmployerJobCounts(options?: CacheOptions) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }
    
    // Get employer profile ID
    const employerResult = await db()
      .select({
        employerProfileId: employerProfiles.id
      })
      .from(profiles)
      .innerJoin(
        employerProfiles,
        and(
          eq(profiles.id, employerProfiles.profileId),
          eq(employerProfiles.deleted, false)
        )
      )
      .where(and(
        eq(profiles.userId, user.id),
        eq(profiles.deleted, false)
      ))
      .limit(1)
    
    if (!employerResult.length) {
      return { error: 'Employer profile not found' }
    }
    
    const employerProfileId = employerResult[0].employerProfileId
    
    // Get all jobs for the employer
    const allJobs = await db()
      .select({
        status: jobs.status
      })
      .from(jobs)
      .where(eq(jobs.companyId, employerProfileId))
    
    // Count jobs by status
    const counts = {
      all: allJobs.length,
      draft: allJobs.filter(job => job.status === 'DRAFT').length,
      pending: allJobs.filter(job => job.status === 'PENDING_PAYMENT').length,
      active: allJobs.filter(job => job.status === 'ACTIVE').length,
      expired: allJobs.filter(job => job.status === 'EXPIRED').length,
      filled: allJobs.filter(job => job.status === 'FILLED').length
    }
    
    return { counts }
  } catch (error) {
    console.error('Error fetching employer job counts:', error)
    return { error: 'Failed to fetch job counts' }
  }
} 