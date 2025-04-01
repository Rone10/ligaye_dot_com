"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateEmployerProfileAdmin } from "../_actions";
import { EmployerProfile, companySizeEnum, Industry, Location } from "@/lib/db/schema";
import { toast } from "sonner";

interface EmployerProfileFormProps {
  employerProfile: EmployerProfile | undefined;
  profileId: string;
  industries: Industry[];
  locations: Location[];
  currentIndustry?: Industry;
  currentLocation?: Location;
}

export function EmployerProfileForm({ 
  employerProfile, 
  profileId, 
  industries, 
  locations,
  currentIndustry,
  currentLocation
}: EmployerProfileFormProps) {
  const [companyName, setCompanyName] = useState(employerProfile?.companyName || "");
  const [companySize, setCompanySize] = useState<string>(
    employerProfile?.companySize || "none"
  );
  const [industryId, setIndustryId] = useState<string>(
    employerProfile?.industryId || "none"
  );
  const [companyDescription, setCompanyDescription] = useState(employerProfile?.companyDescription || "");
  const [website, setWebsite] = useState(employerProfile?.website || "");
  const [locationId, setLocationId] = useState<string>(
    employerProfile?.locationId || "none"
  );
  const [hqAddressDisplay, setHqAddressDisplay] = useState(employerProfile?.hqAddressDisplay || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employerProfile) {
      toast.error("Cannot update: Employer profile not found");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("profileId", profileId);
      formData.append("companyName", companyName);
      
      if (companySize && companySize !== "none") {
        formData.append("companySize", companySize);
      }
      
      if (industryId && industryId !== "none") {
        formData.append("industryId", industryId);
      }
      
      formData.append("companyDescription", companyDescription);
      formData.append("website", website);
      
      if (locationId && locationId !== "none") {
        formData.append("locationId", locationId);
      }
      
      formData.append("hqAddressDisplay", hqAddressDisplay);
      
      const result = await updateEmployerProfileAdmin(formData);
      
      if (result.success) {
        toast.success("Employer profile updated successfully");
      } else {
        toast.error("Failed to update employer profile");
      }
    } catch (error) {
      console.error("Error updating employer profile:", error);
      toast.error("An error occurred while updating the employer profile");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!employerProfile) {
    return (
      <div className="p-4 bg-amber-50 text-amber-800 rounded-md">
        No employer profile data available. The user might need to complete their profile setup.
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input 
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companySize">Company Size</Label>
          <Select
            value={companySize}
            onValueChange={setCompanySize}
          >
            <SelectTrigger id="companySize">
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not specified</SelectItem>
              {companySizeEnum.enumValues.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Select
            value={industryId}
            onValueChange={setIndustryId}
          >
            <SelectTrigger id="industry">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not specified</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry.id} value={industry.id}>
                  {industry.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentIndustry && (
            <p className="text-xs text-gray-500 mt-1">
              Current: {currentIndustry.name}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input 
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="companyDescription">Company Description</Label>
        <Textarea 
          id="companyDescription"
          value={companyDescription}
          onChange={(e) => setCompanyDescription(e.target.value)}
          rows={4}
          placeholder="Brief description of the company"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Select
            value={locationId}
            onValueChange={setLocationId}
          >
            <SelectTrigger id="location">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not specified</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.region}{location.city ? ` - ${location.city}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentLocation && (
            <p className="text-xs text-gray-500 mt-1">
              Current: {currentLocation.region}{currentLocation.city ? ` - ${currentLocation.city}` : ''}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="hqAddressDisplay">HQ Address (Display)</Label>
          <Input 
            id="hqAddressDisplay"
            value={hqAddressDisplay}
            onChange={(e) => setHqAddressDisplay(e.target.value)}
            placeholder="Address as it should be displayed on your profile"
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