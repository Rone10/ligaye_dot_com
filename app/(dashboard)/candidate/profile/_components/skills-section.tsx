'use client'

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skill } from '@/lib/db/schema';
import { updateSkills, fetchAvailableSkills } from '../_actions';
import { useToast } from '@/hooks/use-toast';
import { skillsSchema } from '../_utils/validation';
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillsSectionProps {
  candidateSkills: (Skill & { candidateSkillId: string })[];
  candidateProfileId?: string;
}

export default function SkillsSection({ candidateSkills, candidateProfileId }: SkillsSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load available skills
  useEffect(() => {
    const loadSkills = async () => {
      setIsLoading(true);
      try {
        // Call the server action to fetch skills
        const result = await fetchAvailableSkills();
        if (result.success && result.skills) {
          setAvailableSkills(result.skills);
        } else {
          throw new Error(result.error || 'Failed to load skills');
        }
      } catch (error: any) {
        console.error('Failed to load skills:', error);
        toast({
          title: "Error",
          description: "Failed to load available skills. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSkills();
  }, [toast]);

  // Define form with React Hook Form
  const form = useForm<z.infer<typeof skillsSchema>>({
    resolver: zodResolver(skillsSchema),
    defaultValues: {
      skills: candidateSkills.map(skill => skill.id),
    },
  });

  // Find skill by ID
  const getSkillName = (id: string) => {
    const skill = availableSkills.find(s => s.id === id);
    return skill ? skill.name : 'Unknown Skill';
  };

  // Remove a skill from selection
  const removeSkill = (id: string) => {
    const currentSkills = form.getValues('skills');
    const updatedSkills = currentSkills.filter(skillId => skillId !== id);
    form.setValue('skills', updatedSkills, { shouldValidate: true });
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof skillsSchema>) => {
    if (!candidateProfileId) return;
    
    setIsSubmitting(true);
    try {
      // Create FormData for server action
      const formData = new FormData();
      
      // Add selected skills to FormData
      data.skills.forEach(skillId => {
        formData.append('skills', skillId);
      });
      
      // Add candidate profile ID
      formData.append('candidateProfileId', candidateProfileId);
      
      // Call server action to update skills
      const result = await updateSkills(formData);
      
      if (result.success) {
        toast({
          title: "Skills updated",
          description: "Your skills have been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Failed to update skills:', error);
      toast({
        title: "Error",
        description: "Failed to update your skills. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Skills</h3>
        <p className="text-sm text-muted-foreground">
          Add skills to your profile to help employers find you.
        </p>
      </div>

      {!candidateProfileId && (
        <div className="bg-muted/40 rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Please complete your basic profile information before adding skills.
          </p>
        </div>
      )}

      {candidateProfileId && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Skills</FormLabel>
                  <FormDescription>
                    Select skills that showcase your expertise.
                  </FormDescription>
                  <div className="flex flex-col space-y-4">
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="justify-between w-full"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              "Loading skills..."
                            ) : (
                              <>
                                Select skills
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-full" align="start">
                        <Command>
                          <CommandInput placeholder="Search skills..." />
                          <CommandList>
                            <CommandEmpty>No skills found.</CommandEmpty>
                            <CommandGroup>
                              {availableSkills.map((skill) => {
                                const isSelected = field.value.includes(skill.id);
                                return (
                                  <CommandItem
                                    key={skill.id}
                                    value={skill.name}
                                    onSelect={() => {
                                      const updatedValue = isSelected
                                        ? field.value.filter(id => id !== skill.id)
                                        : [...field.value, skill.id];
                                      
                                      form.setValue('skills', updatedValue, { shouldValidate: true });
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        isSelected ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {skill.name}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {/* Selected skills display */}
                    {field.value.length > 0 && (
                      <Card className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((skillId) => (
                            <Badge 
                              key={skillId} 
                              variant="secondary"
                              className="flex items-center gap-1 px-3 py-1"
                            >
                              {getSkillName(skillId)}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => removeSkill(skillId)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Skills"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
} 