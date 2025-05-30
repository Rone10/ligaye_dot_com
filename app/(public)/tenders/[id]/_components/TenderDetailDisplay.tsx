import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Phone, 
  ExternalLink,
  Briefcase,
  User,
  Clock,
  FileText,
  Globe,
  Award
} from 'lucide-react';
import type { TenderWithRelations } from '../_queries';
import { DocumentSection } from './DocumentSection';

interface TenderDetailDisplayProps {
  tender: TenderWithRelations;
}

export default function TenderDetailDisplay({ tender }: TenderDetailDisplayProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-secondary-green/10 text-secondary-green border-secondary-green/20';
      case 'DRAFT':
        return 'bg-theme-gray/10 text-theme-gray-dark border-theme-gray/20';
      case 'CLOSED':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'CANCELLED':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default:
        return 'bg-theme-gray/10 text-theme-gray-dark border-theme-gray/20';
    }
  };

  const getTenderTypeLabel = (type: string) => {
    return type === 'TENDER' ? 'Tender' : 'Public Notice';
  };

  const getTenderTypeIcon = (type: string) => {
    return type === 'TENDER' ? Award : FileText;
  };

  const TenderTypeIcon = getTenderTypeIcon(tender.tenderType);

  return (
    <div className="space-y-2xl animate-appear max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="glass-card p-2xl rounded-xl shadow-level-3 hover:shadow-level-4 duration-standard">
        <div className="space-y-xl">
          {/* Header with enhanced visual hierarchy */}
          <div className="space-y-lg">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-lg">
              <div className="space-y-md flex-1">
                <div className="flex items-center gap-md mb-sm">
                  <div className="p-sm bg-primary-blue/10 rounded-lg">
                    <TenderTypeIcon className="h-6 w-6 text-primary-blue" />
                  </div>
                  <Badge className="bg-primary-blue/10 text-primary-blue border-primary-blue/20 px-md py-xs font-medium">
                    {getTenderTypeLabel(tender.tenderType)}
                  </Badge>
                </div>
                
                <h1 className="text-3xl lg:text-4xl font-bold text-theme-dark leading-tight">
                  {tender.title}
                </h1>
                
                <div className="flex items-center gap-sm text-theme-gray-dark">
                  <div className="p-xs bg-theme-gray/20 rounded-md">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-lg">{tender.organizationName}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-sm ">
                <Badge className={`${getStatusColor(tender.status)} px-md py-sm text-sm font-semibold`}>
                  {tender.status}
                </Badge>
                {tender.deadline && (
                  <div className="text-right">
                    <p className="text-xs font-medium text-theme-gray-dark uppercase tracking-wide">Deadline</p>
                    <p className="text-sm font-semibold text-theme-dark">
                      {format(new Date(tender.deadline), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description Section with enhanced styling */}
          <div className="space-y-md">
            <div className="flex items-center gap-sm">
              <div className="h-1 w-8 bg-primary-blue rounded-full"></div>
              <h2 className="text-xl font-semibold text-theme-dark">Description</h2>
            </div>
            <div className=" rounded-lg p-xl border border-theme-gray/30 shadow-level-1">
              <div 
                className="prose-rich-text max-w-none text-theme-dark leading-relaxed text-base [&>p]:mb-md [&>p:last-child]:mb-0 [&>ul]:mb-md [&>ol]:mb-md [&>ul]:text-theme-dark [&>ol]:text-theme-dark [&>li]:text-theme-dark"
                dangerouslySetInnerHTML={{ __html: tender.description }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Information Grid with enhanced cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Key Details Card */}
        <div className="lg:col-span-2">
          <Card className="glass-card p-xl h-full shadow-level-2 hover:shadow-level-3 duration-standard">
            <div className="space-y-xl">
              <div className="flex items-center gap-sm">
                <div className="h-1 w-8 bg-secondary-green rounded-full"></div>
                <h3 className="text-xl font-semibold text-theme-dark">Key Information</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
                {/* Sector */}
                {tender.sector && (
                  <div className="group">
                    <div className="flex items-start gap-md p-lg bg-theme-light/30 rounded-lg border border-theme-gray/20 hover:border-primary-blue/30 duration-standard">
                      <div className="p-sm bg-primary-blue/10 rounded-lg group-hover:bg-primary-blue/20 duration-standard">
                        <Briefcase className="h-5 w-5 text-primary-blue" />
                      </div>
                      <div className="space-y-xs">
                        <p className="text-sm font-medium text-theme-gray-dark uppercase tracking-wide">Sector</p>
                        <p className="text-lg font-semibold text-theme-dark">{tender.sector.name}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Location */}
                {tender.location && (
                  <div className="group">
                    <div className="flex items-start gap-md p-lg bg-theme-light/30 rounded-lg border border-theme-gray/20 hover:border-primary-blue/30 duration-standard">
                      <div className="p-sm bg-primary-blue/10 rounded-lg group-hover:bg-primary-blue/20 duration-standard">
                        <MapPin className="h-5 w-5 text-primary-blue" />
                      </div>
                      <div className="space-y-xs">
                        <p className="text-sm font-medium text-theme-gray-dark uppercase tracking-wide">Location</p>
                        <p className="text-lg font-semibold text-theme-dark">
                          {tender.location.city}
                          {tender.location.region && `, ${tender.location.region}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Budget Range */}
                {tender.budgetRange && (
                  <div className="group sm:col-span-2">
                    <div className="flex items-start gap-md p-lg bg-theme-light/30 rounded-lg border border-theme-gray/20 hover:border-secondary-green/30 duration-standard">
                      <div className="p-sm bg-secondary-green/10 rounded-lg group-hover:bg-secondary-green/20 duration-standard">
                        <DollarSign className="h-5 w-5 text-secondary-green" />
                      </div>
                      <div className="space-y-xs">
                        <p className="text-sm font-medium text-theme-gray-dark uppercase tracking-wide">Budget Range</p>
                        <p className="text-xl font-bold text-secondary-green">{tender.budgetRange}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Contact & Meta Information Card */}
        <div className="lg:col-span-1">
          <Card className="glass-card p-xl h-full shadow-level-2 hover:shadow-level-3 duration-standard">
            <div className="space-y-xl">
              <div className="flex items-center gap-sm">
                <div className="h-1 w-8 bg-primary-blue rounded-full"></div>
                <h3 className="text-xl font-semibold text-theme-dark">Contact & Details</h3>
              </div>
              
              <div className="space-y-lg">
                {/* Contact Information */}
                {tender.contactInformation && (
                  <div className="group">
                    <div className="p-lg bg-theme-light/30 rounded-lg border border-theme-gray/20 hover:border-primary-blue/30 duration-standard">
                      <div className="flex items-start gap-md mb-sm">
                        <div className="p-xs bg-primary-blue/10 rounded-md group-hover:bg-primary-blue/20 duration-standard">
                          <Phone className="h-4 w-4 text-primary-blue" />
                        </div>
                        <p className="text-sm font-medium text-theme-gray-dark uppercase tracking-wide">Contact</p>
                      </div>
                      <p className="text-base text-theme-dark whitespace-pre-wrap leading-relaxed ml-8">
                        {tender.contactInformation}
                      </p>
                    </div>
                  </div>
                )}

                {/* External Link */}
                {tender.externalLink && (
                  <div className="group">
                    <div className="p-lg bg-theme-light/30 rounded-lg border border-theme-gray/20 hover:border-primary-blue/30 duration-standard">
                      <div className="flex items-start gap-md mb-sm">
                        <div className="p-xs bg-primary-blue/10 rounded-md group-hover:bg-primary-blue/20 duration-standard">
                          <Globe className="h-4 w-4 text-primary-blue" />
                        </div>
                        <p className="text-sm font-medium text-theme-gray-dark uppercase tracking-wide">External Resource</p>
                      </div>
                      <a 
                        href={tender.externalLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-xs text-base text-primary-blue hover:text-primary-blue-light duration-standard font-medium ml-8 group-hover:underline"
                      >
                        View Resource
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Posted By */}
                {/* {tender.user && ( */}
                  {/* // <div className="group">
                  //   <div className="p-lg bg-theme-light/30 rounded-lg border border-theme-gray/20">
                  //     <div className="flex items-start gap-md mb-sm">
                  //       <div className="p-xs bg-theme-gray/20 rounded-md">
                  //         <User className="h-4 w-4 text-theme-gray-dark" />
                  //       </div>
                  //       <p className="text-sm font-medium text-theme-gray-dark uppercase tracking-wide">Posted By</p>
                  //     </div>
                  //     <p className="text-base font-medium text-theme-dark ml-8">{tender.user.fullName}</p>
                  //   </div>
                  // </div> */}
                {/* )} */}

                {/* Posted Date */}
                <div className="group">
                  <div className="p-lg bg-theme-light/30 rounded-lg border border-theme-gray/20">
                    <div className="flex items-start gap-md mb-sm">
                      <div className="p-xs bg-theme-gray/20 rounded-md">
                        <Clock className="h-4 w-4 text-theme-gray-dark" />
                      </div>
                      <p className="text-sm font-medium text-theme-gray-dark uppercase tracking-wide">Posted On</p>
                    </div>
                    <p className="text-base font-medium text-theme-dark ml-8">
                      {format(new Date(tender.createdAt), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Document Section */}
      <DocumentSection tender={tender} />
    </div>
  );
} 