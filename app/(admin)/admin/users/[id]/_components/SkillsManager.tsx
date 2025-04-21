"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { X, Check, ChevronsUpDown, Plus } from "lucide-react";
import { updateCandidateSkillsAdmin } from "../_actions";
import { Skill } from "@/lib/db/schema";
import { toast } from "sonner";

interface SkillsManagerProps {
  candidateSkills: Array<Skill & { candidateSkillId: string }>;
  availableSkills: Skill[];
  candidateProfileId: string | undefined;
  profileId: string;
}

export function SkillsManager({ 
  candidateSkills, 
  availableSkills, 
  candidateProfileId, 
  profileId 
}: SkillsManagerProps) {
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(candidateSkills);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  
  // Filter out skills that are already selected
  const availableToSelect = availableSkills.filter(
    (skill) => !selectedSkills.some((selected) => selected.id === skill.id)
  );
  
  const handleSaveSkills = async () => {
    if (!candidateProfileId) {
      toast.error("Cannot update: Candidate profile ID not found");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("candidateProfileId", candidateProfileId);
      formData.append("profileId", profileId);
      
      // Add all selected skill IDs
      selectedSkills.forEach((skill) => {
        formData.append("skillIds", skill.id);
      });
      
      const result = await updateCandidateSkillsAdmin(formData);
      
      if (result.success) {
        toast.success("Skills updated successfully");
      } else {
        toast.error("Failed to update skills");
      }
    } catch (error) {
      console.error("Error updating skills:", error);
      toast.error("An error occurred while updating skills");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const addSkill = (skill: Skill) => {
    setSelectedSkills([...selectedSkills, skill]);
    setCommandOpen(false);
  };
  
  const removeSkill = (skillId: string) => {
    setSelectedSkills(selectedSkills.filter((skill) => skill.id !== skillId));
  };
  
  if (!candidateProfileId) {
    return (
      <div className="p-4 bg-amber-50 text-amber-800 rounded-md">
        No candidate profile data available. The user might need to complete their profile setup.
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {selectedSkills.length} skill{selectedSkills.length !== 1 ? "s" : ""} selected
        </div>
        
        <div className="flex items-center gap-2">
          <Popover open={commandOpen} onOpenChange={setCommandOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Skill</span>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="end" side="bottom">
              <Command>
                <CommandInput placeholder="Search skills..." />
                <CommandList>
                  <CommandEmpty>No skills found</CommandEmpty>
                  <CommandGroup>
                    {availableToSelect.map((skill) => (
                      <CommandItem
                        key={skill.id}
                        value={skill.name}
                        onSelect={() => addSkill(skill)}
                      >
                        {skill.name}
                        <Check
                          className="ml-auto h-4 w-4 opacity-0"
                          aria-hidden="true"
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          <Button 
            onClick={handleSaveSkills}
            disabled={isSubmitting}
            size="sm"
          >
            {isSubmitting ? "Saving..." : "Save Skills"}
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {selectedSkills.length === 0 ? (
          <div className="text-sm text-gray-500 py-2">
            No skills selected. Add skills using the button above.
          </div>
        ) : (
          selectedSkills.map((skill) => (
            <Badge 
              variant="secondary" 
              key={skill.id}
              className="flex items-center gap-1 p-2"
            >
              {skill.name}
              <button
                type="button"
                onClick={() => removeSkill(skill.id)}
                className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {skill.name}</span>
              </button>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
} 