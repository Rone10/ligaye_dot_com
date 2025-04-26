'use client'

import { ColumnDef } from '@tanstack/react-table'
import type { Row, Column } from '@tanstack/react-table'
import Link from 'next/link'
import { ArrowUpDown, Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatDistanceToNow } from 'date-fns'
import { ApplicationWithCandidateDetails } from '../_queries'

// Helper function to get initials for avatar fallback
const getInitials = (name: string | null): string => {
    if (!name) return 'N/A';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
};

// Helper for application status badge styling
const getStatusBadgeVariant = (status: string): BadgeProps['variant'] => {
    switch (status) {
        case 'APPLIED': return 'default';
        case 'REVIEWING': return 'secondary';
        case 'SHORTLISTED': return 'outline';
        case 'INTERVIEW_SCHEDULED': return 'default';
        case 'INTERVIEWED': return 'default';
        case 'OFFER_EXTENDED': return 'default';
        case 'HIRED': return 'default';
        case 'REJECTED': return 'destructive';
        case 'WITHDRAWN': return 'outline';
        default: return 'secondary';
    }
}

// Function to format status labels
const formatStatusLabel = (status: string): string => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const columns: ColumnDef<ApplicationWithCandidateDetails>[] = [
    {
        accessorKey: 'candidateName',
        header: ({ column }: { column: Column<ApplicationWithCandidateDetails, unknown> }) => {
            return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Candidate
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
            )
        },
        cell: ({ row }: { row: Row<ApplicationWithCandidateDetails> }) => {
            const application = row.original
            const name = application.candidateName
            const title = application.candidateTitle
            const avatarUrl = application.candidateAvatarUrl
            const initials = getInitials(name)

            return (
                <div className="flex items-center space-x-3">
                    <Avatar className="h-9 w-9 border border-[#e1e5f2]">
                        <AvatarImage src={avatarUrl ?? undefined} alt={name ?? 'Candidate'} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <Link href={`/employer/jobs/applicants/${row.original.id}`}>
                            <span className="font-medium text-sm text-[#1a1e2d]">{name || 'N/A'}</span>
                        </Link>
                        {title && <span className="text-xs text-[#9aa3bc]">{title}</span>}
                    
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: 'appliedAt',
        header: ({ column }: { column: Column<ApplicationWithCandidateDetails, unknown> }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Applied
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }: { row: Row<ApplicationWithCandidateDetails> }) => {
            const date = row.getValue('appliedAt')
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="text-sm text-[#1a1e2d]">
                                {formatDistanceToNow(new Date(date as string), { addSuffix: true })}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{new Date(date as string).toLocaleString()}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }: { column: Column<ApplicationWithCandidateDetails, unknown> }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }: { row: Row<ApplicationWithCandidateDetails> }) => {
            const status = row.getValue('status') as string
            const variant = getStatusBadgeVariant(status)
            const label = formatStatusLabel(status)
            return (
                <Badge variant={variant} className="capitalize text-xs py-0.5 px-2 font-medium">
                    {label}
                </Badge>
            )
        },
    },
    {
        id: 'resume',
        header: () => <div className="text-left font-medium text-[#1a1e2d]">Resume</div>,
        cell: ({ row }: { row: Row<ApplicationWithCandidateDetails> }) => {
            const application = row.original
            const resumeUrl = application.resumeUrl
            const resumeFilename = application.resumeFilename

            if (!resumeUrl) {
                return <span className="text-xs text-[#9aa3bc] italic">No Resume</span>
            }

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-[#e1e5f2] hover:bg-gray-50"
                                asChild
                            >
                                <Link href={resumeUrl} target="_blank" download={resumeFilename ?? 'resume'}>
                                    <Download className="h-4 w-4 text-[#4a6cfa]" />
                                    <span className="sr-only">Download Resume</span>
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{resumeFilename || 'Download Resume'}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        },
        enableSorting: false,
    },
    // {
    //     id: 'actions',
    //     header: () => <div className="text-right font-medium text-[#1a1e2d]">Actions</div>,
    //     cell: ({ row }: { row: Row<ApplicationWithCandidateDetails> }) => {
    //         const application = row.original

    //         // Example Action: Link to a future detailed application view
    //         // const viewLink = `/employer/applications/${application.id}`;

    //         return (
    //             <div className="flex justify-end space-x-2">
    //                 {/* Add actions like 'View Details', 'Change Status', 'Message Candidate' here */}
    //                 {/* Example: View Details Button */}
    //                 {/*
    //                 <TooltipProvider>
    //                     <Tooltip>
    //                         <TooltipTrigger asChild>
    //                             <Button variant="ghost" size="icon" className="h-8 w-8">
    //                                  <Link href={viewLink}>
    //                                     <Eye className="h-4 w-4" />
    //                                     <span className="sr-only">View Application</span>
    //                                  </Link>
    //                             </Button>
    //                         </TooltipTrigger>
    //                         <TooltipContent>View Details</TooltipContent>
    //                     </Tooltip>
    //                 </TooltipProvider>
    //                 */}
    //                 <span className="text-xs text-[#9aa3bc] italic">No actions</span>
    //             </div>
    //         )
    //     },
    //     enableSorting: false,
    // },
] 