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
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
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

return (
    <div className='container mx-auto max-w-screen-lg mt-10'>
    <RichTextEditorComponent ref={rteRef} height={450} value={value} toolbarSettings={toolbarSettings} change={handleChange}>
      <Inject services={[Toolbar, HtmlEditor, QuickToolbar]} />
    </RichTextEditorComponent>
    </div>
  );
}
