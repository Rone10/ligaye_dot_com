"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { addEducationRecordAdmin, updateEducationRecordAdmin, deleteEducationRecordAdmin } from "../_actions";
import { Education } from "@/lib/db/schema";
import { toast } from "sonner";

interface EducationManagerProps {
  education: Education[];
  candidateProfileId: string | undefined;
  profileId: string;
}

export function EducationManager({ education, candidateProfileId, profileId }: EducationManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState<Education | null>(null);
  
  // Form state
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  
  const resetForm = () => {
    setInstitution("");
    setDegree("");
    setFieldOfStudy("");
    setStartDate("");
    setEndDate("");
    setDescription("");
    setSelectedEducation(null);
  };
  
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!candidateProfileId) {
      toast.error("Cannot add education: Candidate profile ID not found");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("candidateProfileId", candidateProfileId);
      formData.append("profileId", profileId);
      formData.append("institution", institution);
      formData.append("degree", degree);
      formData.append("fieldOfStudy", fieldOfStudy);
      
      if (startDate) {
        formData.append("startDate", startDate);
      }
      
      if (endDate) {
        formData.append("endDate", endDate);
      }
      
      formData.append("description", description);
      
      const result = await addEducationRecordAdmin(formData);
      
      if (result.success) {
        toast.success("Education record added successfully");
        setIsAddDialogOpen(false);
        resetForm();
      } else {
        toast.error("Failed to add education record");
      }
    } catch (error) {
      console.error("Error adding education record:", error);
      toast.error("An error occurred while adding the education record");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEducation) {
      toast.error("No education record selected for editing");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("educationId", selectedEducation.id);
      formData.append("profileId", profileId);
      formData.append("institution", institution);
      formData.append("degree", degree);
      formData.append("fieldOfStudy", fieldOfStudy);
      
      if (startDate) {
        formData.append("startDate", startDate);
      }
      
      if (endDate) {
        formData.append("endDate", endDate);
      }
      
      formData.append("description", description);
      
      const result = await updateEducationRecordAdmin(formData);
      
      if (result.success) {
        toast.success("Education record updated successfully");
        setIsEditDialogOpen(false);
        resetForm();
      } else {
        toast.error("Failed to update education record");
      }
    } catch (error) {
      console.error("Error updating education record:", error);
      toast.error("An error occurred while updating the education record");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (educationId: string) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("educationId", educationId);
      formData.append("profileId", profileId);
      
      const result = await deleteEducationRecordAdmin(formData);
      
      if (result.success) {
        toast.success("Education record deleted successfully");
      } else {
        toast.error("Failed to delete education record");
      }
    } catch (error) {
      console.error("Error deleting education record:", error);
      toast.error("An error occurred while deleting the education record");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = (edu: Education) => {
    setSelectedEducation(edu);
    setInstitution(edu.institution);
    setDegree(edu.degree);
    setFieldOfStudy(edu.fieldOfStudy || "");
    setStartDate(edu.startDate ? new Date(edu.startDate).toISOString().split("T")[0] : "");
    setEndDate(edu.endDate ? new Date(edu.endDate).toISOString().split("T")[0] : "");
    setDescription(edu.description || "");
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
          {education.length} education record{education.length !== 1 ? "s" : ""}
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => resetForm()}
            >
              <Plus className="h-4 w-4" />
              <span>Add Education</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Education</DialogTitle>
              <DialogDescription>
                Add a new education record to this candidate&apos;s profile.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="institution">Institution *</Label>
                <Input 
                  id="institution"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="degree">Degree/Certificate *</Label>
                <Input 
                  id="degree"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fieldOfStudy">Field of Study</Label>
                <Input 
                  id="fieldOfStudy"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
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
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
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
                  {isSubmitting ? "Adding..." : "Add Education"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        {education.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 border border-dashed border-gray-200 rounded-md text-center">
            No education records yet. Add one using the button above.
          </div>
        ) : (
          education.map((edu) => (
            <Card key={edu.id} className="bg-white/60 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{edu.institution}</CardTitle>
                <CardDescription>
                  {edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {(edu.startDate || edu.endDate) && (
                  <p className="text-sm text-gray-500">
                    {edu.startDate ? formatDate(edu.startDate.toString()) : ""} - {edu.endDate ? formatDate(edu.endDate.toString()) : "Present"}
                  </p>
                )}
                {edu.description && <p className="text-sm mt-2">{edu.description}</p>}
              </CardContent>
              <CardFooter className="pt-0 flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEdit(edu)}
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
                      <AlertDialogTitle>Delete Education Record</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this education record? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(edu.id)}
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
            <DialogTitle>Edit Education</DialogTitle>
            <DialogDescription>
              Update this education record.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-institution">Institution *</Label>
              <Input 
                id="edit-institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-degree">Degree/Certificate *</Label>
              <Input 
                id="edit-degree"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-fieldOfStudy">Field of Study</Label>
              <Input 
                id="edit-fieldOfStudy"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
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
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
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