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
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PenSquare, Rocket } from 'lucide-react';

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
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Rocket className="h-6 w-6" />
          Email Management
        </h1>
        <Link href="/admin/email-compose">
          <Button variant="outline" size="sm">
            <PenSquare className="h-4 w-4 mr-2" />
            Compose Individual Email
          </Button>
        </Link>
      </div>

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
