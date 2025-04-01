'use client'

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { handleResumeUpload } from "../_actions";
import { UploadCloud, FileText, File, X, Download } from "lucide-react";

interface ResumeUploadProps {
  resumeUrl?: string | null;
  resumeFilename?: string | null;
}

export default function ResumeUpload({ resumeUrl, resumeFilename }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Check file type (allow PDF, DOC, DOCX)
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOC, or DOCX file.");
      return;
    }

    // Check file size (max 1MB)
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 1MB.");
      return;
    }

    setUploadedFile(file);
  };

  const uploadResume = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('resume', uploadedFile);
      
      const result = await handleResumeUpload(formData);
      
      if (result.success) {
        toast.success("Resume uploaded");
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setUploadedFile(null);
      }
    } catch (error) {
      console.error('Resume upload failed:', error);
      toast.error("Failed to upload your resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelectedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Resume</h3>
        <p className="text-sm text-gray-500">
          Upload your resume to share with potential employers.
        </p>
      </div>

      {/* Current resume display */}
      {resumeUrl && (
        <Card className="p-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{resumeFilename || 'Your Resume'}</p>
                <p className="text-xs text-muted-foreground">
                  Current resume on file
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" asChild>
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </a>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* File upload area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted'
        } transition-colors duration-200 ease-in-out cursor-pointer`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <div className="bg-primary/10 p-3 rounded-full">
            <UploadCloud className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="font-medium">Click to upload or drag and drop</p>
            <p className="text-sm text-muted-foreground">
              PDF, DOC, or DOCX (max 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Selected file preview */}
      {uploadedFile && (
        <Card className="p-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <File className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Selected for upload
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelectedFile();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Upload button */}
      {uploadedFile && (
        <Button 
          className="w-full sm:w-auto"
          onClick={uploadResume}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload Resume"}
        </Button>
      )}
    </div>
  );
} 