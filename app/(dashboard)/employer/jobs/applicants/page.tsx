'use client'

import { useState, useEffect, ChangeEvent, useMemo, useCallback, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { getEmployerApplications, getApplicationCounts } from './_queries'
import ApplicationsDataTable from './_components/ApplicationsDataTable'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PropagateLoaderSpinner  from '@/components/loaders/propagate-loarder'
import Link from 'next/link'

// Debounce function implementation
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Application type definition based on _queries.ts
type ApplicationStatus = 'APPLIED' | 'REVIEWING' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 
                         'INTERVIEWED' | 'OFFER_EXTENDED' | 'HIRED' | 'REJECTED' | 'WITHDRAWN'

interface Application {
  application: {
    id: string
    status: ApplicationStatus
    appliedAt: Date
    updatedAt: Date
    coverLetterText: string | null
    coverLetterUrl: string | null
    resumeUrl: string | null
    interviewDate: Date | null
  }
  job: {
    id: string
    title: string
  }
  candidate: {
    id: string
    fullName: string
    title: string | null
    avatarUrl: string | null
  }
}

interface ApplicationCounts {
  all: number
  applied: number
  reviewing: number
  shortlisted: number
  interview: number
  interviewed: number
  offered: number
  hired: number
  rejected: number
  withdrawn: number
}

export default function EmployerApplicationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [allApplications, setAllApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [counts, setCounts] = useState<ApplicationCounts>({
    all: 0,
    applied: 0,
    reviewing: 0,
    shortlisted: 0,
    interview: 0,
    interviewed: 0,
    offered: 0,
    hired: 0,
    rejected: 0,
    withdrawn: 0
  })
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '')
  
  // Parse filters from search params and memoize to prevent unnecessary rerenders
  const filters = useMemo(() => ({
    status: searchParams.get('status') || 'ALL',
    searchTerm: searchParams.get('q') || '',
    sort: (searchParams.get('sort') as 'newest' | 'oldest') || 'newest'
  }), [searchParams]);
  
  // Load all applications data once
  const loadAllData = useCallback(async () => {
    setIsLoading(true)
    
    try {
      // Fetch all applications and counts - no longer passing sort parameter
      const [applicationsResult, countsResult] = await Promise.all([
        getEmployerApplications(),
        getApplicationCounts()
      ])
      
      // Handle errors
      if (applicationsResult.error || countsResult.error) {
        if (applicationsResult.error === 'Employer profile not found' || 
            countsResult.error === 'Employer profile not found') {
          router.push('/employer/profile')
          return
        }
      }
      
      setAllApplications(applicationsResult.applications || [])
      setCounts(countsResult.counts || {
        all: 0,
        applied: 0,
        reviewing: 0,
        shortlisted: 0,
        interview: 0,
        interviewed: 0,
        offered: 0,
        hired: 0,
        rejected: 0,
        withdrawn: 0
      })
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [router])
  
  // Apply client-side filtering based on URL params
  useEffect(() => {
    if (allApplications.length > 0) {
      let filtered = [...allApplications]
      
      // Apply status filter
      if (filters.status && filters.status !== 'ALL') {
        filtered = filtered.filter(app => 
          app.application.status === filters.status
        )
      }
      
      // Apply search filter
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase()
        filtered = filtered.filter(app =>
          app.job.title.toLowerCase().includes(term) ||
          app.candidate.fullName.toLowerCase().includes(term)
        )
      }
      
      // Apply client-side sorting
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.application.appliedAt).getTime()
        const dateB = new Date(b.application.appliedAt).getTime()
        return filters.sort === 'newest' ? dateB - dateA : dateA - dateB
      })
      
      setFilteredApplications(filtered)
    }
  }, [allApplications, filters.status, filters.searchTerm, filters.sort])
  
  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession()
      
      if (!data.session) {
        router.push('/sign-in')
        return
      }
      
      loadAllData()
    }
    
    checkAuth()
  }, [loadAllData, router, supabase])
  
  // Update URL without page navigation
  const updateUrlWithFilter = useCallback((key: string, value: string | null) => {
    startTransition(() => {
      const newParams = new URLSearchParams(searchParams.toString())
      
      if (value === null || value === '') {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
      
      // Use router.replace to update URL without navigation
      router.replace(`/employer/jobs/applicants?${newParams.toString()}`, { scroll: false })
    })
  }, [router, searchParams])
  
  // Handle filter changes
  const handleStatusChange = useCallback((status: string) => {
    updateUrlWithFilter('status', status === 'ALL' ? null : status)
  }, [updateUrlWithFilter])
  
  const handleSortChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    updateUrlWithFilter('sort', e.target.value)
    // No longer need to reload data from server for sorting
  }, [updateUrlWithFilter])
  
  const handleSearch = useCallback(debounce((term: string) => {
    updateUrlWithFilter('q', term || null)
  }, 300), [updateUrlWithFilter])
  
  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    handleSearch(value)
  }, [handleSearch])
  
  const handleClearFilters = useCallback(() => {
    startTransition(() => {
      router.replace('/employer/jobs/applicants', { scroll: false })
      setSearchValue('')
    })
  }, [router])
  
  if (isLoading || isPending) {
    return (
    <div className="container mx-auto py-10">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <PropagateLoaderSpinner />
      </div>
    </div>
    )
  }
  
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#1a1e2d]">Job Applications</h1>
        <p className="text-[#9aa3bc] mt-1">Manage and track candidates applying to your job postings</p>
      </div>
      
      {/* Redesigned filter section with better styling */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {/* Status tabs with scrollable container */}
        <div className="border-b border-gray-100">
          <div className="px-4 py-3">
            <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => handleStatusChange('ALL')}
                className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                  filters.status === 'ALL' 
                    ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}>
                <span>All</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">{counts.all}</span>
              </button>
              <button
                onClick={() => handleStatusChange('APPLIED')}
                className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                  filters.status === 'APPLIED' 
                    ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}>
                <span>Applied</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">{counts.applied}</span>
              </button>
              <button
                onClick={() => handleStatusChange('REVIEWING')}
                className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                  filters.status === 'REVIEWING' 
                    ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}>
                <span>Reviewing</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">{counts.reviewing}</span>
              </button>
              <button
                onClick={() => handleStatusChange('SHORTLISTED')}
                className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                  filters.status === 'SHORTLISTED' 
                    ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}>
                <span>Shortlisted</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">{counts.shortlisted}</span>
              </button>
              <button
                onClick={() => handleStatusChange('INTERVIEW_SCHEDULED')}
                className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                  filters.status === 'INTERVIEW_SCHEDULED' 
                    ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}>
                <span>Interview</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">{counts.interview}</span>
              </button>
              <button
                onClick={() => handleStatusChange('INTERVIEWED')}
                className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                  filters.status === 'INTERVIEWED' 
                    ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}>
                <span>Interviewed</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">{counts.interviewed}</span>
              </button>
              <button
                onClick={() => handleStatusChange('OFFER_EXTENDED')}
                className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                  filters.status === 'OFFER_EXTENDED' 
                    ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}>
                <span>Offered</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">{counts.offered}</span>
              </button>
              <button
                onClick={() => handleStatusChange('HIRED')}
                className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                  filters.status === 'HIRED' 
                    ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}>
                <span>Hired</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">{counts.hired}</span>
              </button>
              <button
                onClick={() => handleStatusChange('REJECTED')}
                className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                  filters.status === 'REJECTED' 
                    ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}>
                <span>Rejected</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">{counts.rejected}</span>
              </button>
              <button
                onClick={() => handleStatusChange('WITHDRAWN')}
                className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                  filters.status === 'WITHDRAWN' 
                    ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}>
                <span>Withdrawn</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">{counts.withdrawn}</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Search and filter controls */}
        <div className="px-4 py-3 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search by job title or candidate name"
              value={searchValue}
              onChange={handleSearchChange}
              className="pl-10 h-10 w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.sort}
              onChange={handleSortChange}
              className="border border-gray-200 h-10 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Display applications or empty state */}
      <div className="mt-6">
        {filteredApplications.length > 0 ? (
          <ApplicationsDataTable applications={filteredApplications} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Search className="text-blue-500" size={24} />
              </div>
              <h3 className="text-gray-800 font-medium text-lg mb-2">No applications found</h3>
              <p className="text-gray-500 max-w-md mb-6">There are no applications matching your current filters. Try changing your search terms or filter criteria.</p>
              <Button 
                onClick={handleClearFilters}
                variant="outline" 
                className="border-gray-200"
              >
                Clear all filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 