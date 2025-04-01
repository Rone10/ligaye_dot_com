'use client'

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import BasicInfoSection from './basic-info-section';
import EducationSection from './education-section';
import ExperienceSection from './experience-section';
import SkillsSection from './skills-section';
import ResumeUpload from './resume-upload';
import { CandidateProfileData } from '../_queries';

interface ProfileFormProps {
  initialData?: CandidateProfileData;
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [activeTab, setActiveTab] = useState('basic');

  return (
    <Card className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-muted/20 p-0 h-auto flex-wrap rounded-none border-b">
          <TabsTrigger 
            value="basic" 
            className="py-3 px-5 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            Basic Info
          </TabsTrigger>
          <TabsTrigger 
            value="education" 
            className="py-3 px-5 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            Education
          </TabsTrigger>
          <TabsTrigger 
            value="experience" 
            className="py-3 px-5 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            Experience
          </TabsTrigger>
          <TabsTrigger 
            value="skills" 
            className="py-3 px-5 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            Skills
          </TabsTrigger>
          <TabsTrigger 
            value="resume" 
            className="py-3 px-5 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            Resume
          </TabsTrigger>
        </TabsList>
        
        <div className="p-6">
          <TabsContent value="basic" className="mt-0">
            <BasicInfoSection 
              initialData={initialData?.candidateProfile || undefined} 
              profile={initialData?.profile}
            />
          </TabsContent>
          
          <TabsContent value="education" className="mt-0">
            <EducationSection 
              education={initialData?.education || []} 
              candidateProfileId={initialData?.candidateProfile?.id}
            />
          </TabsContent>
          
          <TabsContent value="experience" className="mt-0">
            <ExperienceSection 
              experience={initialData?.experience || []} 
              candidateProfileId={initialData?.candidateProfile?.id}
            />
          </TabsContent>
          
          <TabsContent value="skills" className="mt-0">
            <SkillsSection 
              candidateSkills={initialData?.skills || []} 
              candidateProfileId={initialData?.candidateProfile?.id}
            />
          </TabsContent>
          
          <TabsContent value="resume" className="mt-0">
            <ResumeUpload 
              resumeUrl={initialData?.candidateProfile?.resumeUrl} 
              resumeFilename={initialData?.candidateProfile?.resumeFilename} 
            />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
} 