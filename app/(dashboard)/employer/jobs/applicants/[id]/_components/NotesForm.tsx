'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { updateApplicationNotes } from '../../_actions'

interface NotesFormProps {
  applicationId: string
  currentNotes: string | null
}

export default function NotesForm({ applicationId, currentNotes }: NotesFormProps) {
  const [notes, setNotes] = useState(currentNotes || '')
  const [isSaving, setIsSaving] = useState(false)
  
  const handleSaveNotes = async () => {
    if (notes === currentNotes) return
    
    setIsSaving(true)
    
    try {
      const result = await updateApplicationNotes(applicationId, notes)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Notes updated successfully')
      }
    } catch (error) {
      toast.error('Failed to update notes')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Interview Notes</h3>
      <p className="text-sm text-gray-500">
        Add your notes about this candidate for future reference.
      </p>
      
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add your notes here..."
        className="h-32"
      />
      
      <Button 
        onClick={handleSaveNotes}
        disabled={isSaving || notes === currentNotes}
      >
        {isSaving ? 'Saving...' : 'Save Notes'}
      </Button>
    </div>
  )
} 