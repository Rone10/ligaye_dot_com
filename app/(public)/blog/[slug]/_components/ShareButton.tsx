'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
  excerpt?: string | null;
}

export function ShareButton({ title, excerpt }: ShareButtonProps) {
  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title,
      text: excerpt || title,
      url,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Additional fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
        toast.error('Unable to share. Please copy the URL manually.');
      }
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-xs w-fit"
      onClick={handleShare}
    >
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  );
} 