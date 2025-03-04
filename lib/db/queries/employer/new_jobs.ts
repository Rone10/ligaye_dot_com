"use server"

import { db } from "@/lib/db/db"
import { getUser } from "@/lib/supabase/server"
import { jobs, jobSkills, jobIndustries } from "@/lib/db/schema"

export type JobInsertResult = {
  success: boolean;
  jobId?: string;
  error?: string;
}

/**
 * Creates a new job in the database
 * @param jobData Job data to insert
 * @param profileId ID of the profile (employerId in the jobs table)
 * @param companyId ID of the employer company profile
 * @returns Result of the job creation operation
 */
export async function insertJob(jobData: any, profileId: string, companyId: string): Promise<JobInsertResult> {
  try {
    if (!profileId || !companyId) {
      return {
        success: false,
        error: 'Invalid profile ID or company ID'
      }
    }

    // Ensure skillIds and industryIds are always arrays
    const skillIds = Array.isArray(jobData.skillIds) ? jobData.skillIds : [];
    const industryIds = Array.isArray(jobData.industryIds) ? jobData.industryIds : [];
    
    // Remove skillIds and industryIds from the main job data
    // as they'll be handled separately in the related tables
    const { skillIds: _, industryIds: __, ...jobDataWithoutRelations } = jobData;

    // Map for experience level enum values
    const experienceLevelMap: Record<string, string> = {
      'ENTRY': 'Entry',
      'JUNIOR': 'Junior',
      'MID_LEVEL': 'Mid-Level',
      'SENIOR': 'Senior',
      'DIRECTOR': 'Director',
      'EXECUTIVE': 'Executive'
    };

    // Map for application method enum values
    const applicationMethodMap: Record<string, string> = {
      'EMAIL': 'EMAIL',
      'WEBSITE': 'WEBSITE',
      'PHONE': 'PHONE',
      'IN_PERSON': 'IN_PERSON',
      'PLATFORM': 'WEBSITE', // Map PLATFORM to WEBSITE as it's the closest match
    };

    // Prepare job data for insertion
    const formattedJobData: any = {
      title: jobDataWithoutRelations.title,
      description: jobDataWithoutRelations.description,
      employerId: profileId, // Use profileId for employerId
      companyId: companyId, // Use companyId for companyId
      // Add any other required fields from the schema
    };

    // Conditionally add fields that might be optional
    if (jobDataWithoutRelations.numberOfOpenings) formattedJobData.numberOfOpenings = jobDataWithoutRelations.numberOfOpenings;
    if (jobDataWithoutRelations.jobLanguage) formattedJobData.jobLanguage = jobDataWithoutRelations.jobLanguage;
    
    // Only add locationId if it's a valid UUID and not the zero placeholder
    if (jobDataWithoutRelations.locationId && 
        jobDataWithoutRelations.locationId !== '00000000-0000-0000-0000-000000000000') {
      formattedJobData.locationId = jobDataWithoutRelations.locationId;
    }
    
    if (jobDataWithoutRelations.displayAddress !== undefined) formattedJobData.displayAddress = jobDataWithoutRelations.displayAddress;
    
    // Ensure arrays are properly handled before assigning
    if (jobDataWithoutRelations.languageRequirements) {
      formattedJobData.languageRequirements = Array.isArray(jobDataWithoutRelations.languageRequirements) 
        ? jobDataWithoutRelations.languageRequirements 
        : [];
    }
    
    if (jobDataWithoutRelations.languageTrainingProvided !== undefined) formattedJobData.languageTrainingProvided = jobDataWithoutRelations.languageTrainingProvided;
    
    // Ensure jobType is an array
    if (jobDataWithoutRelations.jobType) {
      formattedJobData.jobType = Array.isArray(jobDataWithoutRelations.jobType) 
        ? jobDataWithoutRelations.jobType 
        : [];
    }
    
    if (jobDataWithoutRelations.workLocation) formattedJobData.workLocation = jobDataWithoutRelations.workLocation;
    if (jobDataWithoutRelations.expectedHours) formattedJobData.expectedHours = jobDataWithoutRelations.expectedHours;
    if (jobDataWithoutRelations.hoursType) formattedJobData.hoursType = jobDataWithoutRelations.hoursType;
    if (jobDataWithoutRelations.contractLength) formattedJobData.contractLength = jobDataWithoutRelations.contractLength;
    if (jobDataWithoutRelations.contractPeriod) formattedJobData.contractPeriod = jobDataWithoutRelations.contractPeriod;
    
    // Ensure schedule is an array
    if (jobDataWithoutRelations.schedule) {
      formattedJobData.schedule = Array.isArray(jobDataWithoutRelations.schedule) 
        ? jobDataWithoutRelations.schedule 
        : [];
    }
    
    if (jobDataWithoutRelations.plannedStartDate) formattedJobData.plannedStartDate = new Date(jobDataWithoutRelations.plannedStartDate);
    if (jobDataWithoutRelations.salaryRangeMin) formattedJobData.salaryRangeMin = jobDataWithoutRelations.salaryRangeMin;
    if (jobDataWithoutRelations.salaryRangeMax) formattedJobData.salaryRangeMax = jobDataWithoutRelations.salaryRangeMax;
    if (jobDataWithoutRelations.salaryCurrency) formattedJobData.salaryCurrency = jobDataWithoutRelations.salaryCurrency;
    if (jobDataWithoutRelations.salaryFrequency) formattedJobData.salaryFrequency = jobDataWithoutRelations.salaryFrequency;
    if (jobDataWithoutRelations.salaryDisplayType) formattedJobData.salaryDisplayType = jobDataWithoutRelations.salaryDisplayType;
    
    // Ensure supplementalPay is an array
    if (jobDataWithoutRelations.supplementalPay) {
      formattedJobData.supplementalPay = Array.isArray(jobDataWithoutRelations.supplementalPay) 
        ? jobDataWithoutRelations.supplementalPay 
        : [];
    }
    
    // Ensure benefits is an array
    if (jobDataWithoutRelations.benefits) {
      formattedJobData.benefits = Array.isArray(jobDataWithoutRelations.benefits) 
        ? jobDataWithoutRelations.benefits 
        : [];
    }
    
    // Map experience level to the correct enum value
    if (jobDataWithoutRelations.experienceLevel) {
      const experienceLevelValue = jobDataWithoutRelations.experienceLevel;
      formattedJobData.experienceLevel = experienceLevelMap[experienceLevelValue] || 'Entry'; // Default to 'Entry' if not found
    } else {
      formattedJobData.experienceLevel = 'Entry'; // Default value if missing
    }
    
    // Handle education and experience requirements - ensure they're arrays if present
    if (jobDataWithoutRelations.educationRequirements) {
      formattedJobData.educationRequirements = Array.isArray(jobDataWithoutRelations.educationRequirements) 
        ? jobDataWithoutRelations.educationRequirements 
        : [];
    }
    
    if (jobDataWithoutRelations.experienceRequirements) {
      formattedJobData.experienceRequirements = Array.isArray(jobDataWithoutRelations.experienceRequirements) 
        ? jobDataWithoutRelations.experienceRequirements 
        : [];
    }
    
    // Map application method to the correct enum value
    if (jobDataWithoutRelations.applicationMethod) {
      const applicationMethodValue = jobDataWithoutRelations.applicationMethod;
      formattedJobData.applicationMethod = applicationMethodMap[applicationMethodValue] || 'EMAIL'; // Default to EMAIL if not found
    } else if (formattedJobData.applicationMethod === undefined) {
      formattedJobData.applicationMethod = 'EMAIL'; // Default value if missing
    }
    
    if (jobDataWithoutRelations.applicationInstructions) formattedJobData.applicationInstructions = jobDataWithoutRelations.applicationInstructions;
    if (jobDataWithoutRelations.resumeRequired !== undefined) formattedJobData.resumeRequired = jobDataWithoutRelations.resumeRequired;
    if (jobDataWithoutRelations.allowCandidateContact !== undefined) formattedJobData.allowCandidateContact = jobDataWithoutRelations.allowCandidateContact;
    if (jobDataWithoutRelations.applicationDeadline) formattedJobData.applicationDeadline = new Date(jobDataWithoutRelations.applicationDeadline);
    
    // Add created and updated timestamps
    formattedJobData.createdAt = new Date();
    formattedJobData.updatedAt = new Date();
    
    // Set status to active
    formattedJobData.status = "ACTIVE";

    try {
      // Handle related skills and industries
      const result = await db().transaction(async (tx) => {
        // Insert the job
        const newJob = await tx.insert(jobs).values(formattedJobData).returning({ id: jobs.id });
        const jobId = newJob[0]?.id;

        if (jobId) {
          // Handle skills
          if (skillIds.length > 0) {
            // Insert job skills relations one by one to avoid map issues
            for (const skillId of skillIds) {
              await tx.insert(jobSkills).values({
                jobId,
                skillId,
                createdAt: new Date()
              });
            }
          }

          // Handle industries
          if (industryIds.length > 0) {
            // Insert job industries relations one by one to avoid map issues
            for (const industryId of industryIds) {
              await tx.insert(jobIndustries).values({
                jobId,
                industryId,
                createdAt: new Date()
              });
            }
          }
        }

        return newJob;
      });

      return {
        success: true,
        jobId: result[0]?.id
      };
    } catch (txError) {
      console.error('Transaction error:', txError);
      return {
        success: false,
        error: txError instanceof Error ? txError.message : 'Transaction failed'
      };
    }
  } catch (error) {
    console.error('Error inserting job into database:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}