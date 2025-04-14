export type SavedJob = {
  savedJob: {
    id: string
    userId: string
    createdAt: Date
    deleted: boolean
  }
  job: {
    id: string
    title: string
    workLocation: string
    jobType: string
    experienceLevel: string | null
    publishedAt: Date
    expiresAt: Date
    status: string
    salaryCurrency: string
    salaryRangeMin: number | null
    salaryRangeMax: number | null
    salaryFrequency: string | null
    salaryDisplayType: string | null
  }
  employer: {
    id: string
    companyName: string
    companyLogoUrl: string | null
  }
} 