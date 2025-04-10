'use client'

import { useState, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { experienceLevelEnum } from '@/lib/db/schema'
import { ArrowLeft, ArrowRight, Plus, X, ChevronsUpDown, Check } from 'lucide-react'
import { JobFormValues } from '../../_utils/validation'
import { cn } from '@/lib/utils'
import { getAllSkills, getAllIndustries } from '../../_queries'
import { Editor } from '@/components/RichTextEditor/editor'

interface RequirementsStepProps {
  form: UseFormReturn<JobFormValues>
  onNext: () => void
  onPrevious: () => void
}

interface Skill {
  id: string
  name: string
}

interface Industry {
  id: string
  name: string
}

export default function RequirementsStep({ form, onNext, onPrevious }: RequirementsStepProps) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [industries, setIndustries] = useState<Industry[]>([])
  const [skillsOpen, setSkillsOpen] = useState(false)
  const [industriesOpen, setIndustriesOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch real data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch skills and industries in parallel
        const [skillsData, industriesData] = await Promise.all([
          getAllSkills(),
          getAllIndustries()
        ]);
        
        setSkills(skillsData);
        setIndustries(industriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const [tempLanguage, setTempLanguage] = useState('')
  
  const handleAddLanguage = () => {
    if (tempLanguage.trim()) {
      const current = form.getValues('languageRequirements') || []
      form.setValue('languageRequirements', [...current, tempLanguage.trim()])
      setTempLanguage('')
    }
  }
  
  const handleRemoveLanguage = (index: number) => {
    const current = form.getValues('languageRequirements') || []
    form.setValue('languageRequirements', current.filter((_, i) => i !== index))
  }
  
  const handleNext = () => {
    // Re-enable proper validation
    const requirementsFieldsValid = form.trigger([
      'experienceLevel',
      'skillIds',
      'industryIds',
      'educationRequirementsRichText',
      'experienceRequirementsRichText'
    ])
    
    requirementsFieldsValid.then(isValid => {
      if (isValid) {
        onNext()
      }
    })
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 text-[#1a1e2d]">Requirements & Qualifications</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="experienceLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience Level</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {experienceLevelEnum.enumValues.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The level of experience required for this role
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="educationRequirementsRichText"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Education Requirements</FormLabel>
            <FormControl>
              <Editor
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormDescription>
              Describe the educational qualifications required for this role
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="experienceRequirementsRichText"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Experience Requirements</FormLabel>
            <FormControl>
              <Editor
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormDescription>
              Describe the experience requirements for this role
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="skillIds"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Required Skills</FormLabel>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {field.value.map(skillId => {
                const skill = skills.find(s => s.id === skillId)
                return skill ? (
                  <Badge key={skill.id} variant="secondary" className="flex items-center gap-1">
                    {skill.name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => field.onChange(field.value.filter(id => id !== skillId))}
                    />
                  </Badge>
                ) : null
              })}
            </div>
            
            <Popover open={skillsOpen} onOpenChange={setSkillsOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={skillsOpen}
                    className="justify-between"
                    disabled={isLoading}
                  >
                    {isLoading 
                      ? "Loading skills..." 
                      : field.value.length > 0 
                        ? `${field.value.length} skill${field.value.length > 1 ? 's' : ''} selected`
                        : "Select skills..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search skills..." />
                  <CommandList>
                    <CommandEmpty>No skills found.</CommandEmpty>
                    <CommandGroup>
                      {skills
                        .filter(skill => !field.value.includes(skill.id))
                        .map(skill => (
                          <CommandItem
                            key={skill.id}
                            value={skill.name}
                            onSelect={() => {
                              const newValue = [...field.value, skill.id];
                              field.onChange(newValue);
                              setSkillsOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value.includes(skill.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {skill.name}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            <FormDescription>
              Select the skills required for this position
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="industryIds"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Job Industries</FormLabel>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {field.value.map(industryId => {
                const industry = industries.find(i => i.id === industryId)
                return industry ? (
                  <Badge key={industry.id} variant="secondary" className="flex items-center gap-1">
                    {industry.name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => field.onChange(field.value.filter(id => id !== industryId))}
                    />
                  </Badge>
                ) : null
              })}
            </div>
            
            <Popover open={industriesOpen} onOpenChange={setIndustriesOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={industriesOpen}
                    className="justify-between"
                    disabled={isLoading}
                  >
                    {isLoading 
                      ? "Loading industries..." 
                      : field.value.length > 0 
                        ? `${field.value.length} industr${field.value.length > 1 ? 'ies' : 'y'} selected`
                        : "Select industries..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search industries..." />
                  <CommandList>
                    <CommandEmpty>No industries found.</CommandEmpty>
                    <CommandGroup>
                      {industries
                        .filter(industry => !field.value.includes(industry.id))
                        .map(industry => (
                          <CommandItem
                            key={industry.id}
                            value={industry.name}
                            onSelect={() => {
                              const newValue = [...field.value, industry.id];
                              field.onChange(newValue);
                              setIndustriesOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value.includes(industry.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {industry.name}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            <FormDescription>
              Select industries relevant to this job
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="space-y-4">
        <FormLabel>Language Requirements</FormLabel>
        <div className="flex flex-wrap gap-2 mb-2">
          {form.watch('languageRequirements')?.map((language, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {language}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleRemoveLanguage(index)} 
              />
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input 
            value={tempLanguage} 
            onChange={(e) => setTempLanguage(e.target.value)}
            placeholder="e.g. Fluent English" 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddLanguage()
              }
            }}
          />
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={handleAddLanguage}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <FormDescription>
          Add language requirements for this role
        </FormDescription>
      </div>
      
      <FormField
        control={form.control}
        name="languageTrainingProvided"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Language Training Provided</FormLabel>
              <FormDescription>
                Will you provide language training to candidates?
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <div className="flex justify-between mt-8">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button 
          type="button" 
          onClick={handleNext}
          className="bg-[#4a6cfa] hover:bg-[#7b90ff] transition-colors duration-300 flex items-center"
        >
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 