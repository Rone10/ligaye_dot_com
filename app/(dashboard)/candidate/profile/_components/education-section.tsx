'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Education } from '@/lib/db/schema';
import { formatDate } from '../_utils/profile-transformers';
import EducationFormDialog from './education-form-dialog';
import { deleteEducation } from '../_actions';
import { toast } from 'sonner';

interface EducationSectionProps {
  education: Education[];
  candidateProfileId?: string;
}

export default function EducationSection({ education, candidateProfileId }: EducationSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);


  const handleDelete = async (id: string) => {
    if (!id) return;
    
    setIsDeleting(id);
    
    try {
      const formData = new FormData();
      formData.append('id', id);
      
      const result = await deleteEducation(formData);
      
      if (result.success) {
        toast.success("Education deleted");
      }
    } catch (error) {
      console.error('Failed to delete education:', error);
      toast.error("Failed to delete the education entry. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Education</h3>
          <p className="text-sm text-gray-500">
            Add your educational background to your profile.
          </p>
        </div>
        {candidateProfileId && (
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Education
          </Button>
        )}
      </div>

      {!candidateProfileId && (
        <div className="bg-muted/40 rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Please complete your basic profile information before adding education details.
          </p>
        </div>
      )}

      {candidateProfileId && education.length === 0 && (
        <div className="bg-muted/40 rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t added any education details yet. Click &quot;Add Education&quot; to get started.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {candidateProfileId && education.map((edu) => (
          <Card key={edu.id} className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-base font-medium">{edu.degree}</h4>
                <p className="text-sm">{edu.institution}</p>
                {edu.fieldOfStudy && (
                  <p className="text-sm text-muted-foreground">{edu.fieldOfStudy}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                </p>
                {edu.description && (
                  <p className="text-sm mt-2">{edu.description}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setEditingEducation(edu)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDelete(edu.id)}
                  disabled={isDeleting === edu.id}
                >
                  {isDeleting === edu.id ? (
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
        <EducationFormDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
          candidateProfileId={candidateProfileId}
        />
      )}

      {editingEducation && candidateProfileId && (
        <EducationFormDialog 
          open={!!editingEducation}
          onOpenChange={(open) => !open && setEditingEducation(null)}
          candidateProfileId={candidateProfileId}
          education={editingEducation}
        />
      )}
    </div>
  );
} 