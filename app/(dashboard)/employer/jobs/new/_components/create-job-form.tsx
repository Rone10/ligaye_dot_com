"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createJob } from "@/app/actions/employer/jobs";
import { Location } from "@/app/actions/employer/locations";
import { TipTapEditor } from "@/components/tiptap-editor";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// Types based on the database schema
type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY';
type WorkLocation = 'REMOTE' | 'HYBRID' | 'ON_SITE';
type SalaryFrequency = 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
type ExperienceLevel = 'Entry' | 'Junior' | 'Mid-Level' | 'Senior' | 'Director' | 'Executive';

// Form schema
const formSchema = z.object({
  title: z.string().min(5, {
    message: "Job title must be at least 5 characters.",
  }),
  description: z.string().min(50, {
    message: "Job description must be at least 50 characters.",
  }),
  locationId: z.string().optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY']),
  workLocation: z.enum(['REMOTE', 'HYBRID', 'ON_SITE']),
  experienceLevel: z.enum(['Entry', 'Junior', 'Mid-Level', 'Senior', 'Director', 'Executive']),
  salaryFrequency: z.enum(['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR']),
  salaryRangeMin: z.coerce.number().optional(),
  salaryRangeMax: z.coerce.number().optional(),
  salaryCurrency: z.string().default('GMD'),
  applicationDeadline: z.date().optional(),
});

interface CreateJobFormProps {
  locations: Location[];
}

export function CreateJobForm({ locations }: CreateJobFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [educationRequirements, setEducationRequirements] = useState<string[]>([]);
  const [educationInput, setEducationInput] = useState('');
  const [experienceRequirements, setExperienceRequirements] = useState<string[]>([]);
  const [experienceInput, setExperienceInput] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [benefitInput, setBenefitInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      jobType: "FULL_TIME",
      workLocation: "ON_SITE",
      experienceLevel: "Mid-Level",
      salaryFrequency: "MONTH",
      salaryCurrency: "GMD",
    },
  });

  // Add item to array fields
  const addItem = (value: string, list: string[], setList: (list: string[]) => void, setInput: (value: string) => void) => {
    if (value.trim() !== "" && !list.includes(value.trim())) {
      setList([...list, value.trim()]);
      setInput("");
    }
  };

  // Remove item from array fields
  const removeItem = (item: string, list: string[], setList: (list: string[]) => void) => {
    setList(list.filter((i) => i !== item));
  };

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    // Create form data for server action
    const formData = new FormData();
    
    // Add form values to formData
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'applicationDeadline' && value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    // Add array fields
    educationRequirements.forEach(item => {
      formData.append('educationRequirements', item);
    });
    
    experienceRequirements.forEach(item => {
      formData.append('experienceRequirements', item);
    });
    
    benefits.forEach(item => {
      formData.append('benefits', item);
    });
    
    skills.forEach(item => {
      formData.append('skillsRequired', item);
    });
    
    try {
      const response = await createJob(formData);
      
      if (response.success) {
        toast.success("Job created successfully!");
        router.push(`/employer/jobs`);
      } else {
        toast.error(response.error || "Failed to create job");
      }
    } catch (error) {
      toast.error("An error occurred while creating the job");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Senior Software Engineer" {...field} />
                    </FormControl>
                    <FormDescription>
                      The title of the job position you're hiring for.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <TipTapEditor
                        content={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed description of the job, responsibilities, and requirements.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FULL_TIME">Full Time</SelectItem>
                          <SelectItem value="PART_TIME">Part Time</SelectItem>
                          <SelectItem value="CONTRACT">Contract</SelectItem>
                          <SelectItem value="INTERNSHIP">Internship</SelectItem>
                          <SelectItem value="TEMPORARY">Temporary</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="workLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Location Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select work location type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="REMOTE">Remote</SelectItem>
                          <SelectItem value="HYBRID">Hybrid</SelectItem>
                          <SelectItem value="ON_SITE">On Site</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="locationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Physical Location</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name} ({location.region})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the physical location of the job (if applicable)
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
                          <SelectValue placeholder="Select experience level" />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium">Salary Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="salaryRangeMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Salary</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 3000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="salaryRangeMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Salary</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 5000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="salaryFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary Frequency</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="HOUR">Per Hour</SelectItem>
                            <SelectItem value="DAY">Per Day</SelectItem>
                            <SelectItem value="WEEK">Per Week</SelectItem>
                            <SelectItem value="MONTH">Per Month</SelectItem>
                            <SelectItem value="YEAR">Per Year</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium">Education Requirements</h3>
                <div className="flex items-center mt-2 space-x-2">
                  <Input
                    placeholder="e.g. Bachelor's in Computer Science"
                    value={educationInput}
                    onChange={(e) => setEducationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem(educationInput, educationRequirements, setEducationRequirements, setEducationInput);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => addItem(educationInput, educationRequirements, setEducationRequirements, setEducationInput)}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {educationRequirements.map((item, index) => (
                    <Badge key={index} variant="secondary" className="mr-1 mb-1">
                      {item}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2"
                        onClick={() => removeItem(item, educationRequirements, setEducationRequirements)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Experience Requirements</h3>
                <div className="flex items-center mt-2 space-x-2">
                  <Input
                    placeholder="e.g. 3+ years React development"
                    value={experienceInput}
                    onChange={(e) => setExperienceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem(experienceInput, experienceRequirements, setExperienceRequirements, setExperienceInput);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => addItem(experienceInput, experienceRequirements, setExperienceRequirements, setExperienceInput)}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {experienceRequirements.map((item, index) => (
                    <Badge key={index} variant="secondary" className="mr-1 mb-1">
                      {item}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2"
                        onClick={() => removeItem(item, experienceRequirements, setExperienceRequirements)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Skills Required</h3>
                <div className="flex items-center mt-2 space-x-2">
                  <Input
                    placeholder="e.g. JavaScript"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem(skillInput, skills, setSkills, setSkillInput);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => addItem(skillInput, skills, setSkills, setSkillInput)}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((item, index) => (
                    <Badge key={index} variant="secondary" className="mr-1 mb-1">
                      {item}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2"
                        onClick={() => removeItem(item, skills, setSkills)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Benefits</h3>
                <div className="flex items-center mt-2 space-x-2">
                  <Input
                    placeholder="e.g. Health Insurance"
                    value={benefitInput}
                    onChange={(e) => setBenefitInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem(benefitInput, benefits, setBenefits, setBenefitInput);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => addItem(benefitInput, benefits, setBenefits, setBenefitInput)}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {benefits.map((item, index) => (
                    <Badge key={index} variant="secondary" className="mr-1 mb-1">
                      {item}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2"
                        onClick={() => removeItem(item, benefits, setBenefits)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="applicationDeadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Application Deadline</FormLabel>
                    <FormControl>
                      <DatePicker 
                        date={field.value} 
                        setDate={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      The deadline for candidates to apply (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Job
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
} 