'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Experience } from '@/lib/db/schema';
import { formatDate } from '../_utils/profile-transformers';
import { deleteExperience } from '../_actions';
import { toast } from 'sonner';
import ExperienceFormDialog from './experience-form-dialog';

interface ExperienceSectionProps {
  experience: Experience[];
  candidateProfileId?: string;
}

export default function ExperienceSection({ experience, candidateProfileId }: ExperienceSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);


  const handleDelete = async (id: string) => {
    if (!id) return;
    
    setIsDeleting(id);
    
    try {
      const formData = new FormData();
      formData.append('id', id);
      
      const result = await deleteExperience(formData);
      
      if (result.success) {
        toast.success("Experience deleted");
      }
    } catch (error) {
      console.error('Failed to delete experience:', error);
      toast.error("Failed to delete the experience entry. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Work Experience</h3>
          <p className="text-sm text-gray-500">
            Add your professional experience to your profile.
          </p>
        </div>
        {candidateProfileId && (
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Experience
          </Button>
        )}
      </div>

      {!candidateProfileId && (
        <div className="bg-muted/40 rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Please complete your basic profile information before adding work experience.
          </p>
        </div>
      )}

      {candidateProfileId && experience.length === 0 && (
        <div className="bg-muted/40 rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t added any work experience yet. Click &quot;Add Experience&quot; to get started.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {candidateProfileId && experience.map((exp) => (
          <Card key={exp.id} className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-medium">{exp.jobTitle}</h4>
                  {exp.isCurrent && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      Current
                    </Badge>
                  )}
                </div>
                <p className="text-sm">{exp.companyName}</p>
                {exp.location && (
                  <p className="text-sm text-muted-foreground">{exp.location}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                </p>
                {exp.description && (
                  <p className="text-sm mt-2">{exp.description}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setEditingExperience(exp)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDelete(exp.id)}
                  disabled={isDeleting === exp.id}
                >
                  {isDeleting === exp.id ? (
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {candidateProfileId && (
        <ExperienceFormDialog 
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          candidateProfileId={candidateProfileId}
        />
      )}

      {editingExperience && candidateProfileId && (
        <ExperienceFormDialog 
          open={!!editingExperience}
          onOpenChange={(open) => !open && setEditingExperience(null)}
          candidateProfileId={candidateProfileId}
          experience={editingExperience}
        />
      )}
    </div>
  );
} 