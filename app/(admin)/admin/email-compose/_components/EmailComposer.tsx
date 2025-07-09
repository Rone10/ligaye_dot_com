'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { individualEmailFormSchema, TIndividualEmailForm } from '../_utils/validation';
import { Send, Save, FileText, Loader2 } from 'lucide-react';
import { EmailPreview } from './EmailPreview';
import { useTransition } from 'react';
import { sendIndividualEmail, saveDraft, loadDraft } from '../_actions';

interface EmailComposerProps {
  templates?: Array<{ value: string; label: string }>;
  draftId?: string;
}

export function EmailComposer({ templates, draftId }: EmailComposerProps) {
  const [isPending, startTransition] = useTransition();
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [lastSavedDraftId, setLastSavedDraftId] = useState<string | undefined>(draftId);

  const form = useForm<TIndividualEmailForm>({
    resolver: zodResolver(individualEmailFormSchema),
    defaultValues: {
      recipient: '',
      subject: '',
      bodyHtml: '',
      bodyText: '',
      cc: '',
      bcc: '',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  // Load draft if draftId is provided
  useEffect(() => {
    if (draftId) {
      startTransition(async () => {
        const result = await loadDraft(draftId);
        if (result.success && result.data) {
          form.reset({
            recipient: result.data.recipient || '',
            subject: result.data.subject || '',
            bodyHtml: result.data.bodyHtml || '',
            bodyText: result.data.bodyText || '',
            cc: result.data.cc || '',
            bcc: result.data.bcc || '',
          });
        } else {
          toast.error('Failed to load draft');
        }
      });
    }
  }, [draftId, form]);

  // Auto-save draft every 30 seconds
  const autoSaveDraft = useCallback(async () => {
    const values = form.getValues();
    // Only save if there's content
    if (values.recipient || values.subject || values.bodyHtml) {
      setIsSavingDraft(true);
      const result = await saveDraft({
        id: lastSavedDraftId,
        ...values,
      });
      setIsSavingDraft(false);
      
      if (result.success && result.data) {
        setLastSavedDraftId(result.data.id);
      }
    }
  }, [form, lastSavedDraftId]);

  useEffect(() => {
    const interval = setInterval(autoSaveDraft, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [autoSaveDraft]);

  // Handle template selection
  const handleTemplateChange = (templateValue: string) => {
    setSelectedTemplate(templateValue);
    // TODO: Load template content and populate form
    toast.info('Template loading will be implemented');
  };

  // Convert plain text to basic HTML
  const convertToHtml = (text: string) => {
    return text
      .split('\n\n')
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('\n');
  };

  // Handle form submission
  async function onSubmit(values: TIndividualEmailForm) {
    startTransition(async () => {
      const result = await sendIndividualEmail(values);
      
      if (result.success) {
        toast.success('Email sent successfully!');
        form.reset();
        setLastSavedDraftId(undefined);
      } else {
        toast.error(result.message || 'Failed to send email');
      }
    });
  }

  // Handle manual draft save
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    const values = form.getValues();
    const result = await saveDraft({
      id: lastSavedDraftId,
      ...values,
    });
    setIsSavingDraft(false);
    
    if (result.success && result.data) {
      setLastSavedDraftId(result.data.id);
      toast.success('Draft saved successfully');
    } else {
      toast.error('Failed to save draft');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Email Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Compose Email</span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isSavingDraft && (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Saving...</span>
                </>
              )}
              {lastSavedDraftId && !isSavingDraft && (
                <span>Draft saved</span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Template Selection */}
              {templates && templates.length > 0 && (
                <FormItem>
                  <FormLabel>Email Template (Optional)</FormLabel>
                  <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template to start from" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.value} value={template.value}>
                          {template.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose a template as a starting point for your email
                  </FormDescription>
                </FormItem>
              )}

              {/* Recipient */}
              <FormField
                control={form.control}
                name="recipient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="recipient@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CC */}
              <FormField
                control={form.control}
                name="cc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CC (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="cc1@example.com, cc2@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Separate multiple emails with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* BCC */}
              <FormField
                control={form.control}
                name="bcc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BCC (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="bcc1@example.com, bcc2@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Separate multiple emails with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subject */}
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Email subject" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Body */}
              <FormField
                control={form.control}
                name="bodyHtml"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Type your email content here..."
                        className="min-h-[300px] font-mono"
                        {...field}
                        onChange={(e) => {
                          const plainText = e.target.value;
                          field.onChange(convertToHtml(plainText));
                          setValue('bodyText', plainText);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Your email will be formatted with proper HTML styling
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Email
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft}
                >
                  {isSavingDraft ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Draft
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Email Preview */}
      <EmailPreview
        recipient={watchedValues.recipient}
        subject={watchedValues.subject}
        bodyHtml={watchedValues.bodyHtml}
        cc={watchedValues.cc}
        bcc={watchedValues.bcc}
      />
    </div>
  );
}