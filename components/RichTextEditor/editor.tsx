'use client'

/**
 * Rich Text Editor - Toolbar Config Sample
 */
import { HtmlEditor, Inject, RichTextEditorComponent, Toolbar, ToolbarItems, QuickToolbar, ChangeEventArgs } from '@syncfusion/ej2-react-richtexteditor';
import * as React from 'react';
import './styles.css';
import { registerLicense } from '@syncfusion/ej2-base';
import { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY as string);

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number | string;
  minHeight?: number | string;
  className?: string;
}

export const Editor: React.FC<EditorProps> = ({ 
  value, 
  onChange, 
  height = 'auto',
  minHeight = 200,
  className = ''
}) => {
  const rteRef = useRef<RichTextEditorComponent>(null);
  const { theme } = useTheme();
  
  const toolbarSettings: object = {
    items: ['Bold', '|', 'Italic','|', 'Underline', '|',
    'LowerCase', '|', 'UpperCase', '|', 'OrderedList', '|', 'UnorderedList', '|', 'Undo', '|', 'Redo']
    }

  const handleChange = (args: ChangeEventArgs) => {
    if (onChange && args.value !== null) {
      onChange(args.value);
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

  // Configure the editor to auto-resize
  const editorSettings = {
    height: height,
    autoSaveOnIdle: true,
    enableAutoUrl: true,
    enableResize: true,
    resizeByPercent: true,
    showCharCount: true,
    maxLength: 15000,
    placeholder: 'Start typing...'
  };

return (
    <div className={`w-full ${className} ${theme === 'dark' ? 'dark-mode' : ''}`} style={{ minHeight: minHeight }}>
      <RichTextEditorComponent 
        ref={rteRef} 
        height={height}
        value={value} 
        toolbarSettings={toolbarSettings} 
        change={handleChange}
        placeholder="Start typing..."
      >
        <Inject services={[Toolbar, HtmlEditor, QuickToolbar]} />
      </RichTextEditorComponent>
    </div>
  );
}
