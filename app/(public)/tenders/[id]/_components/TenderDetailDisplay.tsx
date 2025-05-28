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
  Clock
} from 'lucide-react';
import type { TenderWithRelations } from '../_queries';

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

  return (
    <div className="space-y-xl">
      {/* Main Information Card */}
      <Card className="glass-card p-xl">
        <div className="space-y-lg">
          {/* Header */}
          <div className="border-b border-theme-gray/20 pb-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-md">
              <div className="space-y-sm">
                <h2 className="text-2xl font-bold text-theme-dark">{tender.title}</h2>
                <div className="flex items-center gap-sm text-theme-gray-dark">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">{tender.organizationName}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-sm">
                <Badge className={`${getStatusColor(tender.status)} px-sm py-xxs`}>
                  {tender.status}
                </Badge>
                <Badge className="bg-primary-blue/10 text-primary-blue border-primary-blue/20 px-sm py-xxs">
                  {getTenderTypeLabel(tender.tenderType)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-sm">
            <h3 className="text-lg font-semibold text-theme-dark">Description</h3>
            <div 
              className="prose-rich-text max-w-none text-theme-gray-dark"
              dangerouslySetInnerHTML={{ __html: tender.description }}
            />
          </div>
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {/* Left Column */}
        <Card className="glass-card p-lg space-y-md">
          <h3 className="text-lg font-semibold text-theme-dark mb-md">Key Information</h3>
          
          {/* Sector */}
          {tender.sector && (
            <div className="flex items-start gap-sm">
              <Briefcase className="h-5 w-5 text-primary-blue mt-xxs" />
              <div>
                <p className="text-sm font-medium text-theme-gray-dark">Sector</p>
                <p className="text-base text-theme-dark">{tender.sector.name}</p>
              </div>
            </div>
          )}

          {/* Location */}
          {tender.location && (
            <div className="flex items-start gap-sm">
              <MapPin className="h-5 w-5 text-primary-blue mt-xxs" />
              <div>
                <p className="text-sm font-medium text-theme-gray-dark">Location</p>
                <p className="text-base text-theme-dark">
                  {tender.location.city}
                  {tender.location.region && `, ${tender.location.region}`}
                </p>
              </div>
            </div>
          )}

          {/* Deadline */}
          {tender.deadline && (
            <div className="flex items-start gap-sm">
              <Calendar className="h-5 w-5 text-primary-blue mt-xxs" />
              <div>
                <p className="text-sm font-medium text-theme-gray-dark">Deadline</p>
                <p className="text-base text-theme-dark">
                  {format(new Date(tender.deadline), 'PPP')}
                </p>
              </div>
            </div>
          )}

          {/* Budget Range */}
          {tender.budgetRange && (
            <div className="flex items-start gap-sm">
              <DollarSign className="h-5 w-5 text-primary-blue mt-xxs" />
              <div>
                <p className="text-sm font-medium text-theme-gray-dark">Budget Range</p>
                <p className="text-base text-theme-dark">{tender.budgetRange}</p>
              </div>
            </div>
          )}
        </Card>

        {/* Right Column */}
        <Card className="glass-card p-lg space-y-md">
          <h3 className="text-lg font-semibold text-theme-dark mb-md">Contact & Additional Info</h3>
          
          {/* Contact Information */}
          {tender.contactInformation && (
            <div className="flex items-start gap-sm">
              <Phone className="h-5 w-5 text-primary-blue mt-xxs" />
              <div>
                <p className="text-sm font-medium text-theme-gray-dark">Contact Information</p>
                <p className="text-base text-theme-dark whitespace-pre-wrap">
                  {tender.contactInformation}
                </p>
              </div>
            </div>
          )}

          {/* External Link */}
          {tender.externalLink && (
            <div className="flex items-start gap-sm">
              <ExternalLink className="h-5 w-5 text-primary-blue mt-xxs" />
              <div>
                <p className="text-sm font-medium text-theme-gray-dark">External Link</p>
                <a 
                  href={tender.externalLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-base text-primary-blue hover:text-primary-blue-light duration-standard underline"
                >
                  View External Resource
                </a>
              </div>
            </div>
          )}

          {/* Posted By */}
          {tender.user && (
            <div className="flex items-start gap-sm">
              <User className="h-5 w-5 text-primary-blue mt-xxs" />
              <div>
                <p className="text-sm font-medium text-theme-gray-dark">Posted By</p>
                <p className="text-base text-theme-dark">{tender.user.fullName}</p>
              </div>
            </div>
          )}

          {/* Posted Date */}
          <div className="flex items-start gap-sm">
            <Clock className="h-5 w-5 text-primary-blue mt-xxs" />
            <div>
              <p className="text-sm font-medium text-theme-gray-dark">Posted On</p>
              <p className="text-base text-theme-dark">
                {format(new Date(tender.createdAt), 'PPP')}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 