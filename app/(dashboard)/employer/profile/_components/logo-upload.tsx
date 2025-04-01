'use client'

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { handleLogoUpload } from '../_actions';
import { AlertCircle, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoUploadProps {
  currentLogoUrl?: string;
  hasProfile: boolean;
}

export default function LogoUpload({ currentLogoUrl, hasProfile }: LogoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle file selection
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      validateAndPreviewFile(file);
    }
  }

  // Drag and drop handlers
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndPreviewFile(file);
    }
  }

  // Validate file and create preview
  function validateAndPreviewFile(file: File) {
    setUploadError(null);
    
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Only JPEG, PNG, and WebP images are supported');
      return;
    }
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setSelectedFile(file);
  }

  // Handle upload action
  async function uploadLogo() {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const formData = new FormData();
      formData.append('logo', selectedFile);
      
      const result = await handleLogoUpload(formData);
      
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Reset state after successful upload
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  }

  // Clear selected file and preview
  function clearSelection() {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
  }

  if (!hasProfile) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Required</h3>
        <p className="text-gray-500 text-center mb-4">
          You need to create a company profile before uploading a logo.
          Please complete the Company Details section first.
        </p>
        <Button variant="outline" onClick={() => window.location.hash = '#details'}>
          Go to Company Details
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Current logo display */}
      {currentLogoUrl && !previewUrl && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Current Logo</h3>
          <div className="relative w-40 h-40 mx-auto border border-gray-200 rounded-lg overflow-hidden">
            <Image
              src={currentLogoUrl}
              alt="Company Logo"
              fill
              sizes="160px"
              style={{ objectFit: 'contain' }}
              className="p-2"
            />
          </div>
        </div>
      )}
      
      {/* Upload area */}
      <div className="space-y-4">
        <Label htmlFor="logo-upload">Upload New Logo</Label>
        
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50",
            uploadError ? "border-red-300 bg-red-50" : ""
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('logo-upload')?.click()}
        >
          {previewUrl ? (
            <div className="relative w-40 h-40 mx-auto">
              <button 
                type="button"
                className="absolute -top-2 -right-2 bg-gray-100 rounded-full p-1 shadow-sm z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
              >
                <X className="h-4 w-4" />
              </button>
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                sizes="160px"
                style={{ objectFit: 'contain' }}
                className="rounded"
              />
            </div>
          ) : (
            <div className="py-4">
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Drag and drop your logo image here, or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPEG, PNG, WebP • 5MB max
              </p>
            </div>
          )}
        </div>
        
        {/* Hidden file input */}
        <input
          id="logo-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        
        {/* Error message */}
        {uploadError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {uploadError}
          </div>
        )}
        
        {/* Success message */}
        {showSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
            Logo uploaded successfully!
          </div>
        )}
        
        {/* Upload button */}
        {selectedFile && (
          <div className="flex justify-end">
            <Button 
              onClick={uploadLogo} 
              disabled={isUploading}
              className="mt-2"
            >
              {isUploading ? 'Uploading...' : 'Upload Logo'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 