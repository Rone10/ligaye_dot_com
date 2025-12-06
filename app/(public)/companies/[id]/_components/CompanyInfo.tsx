import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Globe, Users, Briefcase } from 'lucide-react';
import type { EmployerProfile } from '@/lib/db/schema';
import type { Location, Industry } from '@/lib/db/schema';

interface CompanyInfoProps {
  company: EmployerProfile & {
    location: Location | null;
    industry: Industry | null;
  };
}

export default function CompanyInfo({ company }: CompanyInfoProps) {
  const locationDisplay = company.location
    ? `${company.location.city || ''}${company.location.city && company.location.region ? ', ' : ''}${company.location.region || ''}`.trim()
    : company.hqAddressDisplay || 'Location not specified';

  return (
    <Card className="overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)] bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-2xl">
      <CardHeader className="border-b bg-gray-50/50">
        <CardTitle>About {company.companyName}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {company.companyDescription ? (
          <div className="prose max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {company.companyDescription}
            </p>
          </div>
        ) : (
          <p className="text-gray-500 italic">No company description available</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          {company.industry && (
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-primary-blue mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Industry</p>
                <p className="text-base font-semibold">{company.industry.name}</p>
              </div>
            </div>
          )}
          
          {locationDisplay && locationDisplay !== 'Location not specified' && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary-blue mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-base font-semibold">{locationDisplay}</p>
              </div>
            </div>
          )}
          
          {company.companySize && (
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary-blue mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Company Size</p>
                <p className="text-base font-semibold">{company.companySize} employees</p>
              </div>
            </div>
          )}
          
          {company.website && (
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-primary-blue mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Website</p>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-semibold text-primary-blue hover:text-primary-blue-light transition-colors break-all"
                >
                  {company.website}
                </a>
              </div>
            </div>
          )}
        </div>
        
        {company.website && (
          <div className="pt-4 border-t">
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Globe className="h-4 w-4 mr-2" />
              Visit Company Website
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

