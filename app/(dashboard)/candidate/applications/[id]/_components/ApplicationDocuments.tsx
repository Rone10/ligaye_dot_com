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
              <div className="text-sm text-[#1a1e2d] whitespace-pre-line max-h-56 overflow-y-auto p-4 bg-white rounded border border-[#e1e5f2]">
                {coverLetterText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 