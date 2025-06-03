'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { deleteTenderDocumentAction } from '../_actions';
import type { TenderDocument } from '@/lib/db/schema';

interface ExistingDocumentsProps {
  documents: TenderDocument[];
  tenderId: string;
  onDocumentDeleted: (documentId: string) => void;
}

export function ExistingDocuments({ documents, tenderId, onDocumentDeleted }: ExistingDocumentsProps) {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDeleteDocument = async (documentId: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingIds(prev => new Set([...prev, documentId]));
    
    try {
      const result = await deleteTenderDocumentAction(tenderId, documentId);
      
      if (result.success) {
        toast.success('Document deleted successfully');
        onDocumentDeleted(documentId);
      } else {
        toast.error(result.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Delete document error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });
    }
  };

  if (documents.length === 0) {
    return (
      <Card className="border-theme-gray/50">
        <CardContent className="p-lg text-center">
          <FileText className="mx-auto h-12 w-12 text-theme-gray-dark mb-md" />
          <p className="text-sm text-theme-gray-dark">No documents uploaded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-lg">
        <h4 className="font-medium text-theme-dark mb-md">
          Current Documents ({documents.length})
        </h4>
        <div className="space-y-sm">
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex items-center justify-between p-sm bg-theme-light rounded-md"
            >
              <div className="flex items-center gap-sm flex-1">
                <FileText className="h-4 w-4 text-theme-gray-dark flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-theme-dark truncate">
                    {document.originalFilename}
                  </p>
                  <div className="flex items-center gap-md text-xs text-theme-gray-dark">
                    <span>{formatFileSize(document.fileSize || 0)}</span>
                    <span>•</span>
                    <span>Uploaded {new Date(document.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-xs">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={deletingIds.has(document.id)}
                  onClick={() => handleDeleteDocument(document.id, document.originalFilename)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 px-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 