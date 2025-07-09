'use client'

import { HtmlEditor, Inject, RichTextEditorComponent, Toolbar, QuickToolbar, ChangeEventArgs, Link, Image } from '@syncfusion/ej2-react-richtexteditor';
import * as React from 'react';
import '@/components/RichTextEditor/styles.css';
import { registerLicense } from '@syncfusion/ej2-base';
import { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY as string);

interface EmailEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number | string;
  minHeight?: number | string;
  className?: string;
}

export const EmailRichTextEditor: React.FC<EmailEditorProps> = ({ 
  value, 
  onChange, 
  height = 'auto',
  minHeight = 300,
  className = ''
}) => {
  const rteRef = useRef<RichTextEditorComponent>(null);
  const { theme } = useTheme();
  const [isReady, setIsReady] = React.useState(false);
  
  // Enhanced toolbar for email composition
  const toolbarSettings = {
    items: [
      'Bold', 'Italic', 'Underline', 'StrikeThrough', '|',
      'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|',
      'Formats', 'Alignments', '|',
      'OrderedList', 'UnorderedList', '|',
      'Outdent', 'Indent', '|',
      'CreateLink', 'Image', '|',
      'Undo', 'Redo'
    ]
  };


  const handleChange = (args: ChangeEventArgs) => {
    if (onChange && args.value !== null && args.value !== undefined) {
      // Get the actual HTML content
      const htmlContent = rteRef.current?.getHtml() || args.value;
      onChange(htmlContent);
      
      // Force toolbar to update its state
      if (rteRef.current) {
        rteRef.current.refreshUI();
      }
    }
  };

  const handleCreated = () => {
    setIsReady(true);
    // Initialize with the current value if any
    if (rteRef.current && value) {
      rteRef.current.value = value;
    }
  };

  const handleActionComplete = () => {
    // Update toolbar state after any action
    if (rteRef.current) {
      rteRef.current.refreshUI();
    }
  };

  // Apply dark mode class to the editor container
  useEffect(() => {
    if (rteRef.current) {
      const editorElement = rteRef.current.element;
      if (editorElement) {
        if (theme === 'dark') {
          editorElement.classList.add('dark-mode');
        } else {
          editorElement.classList.remove('dark-mode');
        }
      }
    }
  }, [theme]);

  return (
    <div className={`w-full ${className} ${theme === 'dark' ? 'dark-mode' : ''}`} style={{ minHeight: minHeight }}>
      <style jsx global>{`
        /* Override Tailwind's list reset for this editor */
        .email-rich-text-editor ul {
          list-style-type: disc !important;
          padding-left: 2em !important;
        }
        .email-rich-text-editor ol {
          list-style-type: decimal !important;
          padding-left: 2em !important;
        }
        .email-rich-text-editor li {
          display: list-item !important;
        }
      `}</style>
      <div className="email-rich-text-editor">
        <RichTextEditorComponent 
          ref={rteRef} 
          height={height}
          value={value} 
          toolbarSettings={toolbarSettings} 
          change={handleChange}
          created={handleCreated}
          actionComplete={handleActionComplete}
          placeholder="Start typing your email content..."
          enableAutoUrl={true}
          enableTabKey={true}
          editorMode='HTML'
          enablePersistence={false}
        >
          <Inject services={[Toolbar, HtmlEditor, QuickToolbar, Link, Image]} />
        </RichTextEditorComponent>
      </div>
    </div>
  );
}