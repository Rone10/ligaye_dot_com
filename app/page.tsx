import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { generateWebSiteSchema, generateOrganizationSchema, generateLocalBusinessSchema } from '@/lib/seo/structured-data';
import StructuredData from '@/components/StructuredData';
import { generateSEOMetadata } from '@/lib/seo/metadata';
import { getCachedUser } from '@/lib/supabase/server';
import IndeedSearch from './_components/IndeedSearch';

import { db } from '@/lib/db';
import { employerProfiles, jobs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import CompanyMarquee from './_components/CompanyMarquee';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: "Job Search | Ligaye",
    description: "Find your dream job or hire top talent in The Gambia. Ligaye.com connects job seekers with employers across all industries.",
    keywords: [
      'jobs in Gambia',
      'Gambian jobs',
      'employment Gambia',
      'careers Gambia',
      'job vacancies Gambia',
      'hire in Gambia',
      'Gambia job board',
      'work in Gambia',
      'Banjul jobs',
      'Serrekunda jobs',
      'job search Gambia',
      'post jobs Gambia'
    ],
  });
}

export default async function LandingPage() {
  const user = await getCachedUser();

  // Fetch companies with active jobs for the marquee
  const companies = await db()
    .select({
      name: employerProfiles.companyName,
      logoUrl: employerProfiles.companyLogoUrl,
    })
    .from(jobs)
    .innerJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .where(eq(jobs.status, 'ACTIVE'))
    .groupBy(employerProfiles.id, employerProfiles.companyName, employerProfiles.companyLogoUrl)
    .limit(20);

  const websiteSchema = generateWebSiteSchema();
  const organizationSchema = generateOrganizationSchema();
  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <>
      <StructuredData data={websiteSchema} />
      <StructuredData data={organizationSchema} />
      <StructuredData data={localBusinessSchema} />
      <Navbar user={user} />
      <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
        <main className="flex-grow flex flex-col items-center pt-16 pb-12 px-4">
          {/* Logo Section */}
          {/* Hero Text Section */}
          <div className="mb-8 text-center animate-appear">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Where Talent Meets <span className="text-primary">Opportunity</span>
            </h1>
          </div>

          {/* Search Section */}
          <div className="w-full max-w-5xl mb-8">
            <IndeedSearch />
          </div>

          {/* Company Marquee */}
          <div className="w-full max-w-5xl mb-12">
            <CompanyMarquee companies={companies} />
          </div>




        </main>
        <Footer />
      </div>
    </>
  );
}