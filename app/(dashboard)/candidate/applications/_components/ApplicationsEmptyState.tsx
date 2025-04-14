'use client'

import Link from 'next/link'
import { FileSearch, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ApplicationsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white/70 backdrop-blur-md rounded-xl border border-[rgba(255,255,255,0.3)] shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
      <div className="w-16 h-16 rounded-full bg-[#4a6cfa]/10 flex items-center justify-center mb-6">
        <FileSearch className="w-8 h-8 text-[#4a6cfa]" />
      </div>
      
      <h3 className="text-xl font-semibold text-[#1a1e2d] mb-2">No Applications Yet</h3>
      
      <p className="text-[#9aa3bc] max-w-md mb-6">
        You haven't applied to any jobs yet. Browse available job listings and 
        submit your first application to get started on your career journey.
      </p>
      
      <Link href="/jobs" passHref>
        <Button className="bg-[#4a6cfa] hover:bg-[#3a5be9] text-white group">
          Browse Available Jobs
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>
    </div>
  )
} 