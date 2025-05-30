'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

interface Document {
  id: string;
  originalFilename: string;
  fileSize: number;
  signedUrl: string;
}

interface DownloadLinksProps {
  documents: Document[];
}

export function DownloadLinks({ documents }: DownloadLinksProps) {
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  const handleDownload = async (document: Document) => {
    setDownloadingIds(prev => new Set(prev).add(document.id));
    
    try {
      // Open download in new tab
      window.open(document.signedUrl, '_blank');
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      // Remove from downloading set after a delay
      setTimeout(() => {
        setDownloadingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(document.id);
          return newSet;
        });
      }, 2000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-xl">
        <FileText className="mx-auto h-16 w-16 text-theme-gray-dark mb-md" />
        <p className="text-theme-gray-dark">No documents available for download.</p>
      </div>
    );
  }

  return (
    <div className="space-y-sm">
      {documents.map((document) => (
        <div
          key={document.id}
          className="flex items-center justify-between p-md bg-theme-light rounded-lg hover:bg-theme-gray/10 transition-colors duration-standard"
        >
          <div className="flex items-center gap-sm">
            <FileText className="h-5 w-5 text-theme-gray-dark" />
            <div>
              <p className="font-medium text-theme-dark">{document.originalFilename}</p>
              <p className="text-sm text-theme-gray-dark">{formatFileSize(document.fileSize)}</p>
            </div>
          </div>
          
          <Button
            onClick={() => handleDownload(document)}
            disabled={downloadingIds.has(document.id)}
            className="gap-xs"
          >
            {downloadingIds.has(document.id) ? (
              'Downloading...'
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download
              </>
            )}
          </Button>
        </div>
      ))}
      
      <div className="mt-lg p-md bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Right-click on download buttons and select "Save link as..." 
          to save files directly to your preferred location.
        </p>
      </div>
    </div>
  );
} 