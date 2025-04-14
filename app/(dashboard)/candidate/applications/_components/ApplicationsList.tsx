'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ApplicationCard from './ApplicationCard'
import ApplicationsEmptyState from './ApplicationsEmptyState'

// Define the application data type based on query result
type ApplicationData = {
  application: {
    id: string
    status: string
    appliedAt: Date | string
    interviewDate?: Date | string | null
    notes?: string | null
    resumeUrl?: string | null
    coverLetterUrl?: string | null
  }
  job: {
    id: string
    title: string
    workLocation: string
    jobType: string
    experienceLevel?: string | null
    status: string
    publishedAt?: Date | string | null
    expiresAt?: Date | string | null
    salaryCurrency?: string | null
    salaryRangeMin?: number | null
    salaryRangeMax?: number | null
    salaryFrequency?: string | null
    salaryDisplayType?: string | null
  }
  employer: {
    id: string
    companyName: string
    companyLogoUrl?: string | null
  }
}

type ApplicationsListProps = {
  applications: ApplicationData[]
}

export default function ApplicationsList({ applications }: ApplicationsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Get all possible application statuses
  const statuses = ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFER_EXTENDED', 'HIRED', 'REJECTED', 'WITHDRAWN']
  
  // Filter applications based on search and status filter
  const filteredApplications = applications.filter(item => {
    const matchesSearch = 
      searchTerm === '' || 
      item.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employer.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || item.application.status === statusFilter
    
    return matchesSearch && matchesStatus
  })
  
  // If no applications, show empty state
  if (applications.length === 0) {
    return <ApplicationsEmptyState />
  }
  
  return (
    <div className="space-y-6">
      {/* Search and filter controls */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl border border-[rgba(255,255,255,0.3)] p-4 shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          {/* Search input */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search by job title or company..." 
              className="pl-9 h-10 bg-white/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-gray-500 hover:text-gray-900" />
              </button>
            )}
          </div>
          
          {/* Status filter */}
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-[#4a6cfa]" />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px] bg-white/50 h-10">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Applications list */}
      {filteredApplications.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
          {filteredApplications.map((item) => (
            <ApplicationCard 
              key={item.application.id}
              application={item.application}
              job={item.job}
              employer={item.employer}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-md rounded-xl border border-[rgba(255,255,255,0.3)] p-8 text-center shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
          <p className="text-[#9aa3bc]">No applications match your search criteria.</p>
          <Button 
            variant="link" 
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('all')
            }}
            className="text-[#4a6cfa] mt-2"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
} 