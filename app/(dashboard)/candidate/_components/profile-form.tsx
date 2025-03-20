"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { updateProfile } from "@/app/actions/candidate/profile"
import { Separator } from "@/components/ui/separator"

// Form schema matching the profileUpdateSchema in the server action
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }).max(100, {
    message: "Title must not exceed 100 characters."
  }),
  experienceLevel: z.enum(["Entry", "Junior", "Mid-Level", "Senior", "Director", "Executive"], {
    message: "Please select a valid experience level."
  }),
  skills: z.string().min(3, {
    message: "Please enter at least one skill (comma separated)."
  }),
  bio: z.string().max(500, {
    message: "Bio must not exceed 500 characters."
  }).optional(),
  linkedinUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  githubUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

type ProfileFormProps = {
  profile: any; // Type will be refined in a real implementation
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)

  // Initialize form with existing profile data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: profile?.candidateProfile?.title || "",
      experienceLevel: profile?.candidateProfile?.experienceLevel || "Entry",
      skills: profile?.candidateProfile?.skills?.join(", ") || "",
      bio: profile?.candidateProfile?.bio || "",
      linkedinUrl: profile?.candidateProfile?.linkedinUrl || "",
      githubUrl: profile?.candidateProfile?.githubUrl || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Create FormData object for file upload
      const formData = new FormData()
      formData.append("title", values.title)
      formData.append("experienceLevel", values.experienceLevel)
      formData.append("skills", values.skills)
      
      if (values.bio) formData.append("bio", values.bio)
      
      // Ensure linkedinUrl and githubUrl are always sent as strings (empty string if falsy)
      formData.append("linkedinUrl", values.linkedinUrl || "")
      formData.append("githubUrl", values.githubUrl || "")
      
      // Add resume file if selected
      if (resumeFile) formData.append("resume", resumeFile)

      // Submit form
      const result = await updateProfile(formData)
      
      if (result.success) {
        toast.success("Profile updated successfully")
        
        // Refresh the page to show updated data
        router.refresh()
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle resume file selection
  function handleResumeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null
    setResumeFile(file)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Candidate Profile</CardTitle>
        <CardDescription>
          Update your professional profile to help employers find you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Senior Software Engineer" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your current job title or professional role.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="Entry">Entry Level</SelectItem>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                        <SelectItem value="Director">Director</SelectItem>
                        <SelectItem value="Executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Your professional experience level.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. JavaScript, React, Node.js, TypeScript (comma separated)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      List your skills separated by commas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell employers about yourself..."
                        className="resize-none min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Brief professional summary (max 500 characters).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Profiles</h3>
                
                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="githubUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/yourusername" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Resume</h3>
                <div className="grid gap-2">
                  <FormLabel htmlFor="resume">Upload Resume</FormLabel>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                  />
                  <p className="text-sm text-muted-foreground">
                    Accepted formats: PDF, DOC, DOCX (max 5MB)
                  </p>
                </div>

                {profile?.candidateProfile?.resumeUrl && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>Current resume:</span>
                    <a 
                      href={profile.candidateProfile.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View resume
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 