import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { jobs, employerProfiles, locations, profiles, applications } from "@/lib/db/schema";
import { eq, sql, and, or, like, desc, asc, gte, lte, inArray } from "drizzle-orm";

export type JobStatus = "DRAFT" | "PENDING_PAYMENT" | "ACTIVE" | "EXPIRED" | "FILLED" | "DELETED";

interface JobsQueryParams {
  status?: string;
  search?: string;
  location?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const getJobsStats = unstable_cache(
  async () => {
    const database = await db();
    
    const stats = await database
      .select({
        status: jobs.status,
        count: sql<number>`count(*)::int`,
      })
      .from(jobs)
      .groupBy(jobs.status);

    const result = {
      total: 0,
      active: 0,
      pendingPayment: 0,
      draft: 0,
      expired: 0,
      filled: 0,
      deleted: 0,
    };

    stats.forEach((stat) => {
      const count = Number(stat.count);
      result.total += count;
      
      switch (stat.status) {
        case "ACTIVE":
          result.active = count;
          break;
        case "PENDING_PAYMENT":
          result.pendingPayment = count;
          break;
        case "DRAFT":
          result.draft = count;
          break;
        case "EXPIRED":
          result.expired = count;
          break;
        case "FILLED":
          result.filled = count;
          break;
        case "DELETED":
          result.deleted = count;
          break;
      }
    });

    return result;
  },
  ["admin-jobs-stats"],
  {
    revalidate: 60, // Revalidate every minute
    tags: ["admin-jobs-stats"],
  }
);

export const getAdminJobs = unstable_cache(
  async ({
    status,
    search,
    location,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  }: JobsQueryParams) => {
    const database = await db();
    const offset = (page - 1) * limit;

    const conditions = [];

    if (status && status !== "all") {
      conditions.push(eq(jobs.status, status as JobStatus));
    }

    if (search) {
      conditions.push(
        or(
          like(jobs.title, `%${search}%`),
          like(jobs.description, `%${search}%`)
        )
      );
    }

    if (location) {
      conditions.push(eq(jobs.locationId, location));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await database
      .select({ count: sql<number>`count(*)::int` })
      .from(jobs)
      .where(whereClause);

    const totalCount = Number(countResult[0]?.count || 0);

    // Get jobs with related data
    let orderByClause;
    if (sortBy === "company") {
      orderByClause = sortOrder === "asc" ? asc(employerProfiles.companyName) : desc(employerProfiles.companyName);
    } else if (sortBy === "location") {
      orderByClause = sortOrder === "asc" ? asc(locations.city) : desc(locations.city);
    } else {
      // Default to createdAt if sortBy is not a valid column
      orderByClause = sortOrder === "asc" ? asc(jobs.createdAt) : desc(jobs.createdAt);
    }

    const jobsData = await database
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        status: jobs.status,
        createdAt: jobs.createdAt,
        updatedAt: jobs.updatedAt,
        expiresAt: jobs.expiresAt,
        workLocation: jobs.workLocation,
        jobType: jobs.jobType,
        experienceLevel: jobs.experienceLevel,
        salaryMin: jobs.salaryRangeMin,
        salaryMax: jobs.salaryRangeMax,
        salaryCurrency: jobs.salaryCurrency,
        salaryFrequency: jobs.salaryFrequency,
        applicationDeadline: jobs.applicationDeadline,
        employerId: employerProfiles.id,
        companyName: employerProfiles.companyName,
        companyLogoUrl: employerProfiles.companyLogoUrl,
        website: employerProfiles.website,
        userId: profiles.id,
        userFullName: profiles.fullName,
        locationId: locations.id,
        locationCity: locations.city,
        locationDistrict: locations.district,
        locationRegion: locations.region,
      })
      .from(jobs)
      .leftJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
      .leftJoin(profiles, eq(employerProfiles.profileId, profiles.id))
      .leftJoin(locations, eq(jobs.locationId, locations.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // Get application counts
    const jobIds = jobsData.map(job => job.id);
    const applicationCounts = jobIds.length > 0 
      ? await database
          .select({
            jobId: applications.jobId,
            count: sql<number>`count(*)::int`,
          })
          .from(applications)
          .where(inArray(applications.jobId, jobIds.length > 0 ? jobIds : ['00000000-0000-0000-0000-000000000000']))
          .groupBy(applications.jobId)
      : [];

    const applicationCountMap = new Map(
      applicationCounts.map(item => [item.jobId, Number(item.count)])
    );

    const jobsWithCounts = jobsData.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      status: job.status,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      expiresAt: job.expiresAt,
      workLocation: job.workLocation,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryCurrency: job.salaryCurrency,
      salaryFrequency: job.salaryFrequency,
      applicationDeadline: job.applicationDeadline,
      applicationCount: applicationCountMap.get(job.id) || 0,
      employer: job.companyName ? {
        id: job.employerId,
        companyName: job.companyName,
        companyLogoUrl: job.companyLogoUrl,
        website: job.website,
        user: job.userFullName ? {
          id: job.userId,
          fullName: job.userFullName,
        } : null,
      } : null,
      location: job.locationId ? {
        id: job.locationId,
        city: job.locationCity,
        district: job.locationDistrict,
        region: job.locationRegion || '',
      } : null,
    }));

    return {
      jobs: jobsWithCounts,
      totalCount,
    };
  },
  ["admin-jobs-list"],
  {
    revalidate: 60,
    tags: ["admin-jobs"],
  }
);

export const getJobById = unstable_cache(
  async (jobId: string) => {
    const database = await db();

    const jobData = await database
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        educationRequirements: jobs.educationRequirements,
        experienceRequirements: jobs.experienceRequirements,
        benefits: jobs.benefits,
        status: jobs.status,
        createdAt: jobs.createdAt,
        updatedAt: jobs.updatedAt,
        expiresAt: jobs.expiresAt,
        workLocation: jobs.workLocation,
        jobType: jobs.jobType,
        experienceLevel: jobs.experienceLevel,
        salaryMin: jobs.salaryRangeMin,
        salaryMax: jobs.salaryRangeMax,
        salaryCurrency: jobs.salaryCurrency,
        salaryFrequency: jobs.salaryFrequency,
        salaryDisplayType: jobs.salaryDisplayType,
        applicationDeadline: jobs.applicationDeadline,
        applicationEmail: jobs.applicationEmail,
        applicationUrl: jobs.applicationUrl,
        applicationInstructions: jobs.applicationInstructions,
        employerId: employerProfiles.id,
        companyName: employerProfiles.companyName,
        companyLogoUrl: employerProfiles.companyLogoUrl,
        website: employerProfiles.website,
        companyDescription: employerProfiles.companyDescription,
        userId: profiles.id,
        userFullName: profiles.fullName,
        locationId: locations.id,
        locationCity: locations.city,
        locationDistrict: locations.district,
        locationRegion: locations.region,
      })
      .from(jobs)
      .leftJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
      .leftJoin(profiles, eq(employerProfiles.profileId, profiles.id))
      .leftJoin(locations, eq(jobs.locationId, locations.id))
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!jobData[0]) {
      return null;
    }

    // Get application count
    const applicationCount = await database
      .select({ count: sql<number>`count(*)::int` })
      .from(applications)
      .where(eq(applications.jobId, jobId));

    // Get skills
    const jobSkills = await database
      .select({
        id: sql<string>`s.id`,
        name: sql<string>`s.name`,
      })
      .from(sql`job_skills js`)
      .innerJoin(sql`skills s`, sql`js.skill_id = s.id`)
      .where(sql`js.job_id = ${jobId}`);

    const job = jobData[0];
    return {
      id: job.id,
      title: job.title,
      description: job.description,
      educationRequirements: job.educationRequirements,
      experienceRequirements: job.experienceRequirements,
      benefits: job.benefits,
      status: job.status,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      expiresAt: job.expiresAt,
      workLocation: job.workLocation,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryCurrency: job.salaryCurrency,
      salaryFrequency: job.salaryFrequency,
      salaryDisplayType: job.salaryDisplayType,
      applicationDeadline: job.applicationDeadline,
      applicationEmail: job.applicationEmail,
      applicationUrl: job.applicationUrl,
      applicationInstructions: job.applicationInstructions,
      employer: job.companyName ? {
        id: job.employerId,
        companyName: job.companyName,
        companyLogoUrl: job.companyLogoUrl,
        website: job.website,
        companyDescription: job.companyDescription,
        user: job.userFullName ? {
          id: job.userId,
          fullName: job.userFullName,
        } : null,
      } : null,
      location: job.locationId ? {
        id: job.locationId,
        city: job.locationCity,
        district: job.locationDistrict,
        region: job.locationRegion || '',
      } : null,
      applicationCount: Number(applicationCount[0]?.count || 0),
      skills: jobSkills,
    };
  },
  ["admin-job-detail"],
  {
    revalidate: 60,
    tags: ["admin-job-detail"],
  }
);

export const getLocations = unstable_cache(
  async () => {
    const database = await db();
    
    return await database
      .select({
        id: locations.id,
        city: locations.city,
        district: locations.district,
        region: locations.region,
      })
      .from(locations)
      .orderBy(asc(locations.city));
  },
  ["locations"],
  {
    revalidate: 3600, // Revalidate every hour
    tags: ["locations"],
  }
);