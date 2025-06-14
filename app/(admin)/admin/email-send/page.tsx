import { promises as fs } from 'fs';
import path from 'path';
import { EmailSendForm } from './_components/EmailSendForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// This component reads the available email templates from the `emails` directory
// and passes the list to the client-side form component.
export default async function AdminEmailSendPage() {
  const templatesDirectory = path.join(process.cwd(), 'emails');
  const filenames = await fs.readdir(templatesDirectory);
  const templateNames = filenames
    .filter(file => file.endsWith('.tsx'))
    .map(file => file.replace('.tsx', ''));

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Send Bulk Emails</CardTitle>
          <CardDescription>
            Select a template, upload a JSON file with contact details, and send
            a campaign. The JSON file should be an array of objects, with each
            object having a 'name' and 'email' property.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailSendForm templates={templateNames} />
        </CardContent>
      </Card>
    </main>
  );
}
