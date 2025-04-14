'use client'

import { FileText, PaperclipIcon, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ApplicationDocumentsProps {
  resumeUrl?: string | null
  resumeFilename?: string | null
  coverLetterUrl?: string | null
  coverLetterFilename?: string | null
  coverLetterText?: string | null
}

export default function ApplicationDocuments({
  resumeUrl,
  resumeFilename,
  coverLetterUrl,
  coverLetterFilename,
  coverLetterText
}: ApplicationDocumentsProps) {
  // Check if we have any documents to display
  const hasDocuments = resumeUrl || coverLetterUrl || coverLetterText
  
  // Parse HTML and preserve formatting in cover letter text
  const parseCoverLetterText = (text: string) => {
    if (!text) return '';
    
    // Replace HTML entities first
    let parsedText = text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ');
    
    // Replace paragraph tags with appropriate markup
    parsedText = parsedText
      .replace(/<p\s*[^>]*>/g, '<div class="mb-4">')
      .replace(/<\/p>/g, '</div>')
      .replace(/<br\s*\/?>/g, '<br />');
    
    // Handle headers with proper styling
    parsedText = parsedText
      .replace(/<h1\s*[^>]*>(.*?)<\/h1>/g, '<div class="text-3xl font-bold mb-4">$1</div>')
      .replace(/<h2\s*[^>]*>(.*?)<\/h2>/g, '<div class="text-2xl font-bold mb-3">$1</div>')
      .replace(/<h3\s*[^>]*>(.*?)<\/h3>/g, '<div class="text-xl font-bold mb-2">$1</div>')
      .replace(/<h4\s*[^>]*>(.*?)<\/h4>/g, '<div class="text-lg font-semibold mb-2">$1</div>')
      .replace(/<h5\s*[^>]*>(.*?)<\/h5>/g, '<div class="text-base font-semibold mb-1">$1</div>')
      .replace(/<h6\s*[^>]*>(.*?)<\/h6>/g, '<div class="text-sm font-semibold mb-1">$1</div>');
    
    // Preserve text formatting
    parsedText = parsedText
      .replace(/<strong\s*[^>]*>(.*?)<\/strong>/g, '<span class="font-bold">$1</span>')
      .replace(/<b\s*[^>]*>(.*?)<\/b>/g, '<span class="font-bold">$1</span>')
      .replace(/<em\s*[^>]*>(.*?)<\/em>/g, '<span class="italic">$1</span>')
      .replace(/<i\s*[^>]*>(.*?)<\/i>/g, '<span class="italic">$1</span>')
      .replace(/<u\s*[^>]*>(.*?)<\/u>/g, '<span class="underline">$1</span>');
    
    // Handle lists
    parsedText = parsedText
      .replace(/<ul\s*[^>]*>/g, '<div class="pl-6 mb-4 space-y-1">')
      .replace(/<\/ul>/g, '</div>')
      .replace(/<ol\s*[^>]*>/g, '<div class="pl-6 mb-4 space-y-1 list-decimal">')
      .replace(/<\/ol>/g, '</div>')
      .replace(/<li\s*[^>]*>(.*?)<\/li>/g, '<div class="flex"><span class="mr-2">•</span><span>$1</span></div>');
    
    // Clean up any potentially unsafe tags while keeping our safe ones
    const safeTagsRegex = /<(?!\/?(div|span|br)(?!\w)[^>]*>)([^>]*)>/g;
    parsedText = parsedText.replace(safeTagsRegex, '');
    
    return parsedText;
  };
  
  if (!hasDocuments) {
    return null
  }
  
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-xl border border-[rgba(255,255,255,0.3)] overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-[#1a1e2d] mb-4">Application Documents</h2>
        
        <div className="space-y-5">
          {/* Resume */}
          {resumeUrl && (
            <div className="bg-[#f8faff] p-4 rounded-lg border border-[#e1e5f2]">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#4a6cfa]/10 rounded-md mr-3">
                    <FileText className="h-5 w-5 text-[#4a6cfa]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#1a1e2d]">Resume</h3>
                    <p className="text-sm text-[#9aa3bc] truncate max-w-[200px] sm:max-w-xs">
                      {resumeFilename || 'resume.pdf'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <a 
                    href={resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center text-xs bg-white hover:bg-gray-50 text-gray-700 font-medium py-1 px-3 rounded-full border border-gray-200 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    View
                  </a>
                  <a 
                    href={resumeUrl} 
                    download={resumeFilename || 'resume.pdf'} 
                    className="inline-flex items-center text-xs bg-white hover:bg-gray-50 text-gray-700 font-medium py-1 px-3 rounded-full border border-gray-200 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          )}
          
          {/* Cover Letter File */}
          {coverLetterUrl && (
            <div className="bg-[#f8faff] p-4 rounded-lg border border-[#e1e5f2]">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#4a6cfa]/10 rounded-md mr-3">
                    <PaperclipIcon className="h-5 w-5 text-[#4a6cfa]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#1a1e2d]">Cover Letter</h3>
                    <p className="text-sm text-[#9aa3bc] truncate max-w-[200px] sm:max-w-xs">
                      {coverLetterFilename || 'cover-letter.pdf'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <a 
                    href={coverLetterUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center text-xs bg-white hover:bg-gray-50 text-gray-700 font-medium py-1 px-3 rounded-full border border-gray-200 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    View
                  </a>
                  <a 
                    href={coverLetterUrl} 
                    download={coverLetterFilename || 'cover-letter.pdf'} 
                    className="inline-flex items-center text-xs bg-white hover:bg-gray-50 text-gray-700 font-medium py-1 px-3 rounded-full border border-gray-200 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          )}
          
          {/* Cover Letter Text */}
          {coverLetterText && (
            <div className="bg-[#f8faff] p-4 rounded-lg border border-[#e1e5f2]">
              <h3 className="font-medium text-[#1a1e2d] mb-2">Cover Letter</h3>
              <div className="text-sm text-[#1a1e2d] p-4 bg-white rounded border border-[#e1e5f2]">
                <div 
                  className="prose prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: parseCoverLetterText(coverLetterText) }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 