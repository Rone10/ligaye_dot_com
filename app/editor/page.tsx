'use client'

import { Editor } from '@/components/RichTextEditor/editor';
import { useState } from 'react';
import { Button } from '@/components/ui/button';


export default function MyPageComponent() {
  const [editorContent, setEditorContent] = useState<string>('<p>Initial content</p>');

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    // You can add logic here to save the content, update a preview, etc.
    console.log("Editor content changed:", content);
  };

  const handleSave = () => {
     // Logic to save editorContent to your database
     console.log("Saving content:", editorContent);
  }

  return (
    <div className='container mx-auto max-w-screen-lg mt-10'>
      <h1>My Page</h1>
      <Editor value={editorContent} onChange={handleEditorChange} />
      {/* Example: Display a preview */}
      {/* <div dangerouslySetInnerHTML={{ __html: editorContent }} /> */}
      <Button onClick={handleSave} className='mt-4'>Save Content</Button>
    </div>
  );
}