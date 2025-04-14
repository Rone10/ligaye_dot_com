'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'

export function EmptySavedJobs() {
  return (
    <EmptyState
      title="No saved jobs"
      description="You haven't saved any jobs yet. Browse jobs and save the ones you're interested in."
      icon="Bookmark"
    >
      <Button asChild>
        <Link href="/jobs">
          Browse Jobs
        </Link>
      </Button>
    </EmptyState>
  )
} 