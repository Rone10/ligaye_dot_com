'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface JobCounts {
  all: number
  draft: number
  pending: number
  active: number
  expired: number
  filled: number
}

interface JobFiltersProps {
  counts: JobCounts
  currentFilters: {
    status: string
    searchTerm: string
    sort: string
  }
}

export default function JobFilters({ counts, currentFilters }: JobFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [searchTerm, setSearchTerm] = useState(currentFilters.searchTerm)
  
  // Reset search term when currentFilters.searchTerm changes (e.g. clear filter)
  useEffect(() => {
    setSearchTerm(currentFilters.searchTerm)
  }, [currentFilters.searchTerm])
  
  // Update URL with new filters
  const createQueryString = (
    name: string, 
    value: string
  ) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    
    return params.toString()
  }
  
  // Handle status tab change
  const handleStatusChange = (status: string) => {
    router.push(`${pathname}?${createQueryString('status', status)}`)
  }
  
  // Handle sort change
  const handleSortChange = (sort: string) => {
    router.push(`${pathname}?${createQueryString('sort', sort)}`)
  }
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`${pathname}?${createQueryString('q', searchTerm)}`)
  }
  
  // Clear search
  const clearSearch = () => {
    setSearchTerm('')
    router.push(`${pathname}?${createQueryString('q', '')}`)
  }
  
  return (
    <div className="space-y-4">
      <Tabs 
        defaultValue={currentFilters.status} 
        value={currentFilters.status} 
        onValueChange={handleStatusChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto bg-muted">
          <TabsTrigger value="ALL" className="data-[state=active]:bg-[#4a6cfa]/10 data-[state=active]:text-[#4a6cfa]">
            All
            <Badge variant="outline" className="ml-2 h-5 min-w-5 flex justify-center bg-background">{counts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="DRAFT" className="data-[state=active]:bg-[#4a6cfa]/10 data-[state=active]:text-[#4a6cfa]">
            Draft
            <Badge variant="outline" className="ml-2 h-5 min-w-5 flex justify-center bg-background">{counts.draft}</Badge>
          </TabsTrigger>
          <TabsTrigger value="PENDING_PAYMENT" className="data-[state=active]:bg-[#4a6cfa]/10 data-[state=active]:text-[#4a6cfa]">
            Pending
            <Badge variant="outline" className="ml-2 h-5 min-w-5 flex justify-center bg-background">{counts.pending}</Badge>
          </TabsTrigger>
          <TabsTrigger value="ACTIVE" className="data-[state=active]:bg-[#4a6cfa]/10 data-[state=active]:text-[#4a6cfa]">
            Active
            <Badge variant="outline" className="ml-2 h-5 min-w-5 flex justify-center bg-background">{counts.active}</Badge>
          </TabsTrigger>
          <TabsTrigger value="EXPIRED" className="data-[state=active]:bg-[#4a6cfa]/10 data-[state=active]:text-[#4a6cfa]">
            Expired
            <Badge variant="outline" className="ml-2 h-5 min-w-5 flex justify-center bg-background">{counts.expired}</Badge>
          </TabsTrigger>
          <TabsTrigger value="FILLED" className="data-[state=active]:bg-[#4a6cfa]/10 data-[state=active]:text-[#4a6cfa]">
            Filled
            <Badge variant="outline" className="ml-2 h-5 min-w-5 flex justify-center bg-background">{counts.filled}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <Input
            type="search"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0.5 top-0.5 h-8 w-8 p-0"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
        </form>
        
        <Select
          value={currentFilters.sort}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 