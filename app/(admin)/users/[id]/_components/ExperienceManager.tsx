"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { addExperienceRecordAdmin, updateExperienceRecordAdmin, deleteExperienceRecordAdmin } from "../_actions";
import { Experience } from "@/lib/db/schema";
import { toast } from "sonner";

interface ExperienceManagerProps {
  experience: Experience[];
  candidateProfileId: string | undefined;
  profileId: string;
}

export function ExperienceManager({ experience, candidateProfileId, profileId }: ExperienceManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  
  // Form state
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState("");
  
  const resetForm = () => {
    setJobTitle("");
    setCompanyName("");
    setLocation("");
    setStartDate("");
    setEndDate("");
    setIsCurrent(false);
    setDescription("");
    setSelectedExperience(null);
  };
  
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!candidateProfileId) {
      toast.error("Cannot add experience: Candidate profile ID not found");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("candidateProfileId", candidateProfileId);
      formData.append("profileId", profileId);
      formData.append("jobTitle", jobTitle);
      formData.append("companyName", companyName);
      formData.append("location", location);
      
      if (startDate) {
        formData.append("startDate", startDate);
      }
      
      if (endDate && !isCurrent) {
        formData.append("endDate", endDate);
      }
      
      formData.append("isCurrent", isCurrent.toString());
      formData.append("description", description);
      
      const result = await addExperienceRecordAdmin(formData);
      
      if (result.success) {
        toast.success("Experience record added successfully");
        setIsAddDialogOpen(false);
        resetForm();
      } else {
        toast.error("Failed to add experience record");
      }
    } catch (error) {
      console.error("Error adding experience record:", error);
      toast.error("An error occurred while adding the experience record");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedExperience) {
      toast.error("No experience record selected for editing");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("experienceId", selectedExperience.id);
      formData.append("profileId", profileId);
      formData.append("jobTitle", jobTitle);
      formData.append("companyName", companyName);
      formData.append("location", location);
      
      if (startDate) {
        formData.append("startDate", startDate);
      }
      
      if (endDate && !isCurrent) {
        formData.append("endDate", endDate);
      }
      
      formData.append("isCurrent", isCurrent.toString());
      formData.append("description", description);
      
      const result = await updateExperienceRecordAdmin(formData);
      
      if (result.success) {
        toast.success("Experience record updated successfully");
        setIsEditDialogOpen(false);
        resetForm();
      } else {
        toast.error("Failed to update experience record");
      }
    } catch (error) {
      console.error("Error updating experience record:", error);
      toast.error("An error occurred while updating the experience record");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (experienceId: string) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("experienceId", experienceId);
      formData.append("profileId", profileId);
      
      const result = await deleteExperienceRecordAdmin(formData);
      
      if (result.success) {
        toast.success("Experience record deleted successfully");
      } else {
        toast.error("Failed to delete experience record");
      }
    } catch (error) {
      console.error("Error deleting experience record:", error);
      toast.error("An error occurred while deleting the experience record");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = (exp: Experience) => {
    setSelectedExperience(exp);
    setJobTitle(exp.jobTitle);
    setCompanyName(exp.companyName);
    setLocation(exp.location || "");
    setStartDate(exp.startDate ? new Date(exp.startDate).toISOString().split("T")[0] : "");
    setEndDate(exp.endDate ? new Date(exp.endDate).toISOString().split("T")[0] : "");
    setIsCurrent(exp.isCurrent || false);
    setDescription(exp.description || "");
    setIsEditDialogOpen(true);
  };
  
  // Helper function to format dates
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };
  
  if (!candidateProfileId) {
    return (
      <div className="p-4 bg-amber-50 text-amber-800 rounded-md">
        No candidate profile data available. The user might need to complete their profile setup.
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {experience.length} experience record{experience.length !== 1 ? "s" : ""}
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => resetForm()}
            >
              <Plus className="h-4 w-4" />
              <span>Add Experience</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Work Experience</DialogTitle>
              <DialogDescription>
                Add a new work experience record to this candidate's profile.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input 
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input 
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Banjul, Gambia"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input 
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isCurrent}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isCurrent"
                  checked={isCurrent}
                  onCheckedChange={(checked) => {
                    if (checked === true || checked === false) {
                      setIsCurrent(checked);
                      if (checked) {
                        setEndDate("");
                      }
                    }
                  }}
                />
                <Label htmlFor="isCurrent">Current Position</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe your responsibilities and achievements"
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Experience"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        {experience.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 border border-dashed border-gray-200 rounded-md text-center">
            No work experience records yet. Add one using the button above.
          </div>
        ) : (
          experience.map((exp) => (
            <Card key={exp.id} className="bg-white/60 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{exp.jobTitle}</CardTitle>
                <CardDescription>
                  {exp.companyName}{exp.location ? `, ${exp.location}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {(exp.startDate || exp.endDate) && (
                  <p className="text-sm text-gray-500">
                    {exp.startDate ? formatDate(exp.startDate.toString()) : ""} - {exp.isCurrent ? "Present" : (exp.endDate ? formatDate(exp.endDate.toString()) : "")}
                  </p>
                )}
                {exp.description && <p className="text-sm mt-2">{exp.description}</p>}
              </CardContent>
              <CardFooter className="pt-0 flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEdit(exp)}
                  className="h-8 px-2"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Experience Record</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this experience record? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(exp.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Work Experience</DialogTitle>
            <DialogDescription>
              Update this work experience record.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-jobTitle">Job Title *</Label>
              <Input 
                id="edit-jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-companyName">Company Name *</Label>
              <Input 
                id="edit-companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input 
                id="edit-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Banjul, Gambia"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input 
                  id="edit-startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input 
                  id="edit-endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isCurrent}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="edit-isCurrent"
                checked={isCurrent}
                onCheckedChange={(checked) => {
                  if (checked === true || checked === false) {
                    setIsCurrent(checked);
                    if (checked) {
                      setEndDate("");
                    }
                  }
                }}
              />
              <Label htmlFor="edit-isCurrent">Current Position</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe your responsibilities and achievements"
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 