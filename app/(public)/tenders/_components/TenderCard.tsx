'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ExternalLink,
  Briefcase,
  Award,
  FileText,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import type { TenderWithRelations } from '../_queries';

interface TenderCardProps {
  tender: TenderWithRelations;
  currentUserId?: string;
  onDelete?: (tenderId: string) => void;
}

export function TenderCard({ tender, currentUserId, onDelete }: TenderCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

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

  const formatDeadline = (deadline: Date | null) => {
    if (!deadline) return null;
    return format(new Date(deadline), 'MMM dd, yyyy');
  };

  const formatLocation = (location?: { region: string; city?: string | null }) => {
    if (!location) return 'Location not specified';
    return location.city ? `${location.city}, ${location.region}` : location.region;
  };

  const formatPostedDate = (createdAt: Date) => {
    return format(new Date(createdAt), 'dd MMM yyyy');
  };

  const canUserEdit = () => {
    return currentUserId && tender.userId === currentUserId;
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onDelete || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await onDelete(tender.id);
    } catch (error) {
      console.error('Error deleting tender:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const TenderTypeIcon = getTenderTypeIcon(tender.tenderType);
  const organizationInitial = tender.organizationName ? tender.organizationName.charAt(0).toUpperCase() : 'O';

  return (
    <div className="glass-card p-xl rounded-xl shadow-level-2 hover:shadow-level-3 duration-standard hover:translate-y-[-2px] group">
      <div className="flex items-start gap-lg">
        {/* Organization Icon */}
        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center bg-primary-blue/10 text-primary-blue font-semibold text-xl">
          <div className="p-sm bg-primary-blue/10 rounded-lg">
            <TenderTypeIcon className="h-8 w-8 text-primary-blue" />
          </div>
        </div>

        {/* Tender Information */}
        <div className="flex-grow space-y-md">
          <div className="flex justify-between items-start gap-md">
            <div className="space-y-xs">
              <h3 className="text-xl font-semibold text-theme-dark leading-tight">
                <Link 
                  href={`/tenders/${tender.id}`}
                  className="hover:text-primary-blue duration-standard"
                >
                  {tender.title}
                </Link>
              </h3>
              <div className="flex items-center gap-sm text-theme-gray-dark">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{tender.organizationName}</span>
              </div>
            </div>
          </div>

          {/* Tags and Info */}
          <div className="flex flex-wrap gap-sm">
            {/* Tender Type Badge (replaces the status badge) */}
            <span className="inline-block px-md py-xs rounded-full text-xs font-medium bg-primary-blue/10 text-primary-blue border border-primary-blue/20">
              {getTenderTypeLabel(tender.tenderType)}
            </span>
            {tender.sector && (
              <span className="inline-flex items-center gap-xs px-md py-xs rounded-full text-xs font-medium bg-secondary-green/10 text-secondary-green border border-secondary-green/20">
                <Briefcase className="h-3 w-3" />
                {tender.sector.name}
              </span>
            )}
            {tender.location && (
              <span className="inline-flex items-center gap-xs px-md py-xs rounded-full text-xs font-medium bg-theme-gray/20 text-theme-gray-dark">
                <MapPin className="h-3 w-3" />
                {formatLocation(tender.location)}
              </span>
            )}
          </div>

          {/* Details Row - Now shows deadline, budget, and posted date */}
          <div className="flex flex-wrap justify-between items-center gap-md pt-sm">
            <div className="flex flex-wrap gap-lg">
              {tender.deadline && (
                <div className="flex items-center gap-xs text-sm text-theme-gray-dark">
                  <Calendar className="h-4 w-4" />
                  <span>Deadline: <span className="font-medium text-theme-dark">{formatDeadline(tender.deadline)}</span></span>
                </div>
              )}
              {tender.budgetRange && (
                <div className="flex items-center gap-xs text-sm text-theme-gray-dark">
                  {/* <DollarSign className="h-4 w-4" /> */}
                  <span>Budget: <span className="font-medium text-theme-dark">{formatCurrency(Number(tender.budgetRange), 'GMD')}</span></span>
                </div>
              )}
              <div className="text-sm text-theme-gray-dark">
                Posted {formatPostedDate(tender.createdAt)}
              </div>
            </div>

            {/* Action Buttons - Only show edit/delete for owners */}
            {/* {canUserEdit() && (
              <div className="flex items-center gap-xs">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/tenders/${tender.id}/edit`} className="gap-xs">
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="gap-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
} 