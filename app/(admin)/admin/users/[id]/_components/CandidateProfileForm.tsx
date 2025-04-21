"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateCandidateProfileAdmin } from "../_actions";
import { CandidateProfile, experienceLevelEnum } from "@/lib/db/schema";
import { toast } from "sonner";

interface CandidateProfileFormProps {
  candidateProfile: CandidateProfile | undefined;
  profileId: string;
}

export function CandidateProfileForm({ candidateProfile, profileId }: CandidateProfileFormProps) {
  const [title, setTitle] = useState(candidateProfile?.title || "");
  const [experienceLevel, setExperienceLevel] = useState<string>(
    candidateProfile?.experienceLevel || "none"
  );
  const [bio, setBio] = useState(candidateProfile?.bio || "");
  const [linkedinUrl, setLinkedinUrl] = useState(candidateProfile?.linkedinUrl || "");
  const [githubUrl, setGithubUrl] = useState(candidateProfile?.githubUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(candidateProfile?.portfolioUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!candidateProfile) {
      toast.error("Cannot update: Candidate profile not found");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("profileId", profileId);
      formData.append("title", title);
      
      if (experienceLevel && experienceLevel !== "none") {
        formData.append("experienceLevel", experienceLevel);
      }
      
      formData.append("bio", bio);
      formData.append("linkedinUrl", linkedinUrl);
      formData.append("githubUrl", githubUrl);
      formData.append("portfolioUrl", portfolioUrl);
      
      const result = await updateCandidateProfileAdmin(formData);
      
      if (result.success) {
        toast.success("Candidate profile updated successfully");
      } else {
        toast.error("Failed to update candidate profile");
      }
    } catch (error) {
      console.error("Error updating candidate profile:", error);
      toast.error("An error occurred while updating the candidate profile");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!candidateProfile) {
    return (
      <div className="p-4 bg-amber-50 text-amber-800 rounded-md">
        No candidate profile data available. The user might need to complete their profile setup.
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Professional Title</Label>
          <Input 
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Software Engineer"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="experienceLevel">Experience Level</Label>
          <Select
            value={experienceLevel}
            onValueChange={setExperienceLevel}
          >
            <SelectTrigger id="experienceLevel">
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not specified</SelectItem>
              {experienceLevelEnum.enumValues.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea 
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Professional summary and career highlights"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
          <Input 
            id="linkedinUrl"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/username"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="githubUrl">GitHub Profile</Label>
          <Input 
            id="githubUrl"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="portfolioUrl">Portfolio Website</Label>
          <Input 
            id="portfolioUrl"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
} 