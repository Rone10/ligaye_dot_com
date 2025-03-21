'use client';

import { useState, useEffect } from 'react';
import { MultiSelect } from '@/components/ui/multi-select';
import { getAllSkills } from '@/app/actions/skills';
import type { Option } from '@/components/ui/multi-select';

interface Skill {
  id: string;
  name: string;
  proficiency?: string;
}

interface SkillsSelectProps {
  selectedSkills: Skill[];
  onChange: (skills: Skill[]) => void;
  withProficiency?: boolean;
}

export function SkillsSelect({ selectedSkills = [], onChange, withProficiency = false }: SkillsSelectProps) {
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [skillProficiencies, setSkillProficiencies] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Load all skills from the database using server action
    async function loadSkills() {
      try {
        const skills = await getAllSkills();
        setAvailableSkills(skills);
      } catch (error) {
        console.error('Failed to load skills:', error);
      }
    }
    
    loadSkills();
  }, []);
  
  // Initialize proficiencies from selectedSkills if available
  useEffect(() => {
    if (withProficiency && selectedSkills.length > 0) {
      const proficiencies: Record<string, string> = {};
      selectedSkills.forEach(skill => {
        if (skill.proficiency) {
          proficiencies[skill.id] = skill.proficiency;
        }
      });
      setSkillProficiencies(proficiencies);
    }
  }, [selectedSkills, withProficiency]);
  
  // Handle skill selection changes
  const handleSkillChange = (newSkills: Skill[]) => {
    onChange(newSkills.map(skill => ({
      id: skill.id,
      name: skill.name,
      ...(withProficiency && { proficiency: skillProficiencies[skill.id] || 'intermediate' })
    })));
  };
  
  // Handle proficiency changes
  const handleProficiencyChange = (skillId: string, proficiency: string) => {
    const newProficiencies = {
      ...skillProficiencies,
      [skillId]: proficiency
    };
    setSkillProficiencies(newProficiencies);
    
    // Update selected skills with new proficiency
    const updatedSkills = selectedSkills.map(skill => 
      skill.id === skillId 
        ? { ...skill, proficiency } 
        : skill
    );
    onChange(updatedSkills);
  };
  
  return (
    <div className="space-y-4">
      <MultiSelect
        options={availableSkills.map(skill => ({
          value: skill.id,
          label: skill.name
        }))}
        value={selectedSkills.map(skill => ({
          value: skill.id,
          label: skill.name
        }))}
        onChange={(values: Option[]) => handleSkillChange(values.map(v => ({
          id: v.value,
          name: v.label
        })))}
        placeholder="Select skills"
      />
      
      {withProficiency && selectedSkills.length > 0 && (
        <div className="space-y-2 mt-4">
          <h4 className="text-sm font-medium">Skill Proficiency</h4>
          {selectedSkills.map(skill => (
            <div key={skill.id} className="flex items-center gap-2">
              <span className="text-sm flex-1">{skill.name}</span>
              <select 
                value={skillProficiencies[skill.id] || 'intermediate'}
                onChange={e => handleProficiencyChange(skill.id, e.target.value)}
                className="flex-1 p-1 text-sm border rounded"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 