'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useJobForm } from "./JobFormProvider";
import { db } from '@/lib/db';

export function SaveDraftButton() {
  const { state } = useJobForm();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const saveDraft = async () => {
    try {
      setIsSaving(true);
      
      // Save draft logic will be expanded later
      // This is a simplified version that just shows a toast
      
      // Simulate saving to database
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Draft saved",
        description: "Your job posting draft has been saved",
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error saving draft",
        description: "There was an error saving your draft",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Button 
      variant="ghost" 
      onClick={saveDraft}
      disabled={isSaving}
      type="button"
    >
      {isSaving ? 'Saving...' : 'Save draft'}
    </Button>
  );
} 