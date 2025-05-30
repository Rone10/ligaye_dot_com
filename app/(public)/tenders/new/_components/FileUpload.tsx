'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
}

export function FileUpload({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSize = 25 * 1024 * 1024, // 25MB
  className
}: FileUploadProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setErrors([]);
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const newErrors = rejectedFiles.map(({ file, errors }) => {
        const error = errors[0];
        if (error.code === 'file-too-large') {
          return `${file.name}: File too large (max 25MB)`;
        }
        if (error.code === 'file-invalid-type') {
          return `${file.name}: File type not supported`;
        }
        return `${file.name}: Upload error`;
      });
      setErrors(newErrors);
    }

    // Add accepted files
    if (acceptedFiles.length > 0) {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
      onFilesChange(newFiles);
    }
  }, [files, onFilesChange, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'application/zip': ['.zip']
    },
    maxSize,
    maxFiles: maxFiles - files.length
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-md", className)}>
      {/* Upload Area */}
      <Card>
        <CardContent className="p-lg">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-xl text-center cursor-pointer transition-colors duration-standard",
              isDragActive
                ? "border-primary-blue bg-primary-blue/5"
                : "border-theme-gray hover:border-primary-blue hover:bg-theme-light/50"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-theme-gray-dark mb-md" />
            <p className="text-lg font-medium text-theme-dark mb-xs">
              {isDragActive ? "Drop files here" : "Upload Documents"}
            </p>
            <p className="text-sm text-theme-gray-dark mb-md">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-theme-gray-dark">
            Supported: PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP (max 25MB each)
            </p>
            <Button type="button" variant="outline" className="mt-md">
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-md">
            <div className="flex items-start gap-sm">
              <AlertCircle className="h-5 w-5 text-red-500 mt-xs flex-shrink-0" />
              <div className="space-y-xs">
                <p className="text-sm font-medium text-red-700">Upload Errors:</p>
                {errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-600">{error}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-lg">
            <h4 className="font-medium text-theme-dark mb-md">
              Selected Files ({files.length}/{maxFiles})
            </h4>
            <div className="space-y-sm">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-sm bg-theme-light rounded-md"
                >
                  <div className="flex items-center gap-sm">
                    <FileText className="h-4 w-4 text-theme-gray-dark" />
                    <div>
                      <p className="text-sm font-medium text-theme-dark">{file.name}</p>
                      <p className="text-xs text-theme-gray-dark">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 