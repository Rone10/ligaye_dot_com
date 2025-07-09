'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, Mail, User, FileText } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { EmailTemplateWrapper } from './EmailTemplateWrapper';

interface EmailPreviewProps {
  recipient: string;
  subject: string;
  bodyHtml: string;
  cc?: string;
  bcc?: string;
}

export function EmailPreview({ recipient, subject, bodyHtml, cc, bcc }: EmailPreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Preview
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'mx-auto transition-all duration-300',
            viewMode === 'desktop' ? 'max-w-3xl' : 'max-w-sm'
          )}
        >
          {/* Email Metadata */}
          <div className="rounded-t-lg border bg-gray-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-600">From:</span>
              <span>Ligaye &lt;contact@ligaye.com&gt;</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-600">To:</span>
              <span>{recipient || 'recipient@example.com'}</span>
            </div>
            {cc && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-600">CC:</span>
                <span>{cc}</span>
              </div>
            )}
            {bcc && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-600">BCC:</span>
                <span>{bcc}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-600">Subject:</span>
              <span className="font-semibold">{subject || 'No subject'}</span>
            </div>
          </div>

          {/* Email Content */}
          <div className="rounded-b-lg border border-t-0 bg-white min-h-[400px] overflow-hidden">
            <style jsx global>{`
              /* Ensure list styles work in preview */
              .email-preview-content ul {
                list-style-type: disc !important;
                list-style-position: inside !important;
                padding-left: 20px !important;
              }
              .email-preview-content ol {
                list-style-type: decimal !important;
                list-style-position: inside !important;
                padding-left: 20px !important;
              }
              .email-preview-content li {
                display: list-item !important;
              }
              .email-preview-content ul li::marker {
                color: inherit !important;
              }
              .email-preview-content ol li::marker {
                color: inherit !important;
              }
            `}</style>
            {bodyHtml ? (
              <div className="email-preview-content">
                <EmailTemplateWrapper content={bodyHtml} previewMode={true} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 p-6">
                <FileText className="h-12 w-12 mb-2" />
                <p>Start typing to see your email preview</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}