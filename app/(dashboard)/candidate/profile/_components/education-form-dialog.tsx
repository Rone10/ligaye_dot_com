'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Education } from '@/lib/db/schema';
import { educationSchema } from '../_utils/validation';
import { transformEducationForForm } from '../_utils/profile-transformers';
import { addEducation, updateEducation } from '../_actions';
import { toast } from 'sonner';
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

interface EducationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateProfileId: string;
  education?: Education;
}

export default function EducationFormDialog({
  open,
  onOpenChange,
  candidateProfileId,
  education
}: EducationFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!education;

  // Define form with React Hook Form
  const form = useForm<z.infer<typeof educationSchema>>({
    resolver: zodResolver(educationSchema),
    defaultValues: education
      ? (() => {
          const transformed = transformEducationForForm(education);
          return {
            ...transformed,
            startDate: transformed.startDate ? new Date(transformed.startDate) : new Date(),
            endDate: transformed.endDate ? new Date(transformed.endDate) : null,
            fieldOfStudy: transformed.fieldOfStudy ?? undefined,
            description: transformed.description ?? undefined,
          };
        })()
      : {
          institution: '',
          degree: '',
          fieldOfStudy: '',
          startDate: new Date(),
          endDate: null,
          description: '',
        },
  });

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof educationSchema>) => {
    setIsSubmitting(true);
    try {
      // Create FormData for server action
      const formData = new FormData();
      
      // Add form fields to FormData, converting Dates to ISO strings
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const valueToAppend = value instanceof Date ? value.toISOString() : value;
          formData.append(key, String(valueToAppend));
        } else if (key === 'endDate' && value === null) {
          // Explicitly handle null endDate if needed by the backend, otherwise omit
          // formData.append(key, ''); // Or however the backend expects null
        }
      });
      
      // Add candidate profile ID
      formData.append('candidateProfileId', candidateProfileId);
      
      // If editing, add ID
      if (isEditing && education) {
        formData.append('id', education.id);
      }
      
      // Call server action to add or update education
      const result = isEditing 
        ? await updateEducation(formData)
        : await addEducation(formData);
      
      if (result.success) {
        toast.success(`${isEditing ? 'Education updated' : 'Education added'} successfully`);
        onOpenChange(false);
        form.reset();
      }
    } catch (error) {
      console.error('Failed to save education:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} education details. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Education' : 'Add Education'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Institution */}
            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. University of The Gambia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Degree */}
            <FormField
              control={form.control}
              name="degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Degree</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Bachelor of Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Field of Study */}
            <FormField
              control={form.control}
              name="fieldOfStudy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field of Study</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Computer Science" {...field} />
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
                      key={`start-date-${isEditing ? 'edit' : 'add'}-${education?.id ?? 'new'}`}
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
            
            {/* End Date */}
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>End Date</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="current-education"
                        checked={field.value === null || field.value === undefined}
                        onCheckedChange={(checked) => {
                          field.onChange(checked ? null : new Date());
                        }}
                      />
                      <Label htmlFor="current-education" className="text-sm font-normal">
                        Currently studying
                      </Label>
                    </div>
                  </div>
                  <FormControl>
                    <Input 
                      key={`end-date-${isEditing ? 'edit' : 'add'}-${education?.id ?? 'new'}`}
                      type="date" 
                      name={field.name}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(e.target.valueAsDate ?? null)}
                      disabled={field.value === null || field.value === undefined}
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
                      placeholder="Add details about your studies, achievements, etc."
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
                    : "Add Education"
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 