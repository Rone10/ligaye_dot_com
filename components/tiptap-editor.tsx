"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Link from '@tiptap/extension-link';
import { Toggle } from "@/components/ui/toggle";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
} from "lucide-react";
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkOpen, setLinkOpen] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList,
      OrderedList,
      ListItem,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert focus:outline-none max-w-none',
      },
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  const setLink = () => {
    if (linkUrl) {
      // Update link
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl('');
      setLinkOpen(false);
    } else if (editor.isActive('link')) {
      // Remove link if URL is empty and link is active
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .unsetLink()
        .run();
    }
  };

  return (
    <div className="w-full">
      <div className="border border-input rounded-md mb-1">
        <div className="border-b border-border p-2 flex flex-wrap gap-1">
          <ToggleGroup type="multiple" className="justify-start">
            <ToggleGroupItem 
              value="bold" 
              aria-label="Bold"
              data-state={editor.isActive('bold') ? "on" : "off"}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </ToggleGroupItem>
            
            <ToggleGroupItem 
              value="italic" 
              aria-label="Italic"
              data-state={editor.isActive('italic') ? "on" : "off"}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          
          <ToggleGroup type="single" className="justify-start">
            <ToggleGroupItem 
              value="h1" 
              aria-label="Heading 1"
              data-state={editor.isActive('heading', { level: 1 }) ? "on" : "off"}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              <Heading1 className="h-4 w-4" />
            </ToggleGroupItem>
            
            <ToggleGroupItem 
              value="h2" 
              aria-label="Heading 2"
              data-state={editor.isActive('heading', { level: 2 }) ? "on" : "off"}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 className="h-4 w-4" />
            </ToggleGroupItem>
            
            <ToggleGroupItem 
              value="h3" 
              aria-label="Heading 3"
              data-state={editor.isActive('heading', { level: 3 }) ? "on" : "off"}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              <Heading3 className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          
          <ToggleGroup type="single" className="justify-start">
            <ToggleGroupItem 
              value="bulletList" 
              aria-label="Bullet List"
              data-state={editor.isActive('bulletList') ? "on" : "off"}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            
            <ToggleGroupItem 
              value="orderedList" 
              aria-label="Ordered List"
              data-state={editor.isActive('orderedList') ? "on" : "off"}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          
          <Popover open={linkOpen} onOpenChange={setLinkOpen}>
            <PopoverTrigger asChild>
              <Toggle 
                aria-label="Link"
                pressed={editor.isActive('link')}
                className="h-9 w-9 p-2"
              >
                <LinkIcon className="h-4 w-4" />
              </Toggle>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="flex flex-col space-y-2">
                <Input
                  placeholder="Enter URL"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLinkOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={setLink}
                    disabled={!linkUrl && !editor.isActive('link')}
                  >
                    {editor.isActive('link') ? 'Update' : 'Add'} Link
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <EditorContent 
        editor={editor} 
        className="prose prose-sm dark:prose-invert w-full border border-input rounded-md p-4 min-h-[250px]" 
      />
    </div>
  );
} 