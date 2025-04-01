'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CandidateProfile, Profile } from '@/lib/db/schema';
import { profileSchema } from '../_utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateBasicProfileInfo } from '../_actions';
import { toast } from 'sonner';
import { useState } from 'react';
import { experienceLevelEnum } from '@/lib/db/schema';

interface BasicInfoSectionProps {
  initialData?: CandidateProfile;
  profile?: Profile;
}

export default function BasicInfoSection({ initialData, profile }: BasicInfoSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define form with React Hook Form
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      title: initialData?.title || '',
      bio: initialData?.bio || '',
      linkedinUrl: initialData?.linkedinUrl || '',
      githubUrl: initialData?.githubUrl || '',
      portfolioUrl: initialData?.portfolioUrl || '',
      experienceLevel: initialData?.experienceLevel || undefined,
    },
  });

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    setIsSubmitting(true);
    try {
      // Create FormData for server action
      const formData = new FormData();
      
      // Add form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      
      // Call server action to update profile
      const result = await updateBasicProfileInfo(formData);
      
      if (result.success) {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Basic Information</h3>
        <p className="text-sm text-gray-500">
          This information will be displayed on your profile.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* User's full name (non-editable here) */}
          <div className="space-y-2">
            <label className="font-medium text-sm">Full Name</label>
            <Input
              value={profile?.fullName || ''}
              disabled
              className="bg-muted/50"
            />
            <p className="text-xs text-muted-foreground">
              Your full name cannot be changed here.
            </p>
          </div>

          {/* Professional Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professional Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Software Engineer" {...field} />
                </FormControl>
                <FormDescription>
                  Your professional title or role that will be displayed on your profile.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Experience Level */}
          <FormField
            control={form.control}
            name="experienceLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Level</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {experienceLevelEnum.enumValues.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Your level of professional experience.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bio */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Write a brief description about yourself and your professional background..." 
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  A short bio about yourself that will be displayed on your profile.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* LinkedIn URL */}
          <FormField
            control={form.control}
            name="linkedinUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://www.linkedin.com/in/yourprofile" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Link to your LinkedIn profile.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* GitHub URL */}
          <FormField
            control={form.control}
            name="githubUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://github.com/yourusername" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Link to your GitHub profile.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Portfolio URL */}
          <FormField
            control={form.control}
            name="portfolioUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Portfolio URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://your-portfolio.com" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Link to your personal website or portfolio.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </div>
  );
} 