'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { validateBlogImage } from '@/lib/utils/blog-image-upload';

interface ImageUploadProps {
  value?: string; // Current image URL
  onChange: (file: File | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ImageUpload({ 
  value, 
  onChange, 
  disabled = false,
  placeholder = "Upload featured image..."
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) {
      setPreviewUrl(null);
      setError(null);
      onChange(null);
      return;
    }

    // Validate file
    const validation = validateBlogImage(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setError(null);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Call onChange with the file
    onChange(file);
  }, [onChange]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
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

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleRemove = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    onChange(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-sm">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {previewUrl ? (
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            <div className="relative w-full h-48">
              <Image
                src={previewUrl}
                alt="Featured image preview"
                fill
                className="object-cover"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card 
          className={`border-2 border-dashed cursor-pointer transition-colors duration-200 ${
            isDragging 
              ? 'border-primary-blue bg-primary-blue/5' 
              : 'border-theme-gray hover:border-primary-blue/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center p-lg text-center">
            <div className="mb-md p-md bg-theme-gray/20 rounded-full">
              {isDragging ? (
                <Upload className="h-6 w-6 text-primary-blue" />
              ) : (
                <ImageIcon className="h-6 w-6 text-theme-gray-dark" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-theme-dark mb-xs">
                {isDragging ? 'Drop image here' : placeholder}
              </p>
              <p className="text-xs text-theme-gray-dark">
                JPEG, PNG, WebP, or GIF (max 5MB)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 