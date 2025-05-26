'use client'

import Link from 'next/link'
import { FileSearch, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ApplicationsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center glass-card">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <FileSearch className="w-8 h-8 text-primary" />
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">No Applications Yet</h3>
      
      <p className="text-muted-foreground max-w-md mb-6">
        You haven&apos;t applied to any jobs yet. Browse available job listings and 
        submit your first application to get started on your career journey.
      </p>
      
      <Link href="/jobs" passHref>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground group">
          Browse Available Jobs
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>
    </div>
  )
} 