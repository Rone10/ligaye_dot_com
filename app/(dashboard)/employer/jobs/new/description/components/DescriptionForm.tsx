'use client';

import { useJobForm } from "../../components/JobFormProvider";
import { JobFormFooter } from "../../components/JobFormFooter";
import { FormStepGuard } from "../../components/FormStepGuard";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "../../basics/components/FormField";
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading2,
  Underline as UnderlineIcon,
  HelpCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Experience level options
const experienceLevels = [
  { value: 'ENTRY_LEVEL', label: 'Entry level (0-1 years)' },
  { value: 'JUNIOR', label: 'Junior (1-3 years)' },
  { value: 'MID_LEVEL', label: 'Mid-level (3-5 years)' },
  { value: 'SENIOR', label: 'Senior (5+ years)' },
  { value: 'EXECUTIVE', label: 'Executive' },
  { value: 'NOT_SPECIFIED', label: 'Not specified' },
];

// Education level options
const educationLevels = [
  { value: 'NONE', label: 'No formal education required' },
  { value: 'PRIMARY', label: 'Primary education' },
  { value: 'SECONDARY', label: 'Secondary education' },
  { value: 'VOCATIONAL', label: 'Vocational training' },
  { value: 'BACHELORS', label: 'Bachelor\'s degree' },
  { value: 'MASTERS', label: 'Master\'s degree' },
  { value: 'DOCTORATE', label: 'Doctorate degree' },
  { value: 'CERTIFICATION', label: 'Professional certification' },
  { value: 'NOT_SPECIFIED', label: 'Not specified' },
];

// Editor CSS styles
const editorStyles = `
  .ProseMirror {
    min-height: 350px;
    padding: 1rem;
    outline: none;
  }
  
  .ProseMirror p {
    margin-bottom: 0.75rem;
  }
  
  .ProseMirror h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }
  
  .ProseMirror ul {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .ProseMirror ol {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .ProseMirror li {
    margin-bottom: 0.25rem;
  }
  
  .ProseMirror li p {
    margin: 0;
  }
  
  .help-tooltip {
    position: absolute;
    bottom: 8px;
    right: 36px;
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 0.75rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    z-index: 50;
    max-width: 250px;
  }
  
  .help-icon {
    position: absolute;
    bottom: 8px;
    right: 8px;
    color: #64748b;
    opacity: 0.6;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  
  .help-icon:hover {
    opacity: 1;
  }
`;

// Rich text editor component
function RichTextEditor({ 
  value, 
  onChange, 
  placeholder 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder?: string 
}) {
  const [showHelp, setShowHelp] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Start typing...',
      }),
      Underline,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });
  
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);
  
  if (!editor) {
    return null;
  }
  
  return (
    <div className="relative border rounded-md overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: editorStyles }} />
      
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-slate-50">
        <div className="flex items-center gap-1 pr-2 border-r">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-slate-200' : ''}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-slate-200' : ''}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'bg-slate-200' : ''}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-1 pl-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-slate-200' : ''}
            title="Heading"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-slate-200' : ''}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-slate-200' : ''}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Editor Content */}
      <div 
        className="min-h-[400px] bg-white"
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>
      
      {/* Help Button & Tooltip */}
      <div 
        className="help-icon"
        onClick={(e) => {
          e.stopPropagation();
          setShowHelp(!showHelp);
        }}
      >
        <HelpCircle size={16} />
      </div>
      
      {showHelp && (
        <div className="help-tooltip">
          <p className="font-semibold mb-1">Editor Tips:</p>
          <ul className="list-disc pl-4 text-xs space-y-1">
            <li>Lists (bullet or numbered) apply to entire paragraphs</li>
            <li>Press Enter to create a new list item</li>
            <li>Press Enter twice to exit a list</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export function DescriptionForm() {
  const { state, dispatch } = useJobForm();
  const { formData, errors } = state;

  const handleFieldChange = (field: string, value: any) => {
    dispatch({ type: 'SET_FIELD', field, value });
  };

  return (
    <FormStepGuard requiredStep={4}>
      <form className="space-y-8">
        <FormField 
          label="Job Description" 
          error={errors.description}
          required
          description="Provide a detailed description of job responsibilities, day-to-day activities, and the team structure"
        >
          <RichTextEditor
            value={formData.description || ''}
            onChange={(value) => handleFieldChange('description', value)}
            placeholder="Describe the position in detail..."
          />
        </FormField>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField 
            label="Experience Level" 
            error={errors.experienceLevel}
            description="The overall experience level required for this role"
          >
            <Select 
              value={formData.experienceLevel || ''} 
              onValueChange={(value) => handleFieldChange('experienceLevel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                {experienceLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField 
            label="Education Requirements" 
            error={errors.educationRequirements}
            description="The minimum education level required"
          >
            <Select 
              value={formData.educationRequirements || ''} 
              onValueChange={(value) => handleFieldChange('educationRequirements', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent>
                {educationLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField 
          label="Experience Requirements" 
          error={errors.experienceRequirements}
          description="Specific experience requirements or qualifications for this role"
        >
          <Textarea
            id="experienceRequirements"
            placeholder="Describe specific experience requirements..."
            className="h-32"
            value={formData.experienceRequirements || ''}
            onChange={(e) => handleFieldChange('experienceRequirements', e.target.value)}
          />
        </FormField>

        <JobFormFooter />
      </form>
    </FormStepGuard>
  );
} 