import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MapPinIcon, BriefcaseIcon, ClockIcon, Building2, ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import { jobs, employerProfiles, locations } from '@/lib/db/schema';
import { eq, and, or, gte, isNull, desc, sql } from 'drizzle-orm';

interface TopJob {
  id: string;
  title: string;
  companyName: string | null;
  companyLogoUrl: string | null;
  locationName: string | null;
  workLocation: string;
  jobType: string;
  salaryRangeMin: number | null;
  salaryRangeMax: number | null;
  salaryCurrency: string | null;
  salaryFrequency: string | null;
  salaryDisplayType: string | null;
  publishedAt: Date | null;
  slug: string | null;
}

function formatSalaryDisplay(job: TopJob): string {
  if (!job.salaryDisplayType || job.salaryDisplayType === 'NEGOTIABLE') {
    return 'Negotiable';
  }

  const currency = job.salaryCurrency || 'GMD';
  const frequency = job.salaryFrequency || 'YEAR';
  const min = job.salaryRangeMin;
  const max = job.salaryRangeMax;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const frequencyMap: Record<string, string> = {
    HOUR: '/hr',
    DAY: '/day',
    WEEK: '/wk',
    MONTH: '/mo',
    YEAR: '/yr',
  };

  const freqSuffix = frequencyMap[frequency] || '';

  switch (job.salaryDisplayType) {
    case 'RANGE':
      if (min && max) {
        return `${formatAmount(min)} - ${formatAmount(max)}${freqSuffix}`;
      }
      return 'Negotiable';
    case 'FIXED':
      if (min) {
        return `${formatAmount(min)}${freqSuffix}`;
      }
      return 'Negotiable';
    case 'STARTING_AMOUNT':
      if (min) {
        return `From ${formatAmount(min)}${freqSuffix}`;
      }
      return 'Negotiable';
    case 'MAXIMUM_AMOUNT':
      if (max) {
        return `Up to ${formatAmount(max)}${freqSuffix}`;
      }
      return 'Negotiable';
    default:
      return 'Negotiable';
  }
}

async function getTopJobs(): Promise<TopJob[]> {
  const topJobs = await db()
    .select({
      id: jobs.id,
      title: jobs.title,
      companyName: employerProfiles.companyName,
      companyLogoUrl: employerProfiles.companyLogoUrl,
      locationName: locations.city,
      workLocation: jobs.workLocation,
      jobType: jobs.jobType,
      salaryRangeMin: jobs.salaryRangeMin,
      salaryRangeMax: jobs.salaryRangeMax,
      salaryCurrency: jobs.salaryCurrency,
      salaryFrequency: jobs.salaryFrequency,
      salaryDisplayType: jobs.salaryDisplayType,
      publishedAt: jobs.publishedAt,
      slug: jobs.slug,
    })
    .from(jobs)
    .leftJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .leftJoin(locations, eq(jobs.locationId, locations.id))
    .where(
      and(
        eq(jobs.status, 'ACTIVE'),
        or(
          isNull(jobs.expiresAt),
          gte(jobs.expiresAt, new Date())
        )
      )
    )
    .orderBy(desc(sql`coalesce(${jobs.publishedAt}, ${jobs.createdAt})`))
    .limit(6);

  return topJobs as TopJob[];
}

export default async function TopJobsSection() {
  const topJobs = await getTopJobs();

  if (topJobs.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12">
      {/* Section Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
          Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Job Opportunities</span>
        </h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover the latest job openings from leading employers in Gambia
        </p>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {topJobs.map((job) => {
          const companyInitial = job.companyName ? job.companyName.charAt(0).toUpperCase() : 'C';
          const salaryDisplay = formatSalaryDisplay(job);
          const publishedDate = job.publishedAt
            ? new Date(job.publishedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })
            : 'Recently';

          return (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="group bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Company Logo and Info */}
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center font-bold text-lg shadow-sm border border-border"
                  style={{
                    backgroundColor: job.companyLogoUrl ? '#ffffff' : 'hsl(var(--muted))',
                    color: job.companyLogoUrl ? 'inherit' : 'hsl(var(--muted-foreground))'
                  }}
                >
                  {job.companyLogoUrl ? (
                    <Image
                      src={job.companyLogoUrl}
                      alt={`${job.companyName || 'Company'} logo`}
                      width={48}
                      height={48}
                      className="object-contain p-1"
                    />
                  ) : (
                    <span>{companyInitial}</span>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-lg font-bold text-card-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {job.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="truncate">{job.companyName}</span>
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40 dark:border-blue-400/50">
                  <BriefcaseIcon className="w-3 h-3 mr-1" />
                  {job.workLocation === 'REMOTE' ? 'Remote' : job.workLocation === 'HYBRID' ? 'Hybrid' : 'On-site'}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/40 dark:border-green-400/50">
                  <ClockIcon className="w-3 h-3 mr-1" />
                  {job.jobType.replace(/_/g, ' ')}
                </span>
                {job.locationName && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40 dark:border-purple-400/50">
                    <MapPinIcon className="w-3 h-3 mr-1" />
                    {job.locationName}
                  </span>
                )}
              </div>

              {/* Salary and Date */}
              <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                <div className="font-bold text-card-foreground text-sm">
                  {salaryDisplay}
                </div>
                <div className="text-xs text-muted-foreground">
                  {publishedDate}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* View All Jobs Button */}
      <div className="text-center">
        <Link href="/jobs">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold text-base shadow-sm transition-all hover:shadow-md group">
            View All Jobs
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
