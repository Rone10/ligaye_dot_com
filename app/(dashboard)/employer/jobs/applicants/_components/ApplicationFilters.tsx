'use client'

import { useState, useTransition, useEffect, useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

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

interface FilterProps {
  counts: ApplicationCounts
  currentStatus?: string
  currentSearchTerm?: string
  currentSort: 'newest' | 'oldest'
}

function ApplicationFilters({ counts, currentStatus, currentSearchTerm, currentSort }: FilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(currentSearchTerm || '')
  
  // Create new search params and navigate
  const createQueryString = useCallback((
    params: { [key: string]: string | null }
  ) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    
    for (const [key, value] of Object.entries(params)) {
      if (value === null) {
        newSearchParams.delete(key)
      } else {
        newSearchParams.set(key, value)
      }
    }
    
    return newSearchParams.toString()
  }, [searchParams])
  
  // Update status filter
  const handleStatusChange = (status: string) => {
    startTransition(() => {
      router.push(
        `${pathname}?${createQueryString({
          status: status === 'ALL' ? null : status,
        })}`
      )
    })
  }
  
  // Update sort order
  const handleSortChange = (sort: string) => {
    startTransition(() => {
      router.push(
        `${pathname}?${createQueryString({
          sort,
        })}`
      )
    })
  }
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(() => {
      router.push(
        `${pathname}?${createQueryString({
          q: searchValue || null,
        })}`
      )
    })
  }
  
  // Debounce function
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    return function(...args: any[]) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, [])
  
  // Memoize the debounced search function
  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      startTransition(() => {
        router.push(
          `${pathname}?${createQueryString({
            q: term || null,
          })}`
        )
      })
    }, 300),
    [pathname, router, createQueryString, debounce]
  )
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    debouncedSearch(value)
  }
  
  return (
    <div className="glass-card overflow-hidden mb-6">
      {/* Status tabs with scrollable container */}
      <div className="border-b border-border">
        <div className="px-4 py-3">
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => handleStatusChange('ALL')}
              className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                (!currentStatus || currentStatus === 'ALL')
                  ? 'bg-primary-blue/10 text-primary-blue font-medium border border-primary-blue/20' 
                  : 'text-theme-gray-dark hover:bg-muted border border-transparent'
              }`}>
              <span>All</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-background border border-border text-muted-foreground">{counts.all}</span>
            </button>
            <button
              onClick={() => handleStatusChange('APPLIED')}
              className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                currentStatus === 'APPLIED' 
                  ? 'bg-primary-blue/10 text-primary-blue font-medium border border-primary-blue/20' 
                  : 'text-theme-gray-dark hover:bg-muted border border-transparent'
              }`}>
              <span>Applied</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-background border border-border text-muted-foreground">{counts.applied}</span>
            </button>
            <button
              onClick={() => handleStatusChange('REVIEWING')}
              className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                currentStatus === 'REVIEWING' 
                  ? 'bg-primary-blue/10 text-primary-blue font-medium border border-primary-blue/20' 
                  : 'text-theme-gray-dark hover:bg-muted border border-transparent'
              }`}>
              <span>Reviewing</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-background border border-border text-muted-foreground">{counts.reviewing}</span>
            </button>
            <button
              onClick={() => handleStatusChange('SHORTLISTED')}
              className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                currentStatus === 'SHORTLISTED' 
                  ? 'bg-primary-blue/10 text-primary-blue font-medium border border-primary-blue/20' 
                  : 'text-theme-gray-dark hover:bg-muted border border-transparent'
              }`}>
              <span>Shortlisted</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-background border border-border text-muted-foreground">{counts.shortlisted}</span>
            </button>
            <button
              onClick={() => handleStatusChange('INTERVIEW_SCHEDULED')}
              className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                currentStatus === 'INTERVIEW_SCHEDULED' 
                  ? 'bg-primary-blue/10 text-primary-blue font-medium border border-primary-blue/20' 
                  : 'text-theme-gray-dark hover:bg-muted border border-transparent'
              }`}>
              <span>Interview</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-background border border-border text-muted-foreground">{counts.interview}</span>
            </button>
            <button
              onClick={() => handleStatusChange('INTERVIEWED')}
              className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                currentStatus === 'INTERVIEWED' 
                  ? 'bg-primary-blue/10 text-primary-blue font-medium border border-primary-blue/20' 
                  : 'text-theme-gray-dark hover:bg-muted border border-transparent'
              }`}>
              <span>Interviewed</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-background border border-border text-muted-foreground">{counts.interviewed}</span>
            </button>
            <button
              onClick={() => handleStatusChange('OFFER_EXTENDED')}
              className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                currentStatus === 'OFFER_EXTENDED' 
                  ? 'bg-primary-blue/10 text-primary-blue font-medium border border-primary-blue/20' 
                  : 'text-theme-gray-dark hover:bg-muted border border-transparent'
              }`}>
              <span>Offered</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-background border border-border text-muted-foreground">{counts.offered}</span>
            </button>
            <button
              onClick={() => handleStatusChange('HIRED')}
              className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                currentStatus === 'HIRED' 
                  ? 'bg-primary-blue/10 text-primary-blue font-medium border border-primary-blue/20' 
                  : 'text-theme-gray-dark hover:bg-muted border border-transparent'
              }`}>
              <span>Hired</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-background border border-border text-muted-foreground">{counts.hired}</span>
            </button>
            <button
              onClick={() => handleStatusChange('REJECTED')}
              className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                currentStatus === 'REJECTED' 
                  ? 'bg-primary-blue/10 text-primary-blue font-medium border border-primary-blue/20' 
                  : 'text-theme-gray-dark hover:bg-muted border border-transparent'
              }`}>
              <span>Rejected</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-background border border-border text-muted-foreground">{counts.rejected}</span>
            </button>
            <button
              onClick={() => handleStatusChange('WITHDRAWN')}
              className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center ${
                currentStatus === 'WITHDRAWN' 
                  ? 'bg-primary-blue/10 text-primary-blue font-medium border border-primary-blue/20' 
                  : 'text-theme-gray-dark hover:bg-muted border border-transparent'
              }`}>
              <span>Withdrawn</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-background border border-border text-muted-foreground">{counts.withdrawn}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Search and filter controls */}
      <div className="px-4 py-3 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
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
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border border-border h-10 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue bg-background text-foreground"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>
    </div>
  )
}

// Clear filters button as a separate component
export function ApplicationFiltersClearButton() {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  
  const handleClearFilters = () => {
    startTransition(() => {
      router.push(pathname)
    })
  }
  
  return (
    <Button 
      onClick={handleClearFilters}
      variant="outline" 
      className="border-border"
      disabled={isPending}
    >
      Clear all filters
    </Button>
  )
}

export default ApplicationFilters 