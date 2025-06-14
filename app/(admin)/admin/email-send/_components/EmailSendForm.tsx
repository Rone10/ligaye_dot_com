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
import { useDropzone } from 'react-dropzone';
import { useCallback, useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  contactsFileSchema,
  sendEmailFormSchema,
  TContact,
} from '../_utils/validation';
import { sendBulkEmails } from '../_actions';
import { Loader2 } from 'lucide-react';

interface EmailSendFormProps {
  templates: string[];
}

const formSchema = sendEmailFormSchema.omit({ contacts: true });
type FormValues = z.infer<typeof formSchema>;

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Subject</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Exciting News!" {...field} />
              </FormControl>
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
                    <SelectValue placeholder="Select a template to use" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template} value={template}>
                      {template}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Contacts File</FormLabel>
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
                JSON file with an array of {'{name, email}'} objects.
              </p>
              {fileName && (
                <p className="mt-4 text-sm font-medium text-green-600">
                  {fileName} ({uploadedContacts.length} contacts)
                </p>
              )}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending || uploadedContacts.length === 0}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Email Campaign
        </Button>
      </form>
    </Form>
  );
}
