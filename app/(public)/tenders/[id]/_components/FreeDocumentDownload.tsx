'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { getFreeDocumentDownloadUrl } from '../_actions';

interface Document {
  id: string;
  originalFilename: string;
  fileSize: number;
}

interface FreeDocumentDownloadProps {
  document: Document;
}

export function FreeDocumentDownload({ document }: FreeDocumentDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const result = await getFreeDocumentDownloadUrl(document.id);
      
      if (result.success && result.downloadUrl) {
        // Open download in new tab
        window.open(result.downloadUrl, '_blank');
      } else {
        toast.error(result.error || 'Failed to generate download link');
      }
    } catch (error) {
      toast.error('Download failed');
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex items-center justify-between p-md bg-theme-light rounded-lg hover:bg-theme-gray/10 transition-colors duration-standard">
      <div className="flex items-center gap-sm">
        <FileText className="h-5 w-5 text-theme-gray-dark" />
        <div>
          <p className="font-medium text-theme-dark">{document.originalFilename}</p>
          <p className="text-sm text-theme-gray-dark">{formatFileSize(document.fileSize)}</p>
        </div>
      </div>
      
      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        variant="outline"
        className="gap-xs"
      >
        {isDownloading ? (
          'Generating...'
        ) : (
          <>
            <Download className="h-4 w-4" />
            Download
          </>
        )}
      </Button>
    </div>
  );
} 