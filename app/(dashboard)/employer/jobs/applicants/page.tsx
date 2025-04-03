'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { getEmployerApplications, getApplicationCounts } from './_queries'
import ApplicationsDataTable from './_components/ApplicationsDataTable'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

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
  const [applications, setApplications] = useState<Application[]>([])
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
  
  // Parse filters from search params
  const filters = {
    status: searchParams.get('status') || 'ALL',
    searchTerm: searchParams.get('q') || '',
    sort: (searchParams.get('sort') as 'newest' | 'oldest') || 'newest'
  }
  
  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession()
      
      if (!data.session) {
        router.push('/login')
        return
      }
      
      loadData()
    }
    
    async function loadData() {
      setIsLoading(true)
      
      try {
        // Fetch applications and counts
        const [applicationsResult, countsResult] = await Promise.all([
          getEmployerApplications(filters),
          getApplicationCounts()
        ])
        
        // Handle errors
        if (applicationsResult.error || countsResult.error) {
          // If it's a profile not found error, redirect to create profile
          if (applicationsResult.error === 'Employer profile not found' || 
              countsResult.error === 'Employer profile not found') {
            router.push('/employer/profile')
            return
          }
        }
        
        setApplications(applicationsResult.applications || [])
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
    }
    
    checkAuth()
  }, [filters.status, filters.searchTerm, filters.sort, router, supabase])
  
  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('sort', e.target.value)
    router.push(`/employer/jobs/applicants?${newParams.toString()}`)
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-200 h-12 w-12 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-64"></div>
          </div>
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
              <Link href="/employer/jobs/applicants" 
                  className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                    filters.status === 'ALL' 
                      ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                      : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                  }`}>
                <span>All</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">{counts.all}</span>
              </Link>
              <Link href="/employer/jobs/applicants?status=APPLIED" 
                  className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                    filters.status === 'APPLIED' 
                      ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                      : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                  }`}>
                <span>Applied</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">{counts.applied}</span>
              </Link>
              <Link href="/employer/jobs/applicants?status=REVIEWING" 
                  className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                    filters.status === 'REVIEWING' 
                      ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                      : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                  }`}>
                <span>Reviewing</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">{counts.reviewing}</span>
              </Link>
              <Link href="/employer/jobs/applicants?status=SHORTLISTED" 
                  className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                    filters.status === 'SHORTLISTED' 
                      ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                      : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                  }`}>
                <span>Shortlisted</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">{counts.shortlisted}</span>
              </Link>
              <Link href="/employer/jobs/applicants?status=INTERVIEW_SCHEDULED" 
                  className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                    filters.status === 'INTERVIEW_SCHEDULED' 
                      ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                      : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                  }`}>
                <span>Interview</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">{counts.interview}</span>
              </Link>
              <Link href="/employer/jobs/applicants?status=INTERVIEWED" 
                  className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                    filters.status === 'INTERVIEWED' 
                      ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                      : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                  }`}>
                <span>Interviewed</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">{counts.interviewed}</span>
              </Link>
              <Link href="/employer/jobs/applicants?status=OFFER_EXTENDED" 
                  className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                    filters.status === 'OFFER_EXTENDED' 
                      ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                      : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                  }`}>
                <span>Offered</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">{counts.offered}</span>
              </Link>
              <Link href="/employer/jobs/applicants?status=HIRED" 
                  className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                    filters.status === 'HIRED' 
                      ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                      : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                  }`}>
                <span>Hired</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">{counts.hired}</span>
              </Link>
              <Link href="/employer/jobs/applicants?status=REJECTED" 
                  className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                    filters.status === 'REJECTED' 
                      ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                      : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                  }`}>
                <span>Rejected</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">{counts.rejected}</span>
              </Link>
              <Link href="/employer/jobs/applicants?status=WITHDRAWN" 
                  className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                    filters.status === 'WITHDRAWN' 
                      ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                      : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                  }`}>
                <span>Withdrawn</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">{counts.withdrawn}</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Enhanced search and filters section */}
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <form className="relative flex-1 w-full" action="/employer/jobs/applicants" method="GET">
              <input type="hidden" name="status" value={filters.status} />
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input 
                type="text" 
                name="q"
                defaultValue={filters.searchTerm}
                placeholder="Search by job title or candidate name" 
                className="pl-10 h-10 border border-gray-200 rounded-lg w-full focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
              />
              <input type="hidden" name="sort" value={filters.sort} />
              <Button 
                type="submit" 
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                Search
              </Button>
            </form>
            
            <div className="w-full md:w-40 flex items-center">
              <select 
                className="h-10 rounded-lg border border-gray-200 px-3 py-2 bg-white w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                onChange={handleSortChange}
                value={filters.sort}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>

          {/* Current filter indicators */}
          {(filters.status !== 'ALL' || filters.searchTerm) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {filters.status !== 'ALL' && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-100">
                  <span>Status: {filters.status.replace('_', ' ').toLowerCase()}</span>
                  <Link href={`/employer/jobs/applicants${filters.searchTerm ? `?q=${filters.searchTerm}` : ''}`}>
                    <span className="ml-1 p-0.5 rounded-full hover:bg-blue-100 cursor-pointer">×</span>
                  </Link>
                </div>
              )}
              {filters.searchTerm && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-100">
                  <span>Search: {filters.searchTerm}</span>
                  <Link href={`/employer/jobs/applicants${filters.status !== 'ALL' ? `?status=${filters.status}` : ''}`}>
                    <span className="ml-1 p-0.5 rounded-full hover:bg-blue-100 cursor-pointer">×</span>
                  </Link>
                </div>
              )}
              <Link href="/employer/jobs/applicants">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors">
                  Clear all filters
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Display applications or empty state */}
      <div className="mt-6">
        {applications.length > 0 ? (
          <ApplicationsDataTable applications={applications} />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="mx-auto w-16 h-16 mb-4 text-gray-300 flex items-center justify-center bg-gray-50 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No applications found</h3>
            <p className="text-gray-500 mb-5 max-w-md mx-auto">No applications match your current filters. Try adjusting your search criteria.</p>
            <Link href="/employer/jobs/applicants">
              <Button variant="outline" className="px-4 py-2 text-sm font-medium border-gray-200 hover:bg-gray-50">
                Clear all filters
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
} 