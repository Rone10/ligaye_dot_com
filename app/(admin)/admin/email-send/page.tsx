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
  const allTemplateNames = filenames
    .filter(file => file.endsWith('.tsx'))
    .map(file => file.replace('.tsx', ''));

  // Filter to only show the launch promo template
  const templateNames = allTemplateNames.filter(template => 
    template === 'EmployerLaunchPromo'
  );

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Launch Email Campaign</CardTitle>
          <CardDescription>
            Send the launch promotion email to potential employer clients. Upload a JSON file with employer contact details (name and email) and launch your marketing campaign with the exclusive 2-month free offer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailSendForm templates={templateNames} />
        </CardContent>
      </Card>
    </main>
  );
}
