import Image from 'next/image';
import { Building2, MapPin, Globe, Users } from 'lucide-react';
import type { EmployerProfile } from '@/lib/db/schema';
import type { Location, Industry } from '@/lib/db/schema';

interface CompanyHeaderProps {
  company: EmployerProfile & {
    location: Location | null;
    industry: Industry | null;
  };
}

export default function CompanyHeader({ company }: CompanyHeaderProps) {
  const companyInitials = company.companyName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const locationDisplay = company.location
    ? `${company.location.city || ''}${company.location.city && company.location.region ? ', ' : ''}${company.location.region || ''}`.trim()
    : company.hqAddressDisplay || 'Location not specified';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-6">
        {/* Company Logo */}
        <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden flex items-center justify-center font-bold text-2xl shadow-md border-2 border-border bg-muted"
          style={{
            backgroundColor: company.companyLogoUrl ? '#ffffff' : 'hsl(var(--muted))',
            color: company.companyLogoUrl ? 'inherit' : 'hsl(var(--muted-foreground))'
          }}>
          {company.companyLogoUrl ? (
            <Image
              src={company.companyLogoUrl}
              alt={`${company.companyName} logo`}
              width={128}
              height={128}
              className="object-contain p-2"
            />
          ) : (
            <span>{companyInitials}</span>
          )}
        </div>

        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl md:text-4xl font-bold text-theme-dark mb-2">
            {company.companyName}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            {company.industry && (
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                <span>{company.industry.name}</span>
              </div>
            )}
            
            {locationDisplay && locationDisplay !== 'Location not specified' && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{locationDisplay}</span>
              </div>
            )}
            
            {company.companySize && (
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{company.companySize} employees</span>
              </div>
            )}
            
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary-blue hover:text-primary-blue-light transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span>Visit Website</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

