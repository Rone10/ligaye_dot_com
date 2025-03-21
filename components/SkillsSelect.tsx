'use client';

import { useState, useEffect } from 'react';
import { getAllSkills } from '@/app/actions/skills';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, X, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';

interface Skill {
  id: string;
  name: string;
}

interface SkillsSelectProps {
  selectedSkills?: Skill[];
  onChange: (skills: Skill[]) => void;
}

export function SkillsSelect({ selectedSkills = [], onChange }: SkillsSelectProps) {
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [open, setOpen] = useState(false);
  
  // Ensure selectedSkills is always an array
  const safeSelectedSkills = Array.isArray(selectedSkills) ? selectedSkills : [];
  
  useEffect(() => {
    // Load all skills from the database using server action
    async function loadSkills() {
      try {
        const skills = await getAllSkills();
        // Ensure we're setting a valid array, and filter out any invalid items
        const validSkills = Array.isArray(skills) 
          ? skills.filter(skill => skill && typeof skill === 'object' && 'id' in skill && 'name' in skill) 
          : [];
        setAvailableSkills(validSkills);
      } catch (error) {
        console.error('Failed to load skills:', error);
        setAvailableSkills([]);
      }
    }
    
    loadSkills();
  }, []);
  
  // Handle skill selection changes
  const handleSkillChange = (skillId: string) => {
    const skillExists = safeSelectedSkills.some(skill => skill && skill.id === skillId);
    
    if (skillExists) {
      // Remove skill
      onChange(safeSelectedSkills.filter(skill => skill && skill.id !== skillId));
    } else {
      // Add skill
      const skillToAdd = availableSkills.find(skill => skill && skill.id === skillId);
      if (skillToAdd) {
        onChange([
          ...safeSelectedSkills, 
          {
            id: skillToAdd.id,
            name: skillToAdd.name
          }
        ]);
      }
    }
  };
  
  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {safeSelectedSkills.length > 0
              ? `${safeSelectedSkills.length} skill${safeSelectedSkills.length > 1 ? 's' : ''} selected`
              : "Select skills"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        {open && (
          <PopoverContent className="w-full p-0">
            <div className="w-full border-none outline-none">
              <div className="flex w-full items-center border-b px-3">
                <input
                  className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Search skills..."
                />
              </div>
              {!availableSkills?.length && (
                <div className="py-6 text-center text-sm">No skills found.</div>
              )}
              <div className="max-h-64 overflow-auto">
                {availableSkills && availableSkills.length > 0 ? (
                  <div>
                    {availableSkills.map((skill) => (
                      skill && skill.id ? (
                        <div
                          key={skill.id}
                          className={cn(
                            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground",
                            safeSelectedSkills.some(s => s && s.id === skill.id) ? "bg-accent text-accent-foreground" : ""
                          )}
                          onClick={() => {
                            handleSkillChange(skill.id);
                          }}
                        >
                          <span className={cn(
                            "absolute left-2 flex h-3.5 w-3.5 items-center justify-center rounded-sm border border-primary/70",
                            safeSelectedSkills.some(s => s && s.id === skill.id) 
                              ? "bg-primary text-primary-foreground" 
                              : "opacity-0"
                          )}>
                            <Check className="h-4 w-4" />
                          </span>
                          <span className="ml-6">{skill.name}</span>
                        </div>
                      ) : null
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-sm">Loading skills...</div>
                )}
              </div>
            </div>
          </PopoverContent>
        )}
      </Popover>
      
      {safeSelectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {safeSelectedSkills
            .filter((skill): skill is Skill => Boolean(skill && skill.id && skill.name))
            .map((skill) => (
              <Badge key={skill.id} variant="secondary" className="flex items-center gap-1">
                {skill.name}
                <button
                  type="button"
                  className="ml-1 rounded-full outline-none"
                  onClick={() => handleSkillChange(skill.id)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
} 