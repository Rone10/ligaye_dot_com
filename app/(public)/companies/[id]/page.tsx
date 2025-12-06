import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { generateSEOMetadata } from '@/lib/seo/metadata';
import { getCompanyProfileById, getCompanyCurrentJobs, getCompanyPastJobs } from './_queries';
import CompanyHeader from './_components/CompanyHeader';
import CompanyInfo from './_components/CompanyInfo';
import CompanyJobsList from './_components/CompanyJobsList';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  try {
    // First, check if this is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return {
        title: 'Company Not Found | Ligaye',
        description: 'The requested company profile could not be found.',
      };
    }
    
    const company = await getCompanyProfileById(id);
    
    if (!company) {
      return {
        title: 'Company Not Found | Ligaye',
        description: 'The requested company profile could not be found.',
      };
    }
    
    const locationText = company.location
      ? `${company.location.city || ''}${company.location.city && company.location.region ? ', ' : ''}${company.location.region || ''}`.trim()
      : 'Gambia';
    
    const description = company.companyDescription
      ? `${company.companyDescription.slice(0, 150)}...`
      : `View ${company.companyName}'s profile and job openings in ${locationText}.`;
    
    return generateSEOMetadata({
      title: `${company.companyName} - Company Profile`,
      description,
      path: `/companies/${id}`,
      keywords: [
        company.companyName,
        `${company.companyName} jobs`,
        `${company.companyName} careers`,
        company.industry?.name || '',
        locationText,
        'jobs in Gambia',
      ].filter(Boolean) as string[],
    });
  } catch (error) {
    console.error('Error generating company metadata:', error);
    return {
      title: 'Company Profile | Ligaye',
      description: 'View company profiles and job openings in Gambia.',
    };
  }
}

export default async function CompanyProfilePage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  try {
    // Fetch all data in parallel
    const [company, currentJobs, pastJobs] = await Promise.all([
      getCompanyProfileById(id),
      getCompanyCurrentJobs(id),
      getCompanyPastJobs(id),
    ]);
    
    return (
      <div className="container max-w-7xl py-8 px-4 mx-auto space-y-8">
        {/* Company Header */}
        <CompanyHeader company={company} />
        
        <Separator className="my-6" />
        
        {/* Tabs for different sections */}
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="current-jobs">
              Current Openings ({currentJobs.length})
            </TabsTrigger>
            <TabsTrigger value="past-jobs">
              Past Openings ({pastJobs.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="about">
            <CompanyInfo company={company} />
          </TabsContent>
          
          <TabsContent value="current-jobs">
            <CompanyJobsList
              jobs={currentJobs}
              title="Current Job Openings"
              emptyMessage="No current job openings"
            />
          </TabsContent>
          
          <TabsContent value="past-jobs">
            <CompanyJobsList
              jobs={pastJobs}
              title="Past Job Openings"
              emptyMessage="No past job openings"
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    // If company not found, the query will call notFound()
    notFound();
  }
}

