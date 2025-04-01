'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Experience } from '@/lib/db/schema';
import { experienceSchema } from '../_utils/validation';
import { transformExperienceForForm } from '../_utils/profile-transformers';
import { addExperience, updateExperience } from '../_actions';
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface ExperienceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateProfileId: string;
  experience?: Experience;
}

export default function ExperienceFormDialog({
  open,
  onOpenChange,
  candidateProfileId,
  experience
}: ExperienceFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!experience;


  // Define form with React Hook Form
  const form = useForm<z.infer<typeof experienceSchema>>({
    resolver: zodResolver(experienceSchema),
    defaultValues: experience 
      ? {
          ...transformExperienceForForm(experience),
          // Explicitly handle null from DB type and convert to undefined for the form schema
          isCurrent: experience.isCurrent ?? undefined, 
        }
      : {
          jobTitle: '',
          companyName: '',
          location: '',
          startDate: new Date(),
          endDate: null,
          description: '',
        },
  });

  // Watch isCurrent field to disable endDate when true
  const isCurrent = form.watch('isCurrent');

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof experienceSchema>) => {
    setIsSubmitting(true);
    try {
      // Create FormData for server action
      const formData = new FormData();
      
      // Add form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'isCurrent') {
            formData.append(key, value ? 'true' : 'false');
          } else {
            formData.append(key, value as string);
          }
        }
      });
      
      // Add candidate profile ID
      formData.append('candidateProfileId', candidateProfileId);
      
      // If editing, add ID
      if (isEditing && experience) {
        formData.append('id', experience.id);
      }
      
      // Call server action to add or update experience
      const result = isEditing 
        ? await updateExperience(formData)
        : await addExperience(formData);
      
      if (result.success) {
        toast.success(`${isEditing ? 'Experience updated' : 'Experience added'} successfully`);
        onOpenChange(false);
        form.reset();
      }
    } catch (error) {
      console.error('Failed to save experience:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} work experience. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Job Title */}
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Company Name */}
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Ligaye Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Banjul, The Gambia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Start Date */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input 
                      key={`start-date-${isEditing ? 'edit' : 'add'}-${experience?.id ?? 'new'}`}
                      type="date" 
                      name={field.name}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(e.target.valueAsDate ?? null)}
                      disabled={field.disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Current Position Checkbox */}
            <FormField
              control={form.control}
              name="isCurrent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Current Position</FormLabel>
                    <FormDescription>
                      Check this if you currently work in this position
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {/* End Date */}
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input 
                      key={`end-date-${isEditing ? 'edit' : 'add'}-${experience?.id ?? 'new'}`}
                      type="date" 
                      name={field.name}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(e.target.valueAsDate ?? null)}
                      disabled={isCurrent ?? field.disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your responsibilities, achievements, and skills used..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? "Saving..." 
                  : isEditing 
                    ? "Save Changes" 
                    : "Add Experience"
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 