'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Building2,
  MapPin,
  Calendar,
  Award,
  FileText,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import type { TenderWithRelations } from '../_queries';

interface TenderCardProps {
  tender: TenderWithRelations;
  currentUserId?: string;
  onDelete?: (tenderId: string) => void;
}

export function TenderCard({ tender, currentUserId, onDelete }: TenderCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

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

  const TenderTypeIcon = getTenderTypeIcon(tender.tenderType);
  const organizationInitial = tender.organizationName ? tender.organizationName.charAt(0).toUpperCase() : 'O';

  return (
    <div className="group bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start gap-5">
        {/* Organization Icon */}
        <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center font-bold text-xl shadow-sm border border-border bg-primary/10 text-primary">
          <TenderTypeIcon className="h-7 w-7" />
        </div>

        {/* Tender Information */}
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="text-lg font-bold text-card-foreground leading-tight group-hover:text-primary transition-colors">
                <Link
                  href={`/tenders/${tender.id}`}
                  className="focus:outline-none"
                >
                  {tender.title}
                </Link>
              </h3>
              <div className="mt-1 flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {tender.organizationName}
                </span>
                {tender.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {formatLocation(tender.location)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-700 dark:text-blue-300 border-2 border-blue-500/40 dark:border-blue-400/50 shadow-sm">
              <TenderTypeIcon className="w-3.5 h-3.5 mr-1.5" />
              {getTenderTypeLabel(tender.tenderType)}
            </span>
            {tender.sector && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/20 text-green-700 dark:text-green-300 border-2 border-green-500/40 dark:border-green-400/50 shadow-sm">
                <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                {tender.sector.name}
              </span>
            )}
            {tender.status && (
              <span className={cn(
                "inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border-2 shadow-sm",
                tender.status === 'PUBLISHED' ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 dark:border-emerald-400/50" :
                  tender.status === 'CLOSED' ? "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40 dark:border-red-400/50" :
                    "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/40 dark:border-gray-400/50"
              )}>
                {tender.status}
              </span>
            )}
          </div>

          {/* Details Row */}
          <div className="mt-5 pt-4 border-t border-border flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              {tender.budgetRange && (
                <div className="font-bold text-card-foreground text-base">
                  {formatCurrency(Number(tender.budgetRange), 'GMD')}
                </div>
              )}
              {tender.deadline && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  Deadline: {formatDeadline(tender.deadline)}
                </div>
              )}
              <div className="text-xs text-muted-foreground font-medium">
                Posted {formatPostedDate(tender.createdAt)}
              </div>
            </div>

            <Link href={`/tenders/${tender.id}`} passHref className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-semibold text-sm shadow-sm transition-all hover:shadow-md">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 