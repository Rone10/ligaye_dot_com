"use client"

import { useState, useTransition } from 'react'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { purgeAllCaches } from '../_actions'
import { useToast } from '@/hooks/use-toast'

export function CachePurgeCard() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await purgeAllCaches()

      if (result.success) {
        toast({
          title: 'Caches purged',
          description: 'All server caches and key dashboard routes were revalidated.'
        })
        setOpen(false)
        return
      }

      toast({
        variant: 'destructive',
        title: 'Failed to purge caches',
        description: result.error || 'An unexpected error occurred.'
      })
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-destructive/10 p-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Cache Management</CardTitle>
            <CardDescription>
              Force a full reset of cached server data and revalidate critical dashboards.
              Use this only if you suspect stale information is stuck in the system.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isPending}>
              Purge all caches
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear every cache?</AlertDialogTitle>
              <AlertDialogDescription>
                This will invalidate all known cache tags and revalidate admin, employer, and
                candidate dashboards. It can momentarily slow the site for all users. Continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
                {isPending ? 'Purging…' : 'Yes, purge caches'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
