'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDropzone } from 'react-dropzone';
import { useCallback, useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  contactsFileSchema,
  sendEmailFormSchema,
  TContact,
} from '../_utils/validation';
import { sendBulkEmails } from '../_actions';
import { Loader2, Eye, Mail, Rocket } from 'lucide-react';

interface EmailSendFormProps {
  templates: string[];
}

const formSchema = sendEmailFormSchema.omit({ contacts: true });
type FormValues = z.infer<typeof formSchema>;

// Template preview content - only showing the launch promo template
const templatePreviews: Record<string, { title: string; description: string; content: string }> = {
  EmployerLaunchPromo: {
    title: 'Employer Launch Promotion',
    description: 'Marketing email for potential employer clients during platform launch with 2 months free offer',
    content: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8faff; padding: 20px 0;">
        <div style="background-color: #ffffff; border: 1px solid #e1e5f2; border-radius: 12px; margin: 0 auto; padding: 40px 30px; max-width: 600px;">
                      <div style="text-align: center; margin: 32px 0;">
              <img src="/full_logo_branding.png" alt="Ligaye.com" style="width: 400px; height: 200px; object-fit: contain; margin: 0 auto; display: block;" />
            </div>
          
          <h1 style="color: #1a1e2d; font-size: 28px; font-weight: 700; text-align: center; margin: 30px 0 20px 0; line-height: 1.3;">
            🚀 Welcome to the Future of Recruitment in The Gambia!
          </h1>
          
          <p style="color: #1a1e2d; font-size: 18px; font-weight: 600; margin: 20px 0 10px 0;">
            Dear John Doe,
          </p>
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 16px 0;">
            We're excited to introduce you to <strong>Ligaye</strong> - The Gambia's newest and most innovative talent marketplace, designed specifically for connecting with talent and forward-thinking employers like yourself.
          </p>

          <div style="background-color: #e9efff; border: 2px solid #4a6cfa; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="color: #4a6cfa; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
              🎉 EXCLUSIVE LAUNCH OFFER
            </p>
            <p style="color: #1a1e2d; font-size: 20px; font-weight: 700; margin: 0 0 8px 0; line-height: 1.4;">
              <strong>2 MONTHS OF FREE JOB POSTING</strong><br/>
              Valid from June 1, 2025 to July 30, 2025
            </p>
            <p style="color: #4a6cfa; font-size: 14px; font-weight: 500; margin: 0; font-style: italic;">
              Be among the first employers to discover top talent!
            </p>
          </div>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 16px 0;">
            As we launch this groundbreaking platform, we're looking for visionary employers who want to be part of revolutionizing how recruitment works in The Gambia. Here's what makes Ligaye different:
          </p>

          <div style="margin: 20px 0;">
            <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 8px 0;">✅ <strong>Local Focus:</strong> Built specifically for the Gambian job market</p>
            <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 8px 0;">✅ <strong>Flexible Payment Options:</strong> Pay online with Stripe or cash payments</p>
            <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 8px 0;">✅ <strong>Smart Matching:</strong> Advanced filters to find the right candidates</p>
            <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 8px 0;">✅ <strong>Easy Management:</strong> Simple dashboard to track applications</p>
            <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 8px 0;">✅ <strong>Tenders & Procurement:</strong> Post and manage tender opportunities</p>
            <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 8px 0;">✅ <strong>Mobile Optimized:</strong> Reach candidates wherever they are</p>
            <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 8px 0;">✅ <strong>Mobile App:</strong> Coming soon for even better accessibility</p>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="#" style="background-color: #4a6cfa; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 18px; font-weight: 600; display: inline-block;">
              Claim Your FREE 2 Months Now
            </a>
          </div>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 32px 0 24px 0;">
            Best regards,<br />
            <strong>The Ligaye Launch Team</strong><br />
            <em>Where Talent Meets Opportunity</em>
          </p>

          <div style="border-top: 1px solid #e1e5f2; padding-top: 20px; margin-top: 32px;">
            <p style="color: #9aa3bc; font-size: 13px; line-height: 1.5; text-align: center; margin: 8px 0;">
              Questions? Reply to this email or visit our website for more information.
            </p>
            <p style="color: #9aa3bc; font-size: 13px; line-height: 1.5; text-align: center; margin: 8px 0;">
              Ligaye - Proudly Gambian, Globally Competitive
            </p>
          </div>
        </div>
      </div>
    `
  }
};

export function EmailSendForm({ templates }: EmailSendFormProps) {
  const [isPending, startTransition] = useTransition();
  const [uploadedContacts, setUploadedContacts] = useState<TContact[]>([]);
  const [fileName, setFileName] = useState<string>('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateName: '',
      subject: '',
    },
  });

  const selectedTemplate = form.watch('templateName');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onabort = () => toast.error('File reading was aborted.');
    reader.onerror = () => toast.error('File reading has failed.');
    reader.onload = () => {
      try {
        const binaryStr = reader.result as string;
        const parsed = JSON.parse(binaryStr);
        const validation = contactsFileSchema.safeParse(parsed);

        if (validation.success) {
          setUploadedContacts(validation.data);
          toast.success(
            `Successfully validated ${validation.data.length} contacts.`
          );
        } else {
          setUploadedContacts([]);
          setFileName('');
          console.error(validation.error.flatten().fieldErrors);
          toast.error('Invalid JSON structure.', {
            description: 'Please check the file and try again.',
          });
        }
      } catch (error) {
        setUploadedContacts([]);
        setFileName('');
        toast.error('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.json'] },
    multiple: false,
  });

  function onSubmit(values: FormValues) {
    if (uploadedContacts.length === 0) {
      toast.warning('Please upload a valid contacts file before sending.');
      return;
    }

    startTransition(async () => {
      const result = await sendBulkEmails({
        ...values,
        contacts: uploadedContacts,
      });

      if (result.success) {
        toast.success(result.message);
        form.reset();
        setUploadedContacts([]);
        setFileName('');
      } else {
        toast.error(result.message);
      }
    });
  }

  // Render the selected template preview
  const renderTemplatePreview = () => {
    if (!selectedTemplate || !templatePreviews[selectedTemplate]) {
      return null;
    }

    const preview = templatePreviews[selectedTemplate];
    
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Launch Campaign Preview
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {preview.description}
          </p>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 border-b flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{preview.title}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                Preview with sample data
              </span>
            </div>
            <div 
              className="bg-white"
              dangerouslySetInnerHTML={{ __html: preview.content }}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Subject</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. 🚀 Introducing Ligaye - 2 Months FREE Job Posting!" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Suggested: "🚀 Introducing Ligaye - 2 Months FREE Job Posting for Launch Partners!"
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="templateName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Template</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the launch campaign template" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template} value={template}>
                        {templatePreviews[template]?.title || template}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Currently showing only the launch campaign template for employer outreach.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>Employer Contacts File</FormLabel>
            <div
              {...getRootProps()}
              className="mt-2 flex justify-center rounded-lg border border-dashed border-input px-6 py-10 text-center cursor-pointer hover:border-primary"
            >
              <div className="text-center">
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Drop the file here ...</p>
                ) : (
                  <p>
                    Drag 'n' drop a JSON file here, or click to select a file
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  JSON file with an array of {'{name, email}'} objects for potential employer clients.
                </p>
                {fileName && (
                  <p className="mt-4 text-sm font-medium text-green-600">
                    {fileName} ({uploadedContacts.length} employer contacts)
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending || uploadedContacts.length === 0}
            className="w-full"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Rocket className="mr-2 h-4 w-4" />
            Launch Email Campaign
          </Button>
        </form>
      </Form>

      {/* Template Preview Section */}
      {renderTemplatePreview()}
    </div>
  );
}
