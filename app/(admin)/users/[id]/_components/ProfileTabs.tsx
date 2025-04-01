"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicProfileForm } from "./BasicProfileForm";
import { CandidateProfileForm } from "./CandidateProfileForm";
import { EmployerProfileForm } from "./EmployerProfileForm";
import { SkillsManager } from "./SkillsManager";
import { EducationManager } from "./EducationManager";
import { ExperienceManager } from "./ExperienceManager";
import { ProfileStatusManager } from "./ProfileStatusManager";

interface ProfileTabsProps {
  userData: any; // Using any temporarily, should be properly typed
  profileId: string;
  availableSkills: any[];
  allIndustries: any[];
  allLocations: any[];
}

export function ProfileTabs({ 
  userData, 
  profileId, 
  availableSkills, 
  allIndustries, 
  allLocations 
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("basic");
  
  return (
    <Tabs 
      defaultValue="basic" 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        
        {/* Role-specific Tabs */}
        {userData.profile.role === "candidate" ? (
          <>
            <TabsTrigger value="candidate">Candidate Details</TabsTrigger>
            <TabsTrigger value="education-experience">Education & Experience</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </>
        ) : userData.profile.role === "employer" ? (
          <>
            <TabsTrigger value="employer">Company Details</TabsTrigger>
            <TabsTrigger value="jobs">Job Postings</TabsTrigger>
            <TabsTrigger value="status">Account Status</TabsTrigger>
          </>
        ) : (
          <>
            <TabsTrigger value="admin">Admin Details</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="status">Account Status</TabsTrigger>
          </>
        )}
      </TabsList>
      
      {/* Tab Contents */}
      <TabsContent value="basic" className="space-y-6">
        <h3 className="text-lg font-semibold">Basic Profile Information</h3>
        <BasicProfileForm profile={userData.profile} profileId={profileId} />
      </TabsContent>
      
      {/* Candidate-specific tabs */}
      {userData.profile.role === "candidate" && (
        <>
          <TabsContent value="candidate" className="space-y-6">
            <h3 className="text-lg font-semibold">Candidate Profile Details</h3>
            <CandidateProfileForm 
              candidateProfile={userData.roleSpecificData.candidateProfile} 
              profileId={profileId} 
            />
          </TabsContent>
          
          <TabsContent value="education-experience" className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Education History</h3>
              <EducationManager
                education={userData.roleSpecificData.education || []}
                candidateProfileId={userData.roleSpecificData.candidateProfile?.id}
                profileId={profileId}
              />
            </div>
            
            <div className="mt-10 space-y-6">
              <h3 className="text-lg font-semibold">Work Experience</h3>
              <ExperienceManager
                experience={userData.roleSpecificData.experience || []}
                candidateProfileId={userData.roleSpecificData.candidateProfile?.id}
                profileId={profileId}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="skills" className="space-y-6">
            <h3 className="text-lg font-semibold">Skills</h3>
            <SkillsManager
              candidateSkills={userData.roleSpecificData.skills || []}
              availableSkills={availableSkills}
              candidateProfileId={userData.roleSpecificData.candidateProfile?.id}
              profileId={profileId}
            />
          </TabsContent>
        </>
      )}
      
      {/* Employer-specific tabs */}
      {userData.profile.role === "employer" && (
        <>
          <TabsContent value="employer" className="space-y-6">
            <h3 className="text-lg font-semibold">Company Details</h3>
            <EmployerProfileForm 
              employerProfile={userData.roleSpecificData.employerProfile} 
              profileId={profileId}
              industries={allIndustries}
              locations={allLocations}
              currentIndustry={userData.roleSpecificData.industry}
              currentLocation={userData.roleSpecificData.location}
            />
          </TabsContent>
          
          <TabsContent value="jobs" className="space-y-6">
            <h3 className="text-lg font-semibold">Job Postings</h3>
            <p className="text-gray-500">
              This section would show the employer's job postings with options to edit, delete, or
              manage applications for each job.
            </p>
            {/* Job listings component would go here */}
          </TabsContent>
          
          <TabsContent value="status" className="space-y-6">
            <h3 className="text-lg font-semibold">Account Status</h3>
            <ProfileStatusManager
              profile={userData.profile}
              profileId={profileId}
            />
          </TabsContent>
        </>
      )}
      
      {/* Admin-specific tabs */}
      {userData.profile.role === "admin" && (
        <>
          <TabsContent value="admin" className="space-y-6">
            <h3 className="text-lg font-semibold">Admin Profile</h3>
            <p className="text-gray-500">
              This section would contain admin-specific profile details.
            </p>
            {/* Admin profile form would go here */}
          </TabsContent>
          
          <TabsContent value="permissions" className="space-y-6">
            <h3 className="text-lg font-semibold">Admin Permissions</h3>
            <p className="text-gray-500">
              This section would manage admin permissions and roles.
            </p>
            {/* Permissions component would go here */}
          </TabsContent>
          
          <TabsContent value="status" className="space-y-6">
            <h3 className="text-lg font-semibold">Account Status</h3>
            <ProfileStatusManager
              profile={userData.profile}
              profileId={profileId}
            />
          </TabsContent>
        </>
      )}
    </Tabs>
  );
} 