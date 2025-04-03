'use client'

import { useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
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
  currentFilters: {
    status: string
    searchTerm: string
    sort: 'newest' | 'oldest'
  }
}

export default function ApplicationFilters({ counts, currentFilters }: FilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(currentFilters.searchTerm)
  
  // Create new search params and navigate
  const createQueryString = (
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
  }
  
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
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Tabs 
          defaultValue={currentFilters.status || 'ALL'} 
          className="w-full max-w-3xl overflow-x-auto" 
          onValueChange={handleStatusChange}
        >
          <TabsList className="grid grid-cols-5 md:grid-cols-10">
            <TabsTrigger value="ALL">
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="APPLIED">
              Applied ({counts.applied})
            </TabsTrigger>
            <TabsTrigger value="REVIEWING">
              Reviewing ({counts.reviewing})
            </TabsTrigger>
            <TabsTrigger value="SHORTLISTED">
              Shortlisted ({counts.shortlisted})
            </TabsTrigger>
            <TabsTrigger value="INTERVIEW_SCHEDULED">
              Interview ({counts.interview})
            </TabsTrigger>
            <TabsTrigger value="INTERVIEWED">
              Interviewed ({counts.interviewed})
            </TabsTrigger>
            <TabsTrigger value="OFFER_EXTENDED">
              Offered ({counts.offered})
            </TabsTrigger>
            <TabsTrigger value="HIRED">
              Hired ({counts.hired})
            </TabsTrigger>
            <TabsTrigger value="REJECTED">
              Rejected ({counts.rejected})
            </TabsTrigger>
            <TabsTrigger value="WITHDRAWN">
              Withdrawn ({counts.withdrawn})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Select 
          defaultValue={currentFilters.sort} 
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search by job title or candidate name"
            className="pl-8"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isPending}>
          Search
        </Button>
      </form>
    </div>
  )
} 