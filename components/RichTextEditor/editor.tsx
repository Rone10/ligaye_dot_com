'use client'

/**
 * Rich Text Editor - Toolbar Config Sample
 */
import { HtmlEditor, Inject, RichTextEditorComponent, Toolbar, ToolbarItems, QuickToolbar, ChangeEventArgs } from '@syncfusion/ej2-react-richtexteditor';
import * as React from 'react';
import './styles.css';
import { registerLicense } from '@syncfusion/ej2-base';
import { useRef } from 'react';
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
  const toolbarSettings: object = {
    items: ['Bold', '|', 'Italic','|', 'Underline', '|',
    'LowerCase', '|', 'UpperCase', '|', 'OrderedList', '|', 'UnorderedList', '|', 'Undo', '|', 'Redo']
    }

  const handleChange = (args: ChangeEventArgs) => {
    if (onChange && args.value !== null) {
      onChange(args.value);
    }
  };

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
    <div className={`w-full ${className}`} style={{ minHeight: minHeight }}>
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
